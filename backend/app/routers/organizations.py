from __future__ import annotations

from datetime import UTC, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import AuthContext, get_auth_context, require_roles, write_audit
from app.models import (
    Membership,
    MembershipRole,
    Organization,
    OrganizationInvitation,
    User,
)
from app.schemas import (
    InvitationAcceptIn,
    InvitationIn,
    InvitationOut,
    MemberOut,
    MemberRoleIn,
    OrganizationOut,
)
from app.utils.security import hash_token, new_id, new_token, utcnow

router = APIRouter(prefix="/organizations", tags=["organizations"])
ADMIN_ROLES = (MembershipRole.OWNER, MembershipRole.ADMIN)


@router.get("", response_model=list[OrganizationOut])
def list_organizations(
    context: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)
) -> list[OrganizationOut]:
    rows = (
        db.execute(
            select(Organization)
            .join(Membership, Membership.organization_id == Organization.id)
            .where(Membership.user_id == context.user.id, Membership.status == "active")
            .order_by(Organization.name)
        )
        .scalars()
        .all()
    )
    return [OrganizationOut(id=row.id, name=row.name, slug=row.slug, plan=row.plan) for row in rows]


@router.get("/current", response_model=OrganizationOut)
def current_organization(context: AuthContext = Depends(get_auth_context)) -> OrganizationOut:
    org = context.organization
    return OrganizationOut(id=org.id, name=org.name, slug=org.slug, plan=org.plan)


@router.get("/current/members", response_model=list[MemberOut])
def list_members(
    context: AuthContext = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db),
) -> list[MemberOut]:
    rows = db.execute(
        select(Membership, User)
        .join(User, User.id == Membership.user_id)
        .where(Membership.organization_id == context.organization_id)
        .order_by(Membership.created_at)
    ).all()
    return [
        MemberOut(
            id=membership.id,
            userId=user.id,
            name=user.name,
            email=user.email,
            role=membership.role,
            status=membership.status,
            createdAt=membership.created_at,
        )
        for membership, user in rows
    ]


@router.post("/current/invitations", response_model=InvitationOut, status_code=status.HTTP_201_CREATED)
def invite_member(
    body: InvitationIn,
    request: Request,
    context: AuthContext = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db),
) -> InvitationOut:
    email = str(body.email).lower()
    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user and db.scalar(
        select(Membership.id).where(
            Membership.organization_id == context.organization_id,
            Membership.user_id == existing_user.id,
        )
    ):
        raise HTTPException(status_code=409, detail="User is already a workspace member")
    pending = db.scalar(
        select(OrganizationInvitation).where(
            OrganizationInvitation.organization_id == context.organization_id,
            OrganizationInvitation.email == email,
            OrganizationInvitation.accepted_at.is_(None),
            OrganizationInvitation.expires_at > utcnow(),
        )
    )
    if pending:
        raise HTTPException(status_code=409, detail="An active invitation already exists")
    raw_token = new_token(36)
    row = OrganizationInvitation(
        id=new_id(),
        organization_id=context.organization_id,
        email=email,
        role=body.role,
        token_hash=hash_token(raw_token),
        invited_by_id=context.user.id,
        expires_at=utcnow() + timedelta(days=7),
    )
    db.add(row)
    write_audit(
        db,
        context,
        request,
        action="member.invited",
        resource_type="invitation",
        resource_id=row.id,
        metadata={"email": email, "role": body.role},
    )
    db.commit()
    return InvitationOut(
        id=row.id, email=row.email, role=row.role, expiresAt=row.expires_at, invitationToken=raw_token
    )


@router.post("/invitations/accept", response_model=OrganizationOut)
def accept_invitation(
    body: InvitationAcceptIn,
    request: Request,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> OrganizationOut:
    row = db.scalar(
        select(OrganizationInvitation).where(
            OrganizationInvitation.token_hash == hash_token(body.token),
            OrganizationInvitation.accepted_at.is_(None),
        )
    )
    if not row or row.expires_at.replace(tzinfo=row.expires_at.tzinfo or UTC) <= utcnow():
        raise HTTPException(status_code=400, detail="Invitation is expired or invalid")
    if row.email != context.user.email:
        raise HTTPException(status_code=403, detail="Invitation belongs to a different email address")
    membership = Membership(
        id=new_id(), organization_id=row.organization_id, user_id=context.user.id, role=row.role
    )
    db.add(membership)
    row.accepted_at = utcnow()
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="User is already a workspace member") from None
    organization = db.get(Organization, row.organization_id)
    assert organization is not None
    return OrganizationOut(
        id=organization.id, name=organization.name, slug=organization.slug, plan=organization.plan
    )


@router.patch("/current/members/{membership_id}", response_model=MemberOut)
def update_member_role(
    membership_id: str,
    body: MemberRoleIn,
    request: Request,
    context: AuthContext = Depends(require_roles(*ADMIN_ROLES)),
    db: Session = Depends(get_db),
) -> MemberOut:
    row = db.scalar(
        select(Membership).where(
            Membership.id == membership_id,
            Membership.organization_id == context.organization_id,
        )
    )
    if not row:
        raise HTTPException(status_code=404, detail="Membership not found")
    if row.role == MembershipRole.OWNER.value:
        raise HTTPException(status_code=409, detail="The workspace owner role cannot be changed")
    previous = row.role
    row.role = body.role
    write_audit(
        db,
        context,
        request,
        action="member.role_updated",
        resource_type="membership",
        resource_id=row.id,
        metadata={"from": previous, "to": body.role},
    )
    db.commit()
    user = db.get(User, row.user_id)
    assert user is not None
    return MemberOut(
        id=row.id,
        userId=user.id,
        name=user.name,
        email=user.email,
        role=row.role,
        status=row.status,
        createdAt=row.created_at,
    )
