"""SQLite persistence for sessions and messages."""
from __future__ import annotations

import sqlite3
import uuid
from pathlib import Path


def init_db(db_path: Path) -> None:
    conn = sqlite3.connect(str(db_path))
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
            content TEXT NOT NULL,
            file_ids TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
    """)
    conn.commit()
    conn.close()


def create_session(db_path: Path, title: str | None = None) -> str:
    session_id = str(uuid.uuid4())
    conn = sqlite3.connect(str(db_path))
    conn.execute(
        "INSERT INTO sessions (id, title) VALUES (?, ?)",
        (session_id, title or "新对话"),
    )
    conn.commit()
    conn.close()
    return session_id


def list_sessions(db_path: Path) -> list[dict]:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT id, title, created_at, updated_at FROM sessions ORDER BY updated_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_messages(db_path: Path, session_id: str, last_n: int = 20) -> list[dict]:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT id, session_id, role, content, file_ids, created_at FROM messages "
        "WHERE session_id = ? ORDER BY id DESC LIMIT ?",
        (session_id, last_n),
    ).fetchall()
    conn.close()
    out = [dict(r) for r in reversed(rows)]
    return out


def add_message(
    db_path: Path,
    session_id: str,
    role: str,
    content: str,
    file_ids: str | None = None,
) -> int:
    conn = sqlite3.connect(str(db_path))
    cur = conn.execute(
        "INSERT INTO messages (session_id, role, content, file_ids) VALUES (?, ?, ?, ?)",
        (session_id, role, content, file_ids),
    )
    msg_id = cur.lastrowid
    conn.execute("UPDATE sessions SET updated_at = datetime('now') WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()
    return msg_id


def update_session_title(db_path: Path, session_id: str, title: str) -> None:
    conn = sqlite3.connect(str(db_path))
    conn.execute(
        "UPDATE sessions SET title = ?, updated_at = datetime('now') WHERE id = ?",
        (title[:200] if title else "新对话", session_id),
    )
    conn.commit()
    conn.close()


def delete_session(db_path: Path, session_id: str) -> None:
    conn = sqlite3.connect(str(db_path))
    conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()
