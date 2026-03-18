from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "小西"
    cors_allow_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    ark_api_key: str | None = Field(default=None, validation_alias="ARK_API_KEY")
    doubao_model_id: str = Field(default="doubao-seed-2-0-mini-260215", validation_alias="DOUBAO_MODEL_ID")
    doubao_base_url: str = Field(
        default="https://ark.cn-beijing.volces.com/api/v3",
        validation_alias="DOUBAO_BASE_URL",
    )

    request_timeout_s: float = Field(default=60.0, validation_alias="REQUEST_TIMEOUT_S")

    @property
    def db_path(self) -> Path:
        p = Path(__file__).resolve().parent / "data" / "memory.db"
        p.parent.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()

