from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

from api.chat import router as chat_router
from api.file import router as file_router
from api.memory import router as memory_router
from api.voice import router as voice_router


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/config")
async def get_config():
    # Intentionally do not expose secrets.
    return {
        "app_name": settings.app_name,
        "has_ark_api_key": bool(settings.ark_api_key),
        "doubao_model_id": settings.doubao_model_id,
        "ark_api_key_hint": ("missing" if not settings.ark_api_key else "present"),
    }


app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(file_router, prefix="/api/file", tags=["file"])
app.include_router(memory_router, prefix="/api/memory", tags=["memory"])
app.include_router(voice_router, prefix="/api/voice", tags=["voice"])

