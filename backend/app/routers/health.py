from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app import __version__
from app.schemas import HealthOut

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    return HealthOut(
        ok=True,
        service="hireright-api",
        version=__version__,
        llm=False,
        engine="python-fastapi",
        features={
            "interviewAgent": True,
            "resumeAwareQuestions": True,
            "adaptiveScoring": True,
            "sqlitePersistence": True,
            "faceIntegrityClient": True,
        },
        time=datetime.now(timezone.utc),
    )
