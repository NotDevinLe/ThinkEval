from dotenv import load_dotenv
import os

load_dotenv()  # Load from .env file

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-fallback-key-if-any")
DEFAULT_MODEL = "gpt-4"
EMBEDDING_MODEL_NAME = "all-mpnet-base-v2"
TEMPERATURE = 1.0
