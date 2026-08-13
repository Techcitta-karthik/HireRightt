from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import get_db
from app.models import AuthSession
from app.utils.security import hash_token
from tests.conftest import auth


def test_health_and_auth_lifecycle(client: TestClient, signup) -> None:
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["features"]["multiTenant"] is True
    assert health.headers["x-request-id"]

    account = signup("owner@example.com", "Owner User")
    assert account["role"] == "owner"
    assert account["organization"]["plan"] == "free"

    me = client.get("/api/me", headers=auth(account["token"]))
    assert me.status_code == 200
    assert me.json()["user"]["email"] == "owner@example.com"

    refreshed = client.post("/api/auth/refresh", json={"refreshToken": account["refreshToken"]})
    assert refreshed.status_code == 200
    assert refreshed.json()["token"] != account["token"]
    replay = client.post("/api/auth/refresh", json={"refreshToken": account["refreshToken"]})
    assert replay.status_code == 401


def test_tokens_are_hashed_at_rest(client: TestClient, signup) -> None:
    account = signup("secure@example.com")
    override = app_override(client)
    db = next(override())
    try:
        row = db.scalar(
            select(AuthSession).where(AuthSession.access_token_hash == hash_token(account["token"]))
        )
        assert row is not None
        assert row.access_token_hash != account["token"]
        assert row.refresh_token_hash != account["refreshToken"]
    finally:
        db.close()


def app_override(client: TestClient):
    # TestClient retains the active dependency override installed by the fixture.
    from app.main import app

    return app.dependency_overrides[get_db]


def test_profile_application_and_interview_flow(client: TestClient, signup) -> None:
    account = signup("candidate@example.com", "Candidate User")
    headers = auth(account["token"])

    profile = client.put(
        "/api/profile",
        headers=headers,
        json={
            "currentRole": "Python Engineer",
            "skills": ["Python", "SQL", "Docker"],
            "resumeText": "Built a Python API and reduced latency by 35 percent.",
        },
    )
    assert profile.status_code == 200
    assert profile.json()["profile"]["currentRole"] == "Python Engineer"

    application = client.post(
        "/api/applications",
        headers=headers,
        json={
            "title": "Backend Engineer",
            "company": "Acme",
            "location": "Remote",
            "match": 91,
        },
    )
    assert application.status_code == 201
    assert application.json()["total"] == 1

    started = client.post(
        "/api/interview/start",
        headers=headers,
        json={"role": "Backend Engineer", "level": "3-5 years"},
    )
    assert started.status_code == 200, started.text
    session = started.json()
    answers = [
        "I built a Python API with SQL and Docker. I measured latency and reduced it by 35 percent."
    ] * session["total"]
    scored = client.post(
        "/api/interview/score",
        headers=headers,
        json={"sessionId": session["sessionId"], "answers": answers},
    )
    assert scored.status_code == 200, scored.text
    assert 0 <= scored.json()["interview"]["overall"] <= 100

    retry = client.post(
        "/api/interview/score",
        headers=headers,
        json={"sessionId": session["sessionId"], "answers": answers},
    )
    assert retry.status_code == 200
    assert retry.json() == scored.json()


def test_tenant_isolation_and_member_rbac(client: TestClient, signup) -> None:
    first = signup("first@example.com", "First Owner")
    second = signup("second@example.com", "Second Owner")

    created_job = client.post(
        "/api/jobs",
        headers=auth(first["token"]),
        json={"title": "Platform Engineer", "status": "active"},
    )
    assert created_job.status_code == 201, created_job.text
    job_id = created_job.json()["id"]

    cross_tenant = client.post(
        "/api/applications",
        headers=auth(second["token"]),
        json={"jobId": job_id, "title": "Platform Engineer", "company": "First"},
    )
    assert cross_tenant.status_code == 404

    invitation = client.post(
        "/api/organizations/current/invitations",
        headers=auth(first["token"]),
        json={"email": "second@example.com", "role": "member"},
    )
    assert invitation.status_code == 201, invitation.text
    accepted = client.post(
        "/api/organizations/invitations/accept",
        headers=auth(second["token"]),
        json={"token": invitation.json()["invitationToken"]},
    )
    assert accepted.status_code == 200, accepted.text

    member_login = client.post(
        "/api/login",
        json={
            "email": "second@example.com",
            "password": "SaaSpass123",
            "organizationId": first["organization"]["id"],
        },
    )
    assert member_login.status_code == 200
    assert member_login.json()["role"] == "member"
    denied = client.post(
        "/api/jobs",
        headers=auth(member_login.json()["token"]),
        json={"title": "Unauthorized Job"},
    )
    assert denied.status_code == 403
