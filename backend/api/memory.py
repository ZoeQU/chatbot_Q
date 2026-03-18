from __future__ import annotations

from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/profile")
async def get_profile():
    # Phase 4 will fetch from SQLite user_profile.
    return {"profile": {}}


@router.put("/profile")
async def update_profile():
    return {"error": "not_implemented"}


@router.get("/search")
async def search_memories(q: str = Query(..., min_length=1)):
    # Phase 4 will query ChromaDB.
    return {"query": q, "results": []}


@router.delete("/reset")
async def reset_memory():
    return {"error": "not_implemented"}

