from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import dumps, get_current_user, loads
from app.models import Application, InterviewResult, Profile, User
from app.schemas import MeOut, ProfileOut, UserOut
from app.utils.security import utcnow

router = APIRouter(tags=["profile"])


@router.get("/me", response_model=MeOut)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MeOut:
    profile_row = db.get(Profile, user.id)
    interview_row = db.scalar(
        select(InterviewResult)
        .where(InterviewResult.user_id == user.id)
        .order_by(InterviewResult.created_at.desc())
    )
    apps = db.scalars(
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
    ).all()

    return MeOut(
        user=UserOut(id=user.id, name=user.name, email=user.email),
        profile=loads(profile_row.data_json, {}) if profile_row else None,
        interview=loads(interview_row.data_json) if interview_row else None,
        applications=[loads(a.data_json, {}) for a in apps],
    )


@router.put("/profile", response_model=ProfileOut)
def upsert_profile(
    body: dict[str, Any],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileOut:
    row = db.get(Profile, user.id)
    previous = loads(row.data_json, {}) if row else {}
    merged = {
        **previous,
        **body,
        "updatedAt": utcnow().isoformat(),
    }
    if row:
        row.data_json = dumps(merged)
    else:
        row = Profile(user_id=user.id, data_json=dumps(merged))
        db.add(row)
    db.commit()
    return ProfileOut(profile=merged)
