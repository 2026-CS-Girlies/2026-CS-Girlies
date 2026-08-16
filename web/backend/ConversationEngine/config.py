import os

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://localhost:11434"
)

CHAT_MODEL = os.getenv(
    "CHAT_MODEL",
    "crispers:7b-q8"
)

SUMMARY_MODEL = os.getenv(
    "SUMMARY_MODEL",
    "qwen2.5:3b"
)
