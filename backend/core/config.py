from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env for local dev; in production (Fly.io) env vars are injected directly.
_ENV_FILE = Path(__file__).parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE if _ENV_FILE.exists() else None,
        extra="ignore",
    )

    anthropic_api_key: str
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    mem0_api_key: str

    app_env: str = "development"
    app_secret_key: str = "change-me"
    cors_origins: str = "http://localhost:3000"

    # Agent model — Sonnet for reasoning-heavy responses
    claude_model: str = "claude-sonnet-4-6"
    # Haiku for lightweight classification to reduce cost
    claude_haiku_model: str = "claude-haiku-4-5-20251001"

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
