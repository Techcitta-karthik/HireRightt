from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, timedelta

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditLog, AuthSession, Membership, MembershipRole, Organization, User
from app.utils.security import hash_token, new_id, utcnow

bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthContext:
    user: User
    organization: Organization
    membership: Membership
    session: AuthSession

    @property
    def organization_id(self) -> str:
        return self.organization.id


def _aware(value):
    if value is not None and value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value


def get_auth_context(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> AuthContext:
    if not creds or creds.scheme.lower() != "bearer" or not creds.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    session = db.scalar(
        select(AuthSession).where(AuthSession.access_token_hash == hash_token(creds.credentials))
    )
    now = utcnow()
    if not session or session.revoked_at or _aware(session.access_expires_at) <= now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

    user = db.get(User, session.user_id)
    organization = db.get(Organization, session.organization_id)
    membership = db.scalar(
        select(Membership).where(
            Membership.organization_id == session.organization_id,
            Membership.user_id == session.user_id,
            Membership.status == "active",
        )
    )
    if (
        not user
        or not user.is_active
        or not organization
        or organization.status != "active"
        or not membership
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account or workspace is inactive")

    if _aware(session.last_seen_at) < now - timedelta(minutes=5):
        session.last_seen_at = now
        db.commit()
    return AuthContext(user=user, organization=organization, membership=membership, session=session)


def get_current_user(context: AuthContext = Depends(get_auth_context)) -> User:
    """Compatibility dependency for routes that only need the signed-in user."""
    return context.user


def require_roles(*roles: MembershipRole | str) -> Callable:
    allowed = {role.value if isinstance(role, MembershipRole) else role for role in roles}

    def dependency(context: AuthContext = Depends(get_auth_context)) -> AuthContext:
        if context.membership.role not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient workspace permissions")
        return context

    return dependency


def write_audit(
    db: Session,
    context: AuthContext,
    request: Request,
    *,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    metadata: dict | None = None,
) -> None:
    db.add(
        AuditLog(
            id=new_id(),
            organization_id=context.organization_id,
            actor_user_id=context.user.id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata or {},
            ip_address=request.client.host if request.client else None,
            request_id=getattr(request.state, "request_id", None),
        )
    )
