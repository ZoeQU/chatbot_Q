from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.post("/transcribe")
async def transcribe():
    # Reserved for Phase 6.
    return {"error": "not_implemented", "message": "Voice transcribe will be added later."}

