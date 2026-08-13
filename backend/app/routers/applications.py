from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import AuthContext, get_auth_context, require_roles, write_audit
from app.models import Application, Job, MembershipRole
from app.schemas import ApplicationIn, ApplicationsOut, ApplicationStatusIn
from app.utils.security import new_id

router = APIRouter(tags=["applications"])


def application_payload(row: Application) -> dict[str, Any]:
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


@router.post("/applications", response_model=ApplicationsOut, status_code=status.HTTP_201_CREATED)
def create_application(
    body: ApplicationIn,
    request: Request,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> ApplicationsOut:
    if body.jobId:
        job = db.scalar(
            select(Job).where(Job.id == body.jobId, Job.organization_id == context.organization_id)
        )
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
    known = {"jobId", "title", "company", "location", "match", "status"}
    extra = {key: value for key, value in body.model_dump().items() if key not in known}
    row = Application(
        id=new_id(),
        organization_id=context.organization_id,
        user_id=context.user.id,
        job_id=body.jobId,
        title=body.title,
        company=body.company,
        location=body.location,
        match_score=body.match,
        status=body.status,
        extra_data=extra,
    )
    db.add(row)
    write_audit(
        db, context, request, action="application.created", resource_type="application", resource_id=row.id
    )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="You have already applied to this job") from None

    apps = db.scalars(
        select(Application)
        .where(Application.organization_id == context.organization_id, Application.user_id == context.user.id)
        .order_by(Application.created_at.desc())
    ).all()
    return ApplicationsOut(applications=[application_payload(item) for item in apps], total=len(apps))


@router.get("/applications", response_model=ApplicationsOut)
def list_applications(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> ApplicationsOut:
    where = (
        Application.organization_id == context.organization_id,
        Application.user_id == context.user.id,
    )
    total = db.scalar(select(func.count()).select_from(Application).where(*where)) or 0
    apps = db.scalars(
        select(Application).where(*where).order_by(Application.created_at.desc()).limit(limit).offset(offset)
    ).all()
    return ApplicationsOut(applications=[application_payload(item) for item in apps], total=total)


@router.patch("/applications/{application_id}/status", response_model=dict)
def update_application_status(
    application_id: str,
    body: ApplicationStatusIn,
    request: Request,
    context: AuthContext = Depends(
        require_roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.RECRUITER)
    ),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    row = db.scalar(
        select(Application).where(
            Application.id == application_id,
            Application.organization_id == context.organization_id,
        )
    )
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    previous = row.status
    row.status = body.status
    write_audit(
        db,
        context,
        request,
        action="application.status_updated",
        resource_type="application",
        resource_id=row.id,
        metadata={"from": previous, "to": body.status},
    )
    db.commit()
    return application_payload(row)
