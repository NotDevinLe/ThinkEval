from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEFAULT_MODEL = "gpt-4"
EMBEDDING_MODEL_NAME = "all-mpnet-base-v2"
TEMPERATURE = 1.0
