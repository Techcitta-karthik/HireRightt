from __future__ import annotations

import hashlib
import hmac
import re
import secrets
from datetime import UTC, datetime, timedelta

from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(password, password_hash)
    except Exception:
        # Supports migration from the original Node service's salt$sha256 format.
        if "$" in password_hash and not password_hash.startswith("$2"):
            salt, digest = password_hash.split("$", 1)
            check = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
            return secrets.compare_digest(check, digest)
        return False


def new_id(nbytes: int = 12) -> str:
    return secrets.token_hex(nbytes)


def new_token(nbytes: int = 32) -> str:
    return secrets.token_urlsafe(nbytes)


def hash_token(token: str) -> str:
    return hmac.new(settings.secret_key.encode(), token.encode(), hashlib.sha256).hexdigest()


def utcnow() -> datetime:
    return datetime.now(UTC)


def access_token_expiry() -> datetime:
    return utcnow() + timedelta(minutes=settings.access_token_minutes)


def refresh_token_expiry() -> datetime:
    return utcnow() + timedelta(days=settings.refresh_token_days)


def make_slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:80] or "workspace"
