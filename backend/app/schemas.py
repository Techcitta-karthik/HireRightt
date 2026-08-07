from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ErrorOut(BaseModel):
    error: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class SignupIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class MeOut(BaseModel):
    user: UserOut
    profile: Optional[dict[str, Any]] = None
    interview: Optional[dict[str, Any]] = None
    applications: list[dict[str, Any]] = Field(default_factory=list)


class ProfileOut(BaseModel):
    profile: dict[str, Any]


class InterviewSaveOut(BaseModel):
    interview: dict[str, Any]


class InterviewStartIn(BaseModel):
    role: str = "Full Stack Engineer"
    level: str = "1–3 years"
    profile: dict[str, Any] = Field(default_factory=dict)


class QuestionOut(BaseModel):
    text: str
    category: str
    keywords: list[str] = Field(default_factory=list)
    hint: str = ""
    focus: Optional[str] = None


class InterviewStartOut(BaseModel):
    sessionId: str
    agent: str
    llm: bool = False
    total: int
    questionIndex: int = 0
    question: QuestionOut
    questions: list[QuestionOut]
    profileDigest: dict[str, Any] = Field(default_factory=dict)


class IntegrityIn(BaseModel):
    sessionId: str
    faceCount: int = 1


class IntegrityOut(BaseModel):
    integrity: dict[str, Any]


class InterviewScoreIn(BaseModel):
    sessionId: Optional[str] = None
    role: str = "Full Stack Engineer"
    level: str = "1–3 years"
    questions: list[dict[str, Any]] = Field(default_factory=list)
    answers: list[str] = Field(default_factory=list)
    profile: dict[str, Any] = Field(default_factory=dict)
    integrity: dict[str, Any] = Field(default_factory=dict)


class ApplicationIn(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    match: Optional[int] = None
    status: Optional[str] = "Applied"


class ApplicationsOut(BaseModel):
    applications: list[dict[str, Any]]


class HealthOut(BaseModel):
    ok: bool = True
    service: str = "hireright-api"
    version: str
    llm: bool = False
    features: dict[str, bool]
    engine: str = "python-fastapi"
    time: datetime
