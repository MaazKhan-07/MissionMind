"""
MissionMind Configuration
=========================
Central configuration for the MissionMind backend.
All environment variables are loaded here.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load .env from project root
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_ENV_PATH = _PROJECT_ROOT / ".env"
if _ENV_PATH.exists():
    load_dotenv(_ENV_PATH)

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
APP_ENV = os.getenv("APP_ENV", "development")
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DATABASE_DIR = _PROJECT_ROOT / "data" / "generated"
DATABASE_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_DIR / 'missionmind.db'}")
# Raw path for direct sqlite3 usage
DATABASE_PATH = str(DATABASE_DIR / "missionmind.db")

# ---------------------------------------------------------------------------
# LLM Provider
# ---------------------------------------------------------------------------
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "hosted")           # "hosted" | "ollama"
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.0-flash")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "")                 # For Ollama or custom
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0"))   # Deterministic

# ---------------------------------------------------------------------------
# Embeddings
# ---------------------------------------------------------------------------
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
EMBEDDING_DIM = 384  # Dimension for all-MiniLM-L6-v2

# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------
RETRIEVAL_TOP_K = int(os.getenv("RETRIEVAL_TOP_K", "20"))
RETRIEVAL_MIN_STRENGTH = float(os.getenv("RETRIEVAL_MIN_STRENGTH", "0.3"))
RRF_K = int(os.getenv("RRF_K", "60"))  # RRF constant

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
MAX_DROPPED_CLAIMS_BEFORE_ABSTAIN = int(
    os.getenv("MAX_DROPPED_CLAIMS_BEFORE_ABSTAIN", "3")
)

# ---------------------------------------------------------------------------
# Audit
# ---------------------------------------------------------------------------
AUDIT_HASH_ALGORITHM = "sha256"
