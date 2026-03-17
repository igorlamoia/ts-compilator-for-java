from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tscompilator"
    database_schema: str = "public"
    secret_key: str  # sem default — obrigatório via .env
    access_token_expire_minutes: int = 60 * 24  # 24 horas
    cors_origins: list[str] = ["http://localhost:3000"]
    run_create_all: bool = False  # use True apenas em dev/testes, nunca em produção


settings = Settings()
