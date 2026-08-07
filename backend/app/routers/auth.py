from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import AuthSession, User
from app.schemas import AuthResponse, LoginIn, SignupIn, UserOut
from app.utils.security import (
    hash_password,
    new_id,
    new_token,
    token_expiry,
    verify_password,
)

router = APIRouter(tags=["auth"])


def _user_out(user: User) -> UserOut:
    return UserOut(id=user.id, name=user.name, email=user.email)


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupIn, db: Session = Depends(get_db)) -> AuthResponse:
    email = str(body.email).lower().strip()
    exists = db.scalar(select(User).where(User.email == email))
    if exists:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        id=new_id(8),
        name=body.name.strip(),
        email=email,
        password_hash=hash_password(body.password),
    )
    token = new_token(24)
    session = AuthSession(token=token, user_id=user.id, expires_at=token_expiry())
    db.add(user)
    db.add(session)
    db.commit()
    db.refresh(user)
    return AuthResponse(token=token, user=_user_out(user))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginIn, db: Session = Depends(get_db)) -> AuthResponse:
    email = str(body.email).lower().strip()
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")

    token = new_token(24)
    session = AuthSession(token=token, user_id=user.id, expires_at=token_expiry())
    db.add(session)
    db.commit()
    return AuthResponse(token=token, user=_user_out(user))


@router.post("/logout")
def logout(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, bool]:
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer", "").strip()
    session = db.get(AuthSession, token)
    if session and session.user_id == user.id:
        db.delete(session)
        db.commit()
    return {"ok": True}
