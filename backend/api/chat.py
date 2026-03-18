"""Chat API: sessions, history, streaming."""
from __future__ import annotations

import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from config import settings
from db.models import ChatRequest, NewSessionResponse
from db import sqlite_store
from core.doubao_client import chat as doubao_chat, chat_sync as doubao_chat_sync

router = APIRouter()

# Ensure DB on first use
def _db():
    sqlite_store.init_db(settings.db_path)
    return settings.db_path


@router.get("/history")
async def get_history():
    """List all sessions (id, title, created_at, updated_at)."""
    db_path = _db()
    sessions = sqlite_store.list_sessions(db_path)
    return {"sessions": sessions}


@router.get("/history/{session_id}")
async def get_session_messages(session_id: str):
    """Get messages for one session."""
    db_path = _db()
    messages = sqlite_store.get_messages(db_path, session_id, last_n=100)
    return {"session_id": session_id, "messages": messages}


@router.post("/new", response_model=NewSessionResponse)
async def new_chat():
    """Create a new chat session."""
    db_path = _db()
    session_id = sqlite_store.create_session(db_path, title="新对话")
    return NewSessionResponse(session_id=session_id)


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and its messages."""
    db_path = _db()
    sqlite_store.delete_session(db_path, session_id)
    return {"ok": True}


def _build_messages(session_id: str, user_content: str, file_ids: list[str] | None) -> list[dict]:
    db_path = settings.db_path
    rows = sqlite_store.get_messages(db_path, session_id, last_n=20)
    messages = []
    for r in rows:
        messages.append({"role": r["role"], "content": r["content"]})
    content = user_content
    if file_ids:
        content = user_content + "\n\n[附：本消息关联文件，后续阶段将注入文件内容]"
    messages.append({"role": "user", "content": content})
    return messages


async def _stream_reply(session_id: str, messages: list[dict]) -> AsyncGenerator[str, None]:
    full = []
    try:
        async for token in doubao_chat(messages, stream=True):
            full.append(token)
            yield token
        # If streaming produced nothing, fall back to non-streaming once.
        if not full:
            text = await doubao_chat_sync(messages)
            if text:
                full.append(text)
                yield text
    finally:
        reply_text = "".join(full)
        if reply_text:
            db_path = settings.db_path
            sqlite_store.add_message(db_path, session_id, "assistant", reply_text)


@router.post("")
async def chat(req: ChatRequest):
    """Send a message and stream the reply via SSE."""
    if not settings.ark_api_key:
        raise HTTPException(status_code=503, detail="ARK_API_KEY not configured")
    db_path = _db()
    session_id = req.session_id
    is_new_session = False
    if not session_id:
        is_new_session = True
        session_id = sqlite_store.create_session(db_path, title="新对话")
    messages = _build_messages(
        session_id,
        req.content,
        req.file_ids,
    )
    # Persist user message
    file_ids_str = json.dumps(req.file_ids) if req.file_ids else None
    sqlite_store.add_message(db_path, session_id, "user", req.content, file_ids_str)
    # Set session title from first user message when session was just created
    if is_new_session and req.content.strip():
        sqlite_store.update_session_title(db_path, session_id, req.content.strip()[:80])

    async def event_gen():
        try:
            async for token in _stream_reply(session_id, messages):
                yield {"event": "token", "data": json.dumps({"content": token, "session_id": session_id})}
            yield {"event": "done", "data": json.dumps({"session_id": session_id})}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_gen())
