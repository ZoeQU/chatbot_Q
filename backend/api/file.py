from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.post("/upload")
async def upload_file():
    # Phase 3 will implement multipart upload + parsing.
    return {"error": "not_implemented"}


@router.get("/{file_id}")
async def get_file(file_id: str):
    return {"error": "not_implemented", "file_id": file_id}


@router.delete("/{file_id}")
async def delete_file(file_id: str):
    return {"error": "not_implemented", "file_id": file_id}

