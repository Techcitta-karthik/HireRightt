from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ApiModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)


class ErrorOut(ApiModel):
    error: str
    requestId: str | None = None


class OrganizationOut(ApiModel):
    id: str
    name: str
    slug: str
    plan: str


class UserOut(ApiModel):
    id: str
    name: str
    email: EmailStr


class AuthResponse(ApiModel):
    token: str
    refreshToken: str
    tokenType: str = "bearer"
    expiresIn: int
    user: UserOut
    organization: OrganizationOut
    role: str


class SignupIn(ApiModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    organizationName: str | None = Field(default=None, min_length=2, max_length=160)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not any(c.isalpha() for c in value) or not any(c.isdigit() for c in value):
            raise ValueError("password must contain at least one letter and one number")
        return value


class LoginIn(ApiModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    organizationId: str | None = None


class RefreshIn(ApiModel):
    refreshToken: str = Field(min_length=20)


class MeOut(ApiModel):
    user: UserOut
    organization: OrganizationOut
    role: str
    profile: dict[str, Any] | None = None
    interview: dict[str, Any] | None = None
    applications: list[dict[str, Any]] = Field(default_factory=list)


class ProfileOut(ApiModel):
    profile: dict[str, Any]


class PreferencesIn(ApiModel):
    emailMatchAlerts: bool = True
    interviewReminders: bool = True
    productTips: bool = False
    profileVisibleToEmployers: bool = True
    shareScoreOnApplications: bool = True
    showOnlineStatus: bool = False


class AccountUpdateIn(ApiModel):
    currentPassword: str
    name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    newPassword: str | None = Field(default=None, min_length=8, max_length=128)


class InterviewSaveOut(ApiModel):
    interview: dict[str, Any]


class InterviewStartIn(ApiModel):
    role: str = Field(default="Full Stack Engineer", max_length=120)
    level: str = Field(default="1-3 years", max_length=80)
    profile: dict[str, Any] = Field(default_factory=dict)


class QuestionOut(ApiModel):
    text: str
    category: str
    keywords: list[str] = Field(default_factory=list)
    hint: str = ""
    focus: str | None = None


class InterviewStartOut(ApiModel):
    sessionId: str
    agent: str
    llm: bool = False
    total: int
    questionIndex: int = 0
    question: QuestionOut
    questions: list[QuestionOut]
    profileDigest: dict[str, Any] = Field(default_factory=dict)


class IntegrityIn(ApiModel):
    sessionId: str
    faceCount: int = Field(default=1, ge=0, le=20)


class IntegrityOut(ApiModel):
    integrity: dict[str, Any]


class InterviewScoreIn(ApiModel):
    sessionId: str | None = None
    role: str = Field(default="Full Stack Engineer", max_length=120)
    level: str = Field(default="1-3 years", max_length=80)
    questions: list[dict[str, Any]] = Field(default_factory=list, max_length=20)
    answers: list[str] = Field(default_factory=list, max_length=20)
    profile: dict[str, Any] = Field(default_factory=dict)
    integrity: dict[str, Any] = Field(default_factory=dict)


class ApplicationIn(ApiModel):
    model_config = ConfigDict(extra="allow", str_strip_whitespace=True)

    jobId: str | None = None
    title: str = Field(min_length=1, max_length=160)
    company: str = Field(min_length=1, max_length=160)
    location: str = Field(default="", max_length=160)
    match: int = Field(default=0, ge=0, le=100)
    status: Literal["Applied", "In Review", "Interview", "Offer", "Hired", "Rejected"] = "Applied"


class ApplicationStatusIn(ApiModel):
    status: Literal["Applied", "In Review", "Interview", "Offer", "Hired", "Rejected"]


class ApplicationsOut(ApiModel):
    applications: list[dict[str, Any]]
    total: int | None = None


class JobIn(ApiModel):
    title: str = Field(min_length=2, max_length=160)
    department: str = Field(default="", max_length=120)
    location: str = Field(default="", max_length=160)
    employmentType: str = Field(default="Full-Time", max_length=50)
    salaryRange: str = Field(default="", max_length=100)
    minExperienceYears: int = Field(default=0, ge=0, le=60)
    requiredSkills: list[str] = Field(default_factory=list, max_length=50)
    preferredSkills: list[str] = Field(default_factory=list, max_length=50)
    description: str = Field(default="", max_length=20_000)
    status: Literal["draft", "active", "paused", "closed"] = "draft"


class MemberOut(ApiModel):
    id: str
    userId: str
    name: str
    email: EmailStr
    role: str
    status: str
    createdAt: datetime


class MemberRoleIn(ApiModel):
    role: Literal["admin", "recruiter", "member"]


class InvitationIn(ApiModel):
    email: EmailStr
    role: Literal["admin", "recruiter", "member"] = "member"


class InvitationOut(ApiModel):
    id: str
    email: EmailStr
    role: str
    expiresAt: datetime
    # Returned once so deployments without an email provider can still deliver the invite.
    invitationToken: str


class InvitationAcceptIn(ApiModel):
    token: str = Field(min_length=20)


class HealthOut(ApiModel):
    ok: bool = True
    service: str = "hireright-api"
    version: str
    database: str = "up"
    features: dict[str, bool]
    engine: str = "python-fastapi"
    time: datetime
