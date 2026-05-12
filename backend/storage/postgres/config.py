from pydantic_settings import BaseSettings, SettingsConfigDict

class PostgresConfig(BaseSettings):
    base_url: str
    password: str
    port: str
    user: str
    db: str

    model_config =SettingsConfigDict(env_prefix="POSTGRES_")

postgres_settings = PostgresConfig()