from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import AuthContext, require_roles
from app.models import Application, InterviewResult, Job, MembershipRole, Profile, User

router = APIRouter(prefix="/admin", tags=["admin"])
RECRUITER_ROLES = (MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.RECRUITER)


@router.get("/overview", response_model=dict)
def overview(
    context: AuthContext = Depends(require_roles(*RECRUITER_ROLES)),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    org_id = context.organization_id
    total_applications = (
        db.scalar(select(func.count()).select_from(Application).where(Application.organization_id == org_id))
        or 0
    )
    active_jobs = (
        db.scalar(
            select(func.count()).select_from(Job).where(Job.organization_id == org_id, Job.status == "active")
        )
        or 0
    )
    stages = dict(
        db.execute(
            select(Application.status, func.count(Application.id))
            .where(Application.organization_id == org_id)
            .group_by(Application.status)
        ).all()
    )
    avg_score = (
        db.scalar(select(func.avg(InterviewResult.overall)).where(InterviewResult.organization_id == org_id))
        or 0
    )
    return {
        "totalApplications": total_applications,
        "activeJobs": active_jobs,
        "averageInterviewScore": round(float(avg_score), 1),
        "pipeline": [{"stage": stage, "count": count} for stage, count in stages.items()],
    }


@router.get("/candidates", response_model=dict)
def candidates(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    context: AuthContext = Depends(require_roles(*RECRUITER_ROLES)),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    applications = db.scalars(
        select(Application)
        .where(Application.organization_id == context.organization_id)
        .order_by(Application.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    user_ids = {row.user_id for row in applications}
    users = (
        {row.id: row for row in db.scalars(select(User).where(User.id.in_(user_ids))).all()}
        if user_ids
        else {}
    )
    profiles = (
        {
            row.user_id: row.data
            for row in db.scalars(
                select(Profile).where(
                    Profile.organization_id == context.organization_id, Profile.user_id.in_(user_ids)
                )
            ).all()
        }
        if user_ids
        else {}
    )
    results: list[dict[str, Any]] = []
    for row in applications:
        user = users.get(row.user_id)
        profile = profiles.get(row.user_id, {})
        results.append(
            {
                "id": row.user_id,
                "applicationId": row.id,
                "name": user.name if user else "Candidate",
                "email": user.email if user else "",
                "currentTitle": profile.get("currentRole", ""),
                "location": profile.get("currentLocation", row.location),
                "skills": profile.get("skills", []),
                "stage": row.status,
                "appliedJobId": row.job_id,
                "overallMatchScore": row.match_score,
                "createdAt": row.created_at.isoformat(),
                "source": row.source,
            }
        )
    total = (
        db.scalar(
            select(func.count())
            .select_from(Application)
            .where(Application.organization_id == context.organization_id)
        )
        or 0
    )
    return {"candidates": results, "total": total}
