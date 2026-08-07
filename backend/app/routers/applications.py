from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import dumps, get_current_user, loads
from app.models import Application, User
from app.schemas import ApplicationIn, ApplicationsOut
from app.utils.security import new_id

router = APIRouter(tags=["applications"])


@router.post("/applications", response_model=ApplicationsOut, status_code=201)
def create_application(
    body: ApplicationIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApplicationsOut:
    payload = body.model_dump()
    payload["id"] = new_id(6)
    payload["appliedAt"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    row = Application(id=payload["id"], user_id=user.id, data_json=dumps(payload))
    db.add(row)
    db.commit()

    apps = db.scalars(
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
    ).all()
    return ApplicationsOut(applications=[loads(a.data_json, {}) for a in apps])


@router.get("/applications", response_model=ApplicationsOut)
def list_applications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApplicationsOut:
    apps = db.scalars(
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
    ).all()
    return ApplicationsOut(applications=[loads(a.data_json, {}) for a in apps])
