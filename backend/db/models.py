"""Data models for SQLite persistence."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SessionIn(BaseModel):
    title: str | None = None


class SessionOut(BaseModel):
    id: str
    title: str | None
    created_at: datetime
    updated_at: datetime


class MessageIn(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    file_ids: str | None = None  # JSON array string


class MessageOut(BaseModel):
    id: int
    session_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    file_ids: str | None
    created_at: datetime


# For API request/response
class ChatRequest(BaseModel):
    session_id: str | None = None
    content: str = Field(..., min_length=1)
    file_ids: list[str] | None = None


class NewSessionResponse(BaseModel):
    session_id: str
