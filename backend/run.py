"""
HIRERIGHT Python API
Run:  python -m uvicorn app.main:app --reload --port 8787
  or: python run.py
"""

from __future__ import annotations

import uvicorn

from app.config import settings


def main() -> None:
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )


if __name__ == "__main__":
    main()
