import os

class Settings:
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "missionmind.db"))
    SEED_DATA_PATH: str = os.getenv("SEED_DATA_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "mission_seed.json"))
    GOLDEN_QUESTIONS_PATH: str = os.getenv("GOLDEN_QUESTIONS_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "ai", "golden_questions.json"))

settings = Settings()
