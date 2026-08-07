from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(password, password_hash)
    except Exception:
        # Legacy Node sha256 salt$hash support if migrating
        if "$" in password_hash and not password_hash.startswith("$2"):
            salt, digest = password_hash.split("$", 1)
            check = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
            return secrets.compare_digest(check, digest)
        return False


def new_id(nbytes: int = 8) -> str:
    return secrets.token_hex(nbytes)


def new_token(nbytes: int = 24) -> str:
    return secrets.token_hex(nbytes)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def token_expiry() -> datetime:
    return utcnow() + timedelta(hours=settings.access_token_hours)
