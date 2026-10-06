import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR = BASE_DIR / "data"

class Settings(BaseModel):
    PROJECT_NAME: str = "MISSIONMIND Backend API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    DB_PATH: Path = DATA_DIR / "missionmind.db"
    DEMO_CACHE_PATH: Path = DATA_DIR / "demo_cache.json"
    
    # Configuration
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    API_KEY: str = os.getenv("MISSIONMIND_API_KEY", "")
    
    # LLM & Embedding Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    
    # Retrieval Tuning
    TIME_WINDOW_BEFORE_MIN: int = 15
    TIME_WINDOW_AFTER_MIN: int = 5
    TOP_K_RECORDS: int = 15
    RRF_K: int = 60
    MIN_RETRIEVAL_STRENGTH: float = 0.015
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
