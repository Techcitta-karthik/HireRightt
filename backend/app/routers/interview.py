from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import dumps, get_current_user, loads
from app.models import InterviewResult, InterviewSession, Profile, User
from app.schemas import (
    IntegrityIn,
    IntegrityOut,
    InterviewSaveOut,
    InterviewScoreIn,
    InterviewStartIn,
    InterviewStartOut,
    QuestionOut,
)
from app.services.interview_agent import build_questions, score_session, summarize_profile
from app.utils.security import new_id

router = APIRouter(tags=["interview"])


@router.post("/interview", response_model=InterviewSaveOut)
def save_interview(
    body: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSaveOut:
    row = InterviewResult(
        user_id=user.id,
        data_json=dumps(body),
        overall=int(body.get("overall") or 0),
    )
    db.add(row)
    db.commit()
    return InterviewSaveOut(interview=body)


@router.post("/interview/start", response_model=InterviewStartOut)
def start_interview(
    body: InterviewStartIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewStartOut:
    stored = db.get(Profile, user.id)
    stored_profile = loads(stored.data_json, {}) if stored else {}
    profile = {**stored_profile, **(body.profile or {}), "name": body.profile.get("name") or user.name}

    questions = build_questions(body.role, body.level, profile, name=user.name.split(" ")[0])
    session_id = new_id(12)
    session = InterviewSession(
        id=session_id,
        user_id=user.id,
        role=body.role,
        level=body.level,
        status="active",
        agent="python-resume-agent",
        questions_json=dumps(questions),
        answers_json=dumps([]),
        integrity_json=dumps(
            {"faceViolations": 0, "singlePersonOk": True, "maxFacesSeen": 1}
        ),
    )
    db.add(session)
    db.commit()

    q_models = [QuestionOut(**q) for q in questions]
    return InterviewStartOut(
        sessionId=session_id,
        agent="python-resume-agent",
        llm=False,
        total=len(questions),
        questionIndex=0,
        question=q_models[0],
        questions=q_models,
        profileDigest=summarize_profile(profile, name=user.name),
    )


@router.post("/interview/integrity", response_model=IntegrityOut)
def interview_integrity(
    body: IntegrityIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> IntegrityOut:
    session = db.get(InterviewSession, body.sessionId)
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    integrity = loads(session.integrity_json, {})
    integrity["maxFacesSeen"] = max(int(integrity.get("maxFacesSeen") or 1), int(body.faceCount))
    if body.faceCount != 1:
        integrity["faceViolations"] = int(integrity.get("faceViolations") or 0) + 1
        integrity["singlePersonOk"] = False
    session.integrity_json = dumps(integrity)
    db.commit()
    return IntegrityOut(integrity=integrity)


@router.post("/interview/score", response_model=InterviewSaveOut)
def score_interview(
    body: InterviewScoreIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSaveOut:
    session = db.get(InterviewSession, body.sessionId) if body.sessionId else None
    if body.sessionId and (not session or session.user_id != user.id):
        raise HTTPException(status_code=404, detail="Interview session not found.")

    stored = db.get(Profile, user.id)
    stored_profile = loads(stored.data_json, {}) if stored else {}
    profile = {**stored_profile, **(body.profile or {}), "name": body.profile.get("name") or user.name}

    questions = body.questions or (loads(session.questions_json, []) if session else [])
    if not questions:
        raise HTTPException(status_code=400, detail="Questions required to score interview.")

    integrity = {
        **(loads(session.integrity_json, {}) if session else {}),
        **(body.integrity or {}),
    }

    result = score_session(
        role=body.role or (session.role if session else "Full Stack Engineer"),
        level=body.level or (session.level if session else "1–3 years"),
        questions=questions,
        answers=body.answers or [],
        profile=profile,
        integrity=integrity,
        name=user.name,
    )

    db.add(
        InterviewResult(
            user_id=user.id,
            data_json=dumps(result),
            overall=int(result.get("overall") or 0),
        )
    )
    if session:
        session.status = "completed"
        session.answers_json = dumps(body.answers or [])
        session.result_json = dumps(result)
        session.integrity_json = dumps(integrity)
        session.completed_at = datetime.now(timezone.utc)
    db.commit()
    return InterviewSaveOut(interview=result)


@router.get("/interview/latest", response_model=InterviewSaveOut)
def latest_interview(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSaveOut:
    row = db.scalar(
        select(InterviewResult)
        .where(InterviewResult.user_id == user.id)
        .order_by(InterviewResult.created_at.desc())
    )
    if not row:
        raise HTTPException(status_code=404, detail="No interview result yet.")
    return InterviewSaveOut(interview=loads(row.data_json, {}))
