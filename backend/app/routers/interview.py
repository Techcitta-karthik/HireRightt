from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import AuthContext, get_auth_context, write_audit
from app.models import InterviewResult, InterviewSession, Profile
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

router = APIRouter(tags=["interviews"])


def _profile(db: Session, context: AuthContext) -> dict:
    row = db.scalar(
        select(Profile).where(
            Profile.organization_id == context.organization_id,
            Profile.user_id == context.user.id,
        )
    )
    return row.data if row else {}


@router.post("/interview", response_model=InterviewSaveOut)
def save_interview(
    body: dict,
    request: Request,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> InterviewSaveOut:
    overall = int(body.get("overall") or 0)
    if not 0 <= overall <= 100:
        raise HTTPException(status_code=422, detail="overall must be between 0 and 100")
    row = InterviewResult(
        id=new_id(),
        organization_id=context.organization_id,
        user_id=context.user.id,
        data=body,
        overall=overall,
    )
    db.add(row)
    write_audit(
        db, context, request, action="interview.saved", resource_type="interview_result", resource_id=row.id
    )
    db.commit()
    return InterviewSaveOut(interview=body)


@router.post("/interview/start", response_model=InterviewStartOut)
def start_interview(
    body: InterviewStartIn,
    request: Request,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> InterviewStartOut:
    profile = {**_profile(db, context), **body.profile, "name": body.profile.get("name") or context.user.name}
    questions = build_questions(body.role, body.level, profile, name=context.user.name.split(" ")[0])
    if not questions:
        raise HTTPException(status_code=500, detail="Could not generate interview questions")
    session = InterviewSession(
        id=new_id(),
        organization_id=context.organization_id,
        user_id=context.user.id,
        role=body.role,
        level=body.level,
        questions=questions,
        answers=[],
        integrity={"faceViolations": 0, "singlePersonOk": True, "maxFacesSeen": 1},
    )
    db.add(session)
    write_audit(
        db,
        context,
        request,
        action="interview.started",
        resource_type="interview_session",
        resource_id=session.id,
    )
    db.commit()

    question_models = [QuestionOut(**question) for question in questions]
    return InterviewStartOut(
        sessionId=session.id,
        agent=session.agent,
        total=len(question_models),
        question=question_models[0],
        questions=question_models,
        profileDigest=summarize_profile(profile, name=context.user.name),
    )


@router.post("/interview/integrity", response_model=IntegrityOut)
def interview_integrity(
    body: IntegrityIn,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> IntegrityOut:
    session = db.scalar(
        select(InterviewSession).where(
            InterviewSession.id == body.sessionId,
            InterviewSession.organization_id == context.organization_id,
            InterviewSession.user_id == context.user.id,
        )
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session.status != "active":
        raise HTTPException(status_code=409, detail="Interview session is not active")

    integrity = dict(session.integrity or {})
    integrity["maxFacesSeen"] = max(int(integrity.get("maxFacesSeen") or 1), body.faceCount)
    if body.faceCount != 1:
        integrity["faceViolations"] = int(integrity.get("faceViolations") or 0) + 1
        integrity["singlePersonOk"] = False
    session.integrity = integrity
    db.commit()
    return IntegrityOut(integrity=integrity)


@router.post("/interview/score", response_model=InterviewSaveOut)
def score_interview(
    body: InterviewScoreIn,
    request: Request,
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> InterviewSaveOut:
    session = None
    if body.sessionId:
        session = db.scalar(
            select(InterviewSession).where(
                InterviewSession.id == body.sessionId,
                InterviewSession.organization_id == context.organization_id,
                InterviewSession.user_id == context.user.id,
            )
        )
        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found")
        if session.status == "completed" and session.result:
            # Makes scoring safe to retry after network failures.
            return InterviewSaveOut(interview=session.result)

    profile = {**_profile(db, context), **body.profile, "name": body.profile.get("name") or context.user.name}
    questions = body.questions or (session.questions if session else [])
    if not questions:
        raise HTTPException(status_code=400, detail="Questions are required to score the interview")
    if len(body.answers) > len(questions):
        raise HTTPException(status_code=422, detail="There cannot be more answers than questions")
    integrity = {**(session.integrity if session else {}), **body.integrity}
    result = score_session(
        role=session.role if session else body.role,
        level=session.level if session else body.level,
        questions=questions,
        answers=body.answers,
        profile=profile,
        integrity=integrity,
        name=context.user.name,
    )
    result_row = InterviewResult(
        id=new_id(),
        organization_id=context.organization_id,
        user_id=context.user.id,
        session_id=session.id if session else None,
        data=result,
        overall=int(result.get("overall") or 0),
    )
    db.add(result_row)
    if session:
        session.status = "completed"
        session.answers = body.answers
        session.result = result
        session.integrity = integrity
        session.completed_at = datetime.now(UTC)
    write_audit(
        db,
        context,
        request,
        action="interview.completed",
        resource_type="interview_result",
        resource_id=result_row.id,
    )
    db.commit()
    return InterviewSaveOut(interview=result)


@router.get("/interview/latest", response_model=InterviewSaveOut)
def latest_interview(
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> InterviewSaveOut:
    row = db.scalar(
        select(InterviewResult)
        .where(
            InterviewResult.organization_id == context.organization_id,
            InterviewResult.user_id == context.user.id,
        )
        .order_by(InterviewResult.created_at.desc())
    )
    if not row:
        raise HTTPException(status_code=404, detail="No interview result yet")
    return InterviewSaveOut(interview=row.data)


@router.get("/interviews", response_model=list[dict])
def interview_history(
    limit: int = Query(default=20, ge=1, le=100),
    context: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[dict]:
    rows = db.scalars(
        select(InterviewResult)
        .where(
            InterviewResult.organization_id == context.organization_id,
            InterviewResult.user_id == context.user.id,
        )
        .order_by(InterviewResult.created_at.desc())
        .limit(limit)
    ).all()
    return [row.data for row in rows]
