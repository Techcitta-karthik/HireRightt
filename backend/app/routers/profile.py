from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import AuthContext, get_auth_context, write_audit
from app.models import Application, AuthSession, InterviewResult, Profile, User
from app.schemas import (
    AccountUpdateIn,
    MeOut,
    OrganizationOut,
    PreferencesIn,
    ProfileOut,
    UserOut,
)
from app.utils.security import hash_password, new_id, utcnow, verify_password

router = APIRouter(tags=["profile"])


def _profile(db: Session, context: AuthContext) -> Profile | None:
    return db.scalar(
        select(Profile).where(
            Profile.organization_id == context.organization_id,
            Profile.user_id == context.user.id,
        )
    )


def _application_payload(row: Application) -> dict[str, Any]:
    return {
        **(row.extra_data or {}),
        "id": row.id,
        "jobId": row.job_id,
        "title": row.title,
        "company": row.company,
        "location": row.location,
        "match": row.match_score,
        "status": row.status,
        "appliedAt": row.created_at.isoformat(),
    }


@router.get("/me", response_model=MeOut)
def me(context: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)) -> MeOut:
    profile_row = _profile(db, context)
    interview_row = db.scalar(
        select(InterviewResult)
        .where(
            InterviewResult.organization_id == context.organization_id,
            InterviewResult.user_id == context.user.id,
        )
        .order_by(InterviewResult.created_at.desc())
    )
    apps = db.scalars(
        select(Application)
        .where(
            Application.organization_id == context.organization_id,
            Application.user_id == context.user.id,
        )
        .order_by(Application.created_at.desc())
    ).all()

    return MeOut(
        user=UserOut(id=context.user.id, name=context.user.name, email=context.user.email),
        organization=OrganizationOut(
            id=context.organization.id,
            name=context.organization.name,
            slug=context.organization.slug,
            plan=context.organization.plan,
        ),
        role=context.membership.role,
        profile=profile_row.data if profile_row else None,
        interview=interview_row.data if interview_row else None,
        applications=[_application_payload(item) for item in apps],
    )


@router.put("/profile", response_model=ProfileOut)
def upsert_profile(
    body: dict[str, Any],
    request: Request,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> ProfileOut:
    # Limit arbitrary profile payloads while retaining the frontend's evolving wizard schema.
    if len(str(body)) > 1_000_000:
        raise HTTPException(status_code=413, detail="Profile payload is too large")
    row = _profile(db, context)
    merged = {**(row.data if row else {}), **body, "updatedAt": utcnow().isoformat()}
    if row:
        row.data = merged
    else:
        row = Profile(
            id=new_id(),
            organization_id=context.organization_id,
            user_id=context.user.id,
            data=merged,
        )
        db.add(row)
    write_audit(db, context, request, action="profile.updated", resource_type="profile", resource_id=row.id)
    db.commit()
    return ProfileOut(profile=merged)


@router.get("/account/preferences", response_model=PreferencesIn)
def get_preferences(context: AuthContext = Depends(get_auth_context)) -> PreferencesIn:
    return PreferencesIn.model_validate(context.user.preferences or {})


@router.put("/account/preferences", response_model=PreferencesIn)
def update_preferences(
    body: PreferencesIn,
    request: Request,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> PreferencesIn:
    context.user.preferences = body.model_dump()
    write_audit(
        db,
        context,
        request,
        action="account.preferences_updated",
        resource_type="user",
        resource_id=context.user.id,
    )
    db.commit()
    return body


@router.patch("/account", response_model=UserOut)
def update_account(
    body: AccountUpdateIn,
    request: Request,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> UserOut:
    user = context.user
    if not verify_password(body.currentPassword, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if body.email:
        email = str(body.email).lower()
        conflict = db.scalar(select(User.id).where(User.email == email, User.id != user.id))
        if conflict:
            raise HTTPException(status_code=409, detail="That email is already in use")
        user.email = email
        user.email_verified_at = None
    if body.name:
        user.name = body.name
    if body.newPassword:
        if not any(c.isalpha() for c in body.newPassword) or not any(c.isdigit() for c in body.newPassword):
            raise HTTPException(status_code=422, detail="New password must contain a letter and a number")
        user.password_hash = hash_password(body.newPassword)
        db.execute(
            delete(AuthSession).where(
                AuthSession.user_id == user.id,
                AuthSession.id != context.session.id,
            )
        )
    write_audit(db, context, request, action="account.updated", resource_type="user", resource_id=user.id)
    db.commit()
    return UserOut(id=user.id, name=user.name, email=user.email)
