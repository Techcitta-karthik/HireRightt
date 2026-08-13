from __future__ import annotations

from datetime import UTC

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import AuthContext, get_auth_context
from app.models import AuthSession, Membership, MembershipRole, Organization, User
from app.schemas import (
    AuthResponse,
    LoginIn,
    OrganizationOut,
    RefreshIn,
    SignupIn,
    UserOut,
)
from app.utils.security import (
    access_token_expiry,
    hash_password,
    hash_token,
    make_slug,
    new_id,
    new_token,
    refresh_token_expiry,
    utcnow,
    verify_password,
)

router = APIRouter(tags=["auth"])


def _user_out(user: User) -> UserOut:
    return UserOut(id=user.id, name=user.name, email=user.email)


def _org_out(org: Organization) -> OrganizationOut:
    return OrganizationOut(id=org.id, name=org.name, slug=org.slug, plan=org.plan)


def _unique_slug(db: Session, name: str) -> str:
    base = make_slug(name)
    slug = base
    counter = 2
    while db.scalar(select(Organization.id).where(Organization.slug == slug)):
        slug = f"{base[:70]}-{counter}"
        counter += 1
    return slug


def _issue_session(
    db: Session,
    request: Request,
    user: User,
    organization: Organization,
    role: str,
) -> AuthResponse:
    # Bound session growth. Oldest sessions are revoked first.
    active_sessions = db.scalars(
        select(AuthSession)
        .where(AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None))
        .order_by(AuthSession.created_at.desc())
    ).all()
    for old in active_sessions[settings.max_sessions_per_user - 1 :]:
        old.revoked_at = utcnow()

    access_token = new_token()
    refresh_token = new_token(48)
    session = AuthSession(
        id=new_id(),
        access_token_hash=hash_token(access_token),
        refresh_token_hash=hash_token(refresh_token),
        user_id=user.id,
        organization_id=organization.id,
        access_expires_at=access_token_expiry(),
        refresh_expires_at=refresh_token_expiry(),
        ip_address=request.client.host if request.client else None,
        user_agent=(request.headers.get("user-agent") or "")[:500] or None,
    )
    db.add(session)
    return AuthResponse(
        token=access_token,
        refreshToken=refresh_token,
        expiresIn=settings.access_token_minutes * 60,
        user=_user_out(user),
        organization=_org_out(organization),
        role=role,
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupIn, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    if not settings.signup_enabled:
        raise HTTPException(status_code=403, detail="New account registration is disabled")
    email = str(body.email).lower()
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    workspace_name = body.organizationName or f"{body.name}'s Workspace"
    user = User(id=new_id(), name=body.name, email=email, password_hash=hash_password(body.password))
    organization = Organization(
        id=new_id(), name=workspace_name, slug=_unique_slug(db, workspace_name), plan="free"
    )
    membership = Membership(
        id=new_id(),
        organization_id=organization.id,
        user_id=user.id,
        role=MembershipRole.OWNER.value,
    )
    db.add_all([user, organization, membership])
    response = _issue_session(db, request, user, organization, membership.role)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Account or workspace already exists") from None
    return response


@router.post("/login", response_model=AuthResponse)
def login(body: LoginIn, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == str(body.email).lower()))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    membership_query = select(Membership).where(Membership.user_id == user.id, Membership.status == "active")
    if body.organizationId:
        membership_query = membership_query.where(Membership.organization_id == body.organizationId)
    membership = db.scalar(membership_query.order_by(Membership.created_at))
    if not membership:
        raise HTTPException(status_code=403, detail="No active workspace membership")
    organization = db.get(Organization, membership.organization_id)
    if not organization or organization.status != "active":
        raise HTTPException(status_code=403, detail="Workspace is inactive")

    user.last_login_at = utcnow()
    response = _issue_session(db, request, user, organization, membership.role)
    db.commit()
    return response


@router.post("/auth/refresh", response_model=AuthResponse)
def refresh(body: RefreshIn, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    session = db.scalar(
        select(AuthSession).where(AuthSession.refresh_token_hash == hash_token(body.refreshToken))
    )
    if (
        not session
        or session.revoked_at
        or session.refresh_expires_at.replace(tzinfo=session.refresh_expires_at.tzinfo or UTC) <= utcnow()
    ):
        raise HTTPException(status_code=401, detail="Refresh token is expired or invalid")

    user = db.get(User, session.user_id)
    organization = db.get(Organization, session.organization_id)
    membership = db.scalar(
        select(Membership).where(
            Membership.user_id == session.user_id,
            Membership.organization_id == session.organization_id,
            Membership.status == "active",
        )
    )
    if not user or not organization or not membership or not user.is_active:
        raise HTTPException(status_code=403, detail="Account or workspace is inactive")

    # Rotate refresh tokens so replaying an old token cannot mint another session.
    session.revoked_at = utcnow()
    response = _issue_session(db, request, user, organization, membership.role)
    db.commit()
    return response


@router.post("/logout")
def logout(
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    context.session.revoked_at = utcnow()
    db.commit()
    return {"ok": True}


@router.post("/logout-all")
def logout_all(
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    db.execute(delete(AuthSession).where(AuthSession.user_id == context.user.id))
    db.commit()
    return {"ok": True}
