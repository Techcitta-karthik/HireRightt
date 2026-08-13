from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import AuthContext, get_auth_context, require_roles, write_audit
from app.models import Application, Job, MembershipRole
from app.schemas import JobIn
from app.utils.security import new_id

router = APIRouter(prefix="/jobs", tags=["jobs"])
RECRUITER_ROLES = (MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.RECRUITER)


def job_payload(row: Job, applicant_count: int | None = None) -> dict[str, Any]:
    result = {
        "id": row.id,
        "title": row.title,
        "department": row.department,
        "location": row.location,
        "employmentType": row.employment_type,
        "salaryRange": row.salary_range,
        "minExperienceYears": row.min_experience_years,
        "requiredSkills": row.required_skills,
        "preferredSkills": row.preferred_skills,
        "description": row.description,
        "status": row.status,
        "createdAt": row.created_at.isoformat(),
    }
    if applicant_count is not None:
        result["applicantsCount"] = applicant_count
    return result


@router.get("", response_model=dict)
def list_jobs(
    job_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    filters = [Job.organization_id == context.organization_id]
    if job_status:
        filters.append(Job.status == job_status.lower())
    total = db.scalar(select(func.count()).select_from(Job).where(*filters)) or 0
    rows = db.scalars(
        select(Job).where(*filters).order_by(Job.created_at.desc()).limit(limit).offset(offset)
    ).all()
    counts = dict(
        db.execute(
            select(Application.job_id, func.count(Application.id))
            .where(Application.organization_id == context.organization_id, Application.job_id.is_not(None))
            .group_by(Application.job_id)
        ).all()
    )
    return {"jobs": [job_payload(row, counts.get(row.id, 0)) for row in rows], "total": total}


@router.get("/{job_id}", response_model=dict)
def get_job(
    job_id: str,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    row = db.scalar(select(Job).where(Job.id == job_id, Job.organization_id == context.organization_id))
    if not row:
        raise HTTPException(status_code=404, detail="Job not found")
    count = db.scalar(select(func.count()).select_from(Application).where(Application.job_id == row.id)) or 0
    return job_payload(row, count)


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_job(
    body: JobIn,
    request: Request,
    context: AuthContext = Depends(require_roles(*RECRUITER_ROLES)),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    row = Job(
        id=new_id(),
        organization_id=context.organization_id,
        title=body.title,
        department=body.department,
        location=body.location,
        employment_type=body.employmentType,
        salary_range=body.salaryRange,
        min_experience_years=body.minExperienceYears,
        required_skills=body.requiredSkills,
        preferred_skills=body.preferredSkills,
        description=body.description,
        status=body.status,
        created_by_id=context.user.id,
    )
    db.add(row)
    write_audit(db, context, request, action="job.created", resource_type="job", resource_id=row.id)
    db.commit()
    return job_payload(row, 0)


@router.put("/{job_id}", response_model=dict)
def update_job(
    job_id: str,
    body: JobIn,
    request: Request,
    context: AuthContext = Depends(require_roles(*RECRUITER_ROLES)),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    row = db.scalar(select(Job).where(Job.id == job_id, Job.organization_id == context.organization_id))
    if not row:
        raise HTTPException(status_code=404, detail="Job not found")
    row.title = body.title
    row.department = body.department
    row.location = body.location
    row.employment_type = body.employmentType
    row.salary_range = body.salaryRange
    row.min_experience_years = body.minExperienceYears
    row.required_skills = body.requiredSkills
    row.preferred_skills = body.preferredSkills
    row.description = body.description
    row.status = body.status
    write_audit(db, context, request, action="job.updated", resource_type="job", resource_id=row.id)
    db.commit()
    return job_payload(row)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_job(
    job_id: str,
    request: Request,
    context: AuthContext = Depends(require_roles(*RECRUITER_ROLES)),
    db: Session = Depends(get_db),
) -> None:
    row = db.scalar(select(Job).where(Job.id == job_id, Job.organization_id == context.organization_id))
    if not row:
        raise HTTPException(status_code=404, detail="Job not found")
    # Preserve application history; close is the recoverable SaaS-safe delete behavior.
    row.status = "closed"
    write_audit(db, context, request, action="job.closed", resource_type="job", resource_id=row.id)
    db.commit()
