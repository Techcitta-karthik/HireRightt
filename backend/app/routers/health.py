from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import __version__
from app.database import get_db
from app.schemas import HealthOut

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthOut)
def health(db: Session = Depends(get_db)) -> HealthOut:
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return HealthOut(
        version=__version__,
        features={
            "multiTenant": True,
            "rbac": True,
            "auditLog": True,
            "interviewAgent": True,
            "resumeAwareQuestions": True,
            "adaptiveScoring": True,
        },
        time=datetime.now(UTC),
    )


@router.get("/health/live")
def liveness() -> dict[str, bool]:
    return {"ok": True}
