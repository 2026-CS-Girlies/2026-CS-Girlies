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

CHAT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {
            "type": "string"
        },
        "next_stage": {
            "type": "string",
            "enum": [
                "identification",
                "restructuring",
                "complete"
            ]
        },
        "next_phase": {
            "type": ["string", "null"],
            "enum": [
                "thought_exploration",
                "distortion_identification",
                "defense",
                "prosecution",
                "verdict",
                None
            ]
        }
    },
    "required": [
        "reply",
        "next_stage",
        "next_phase"
    ]
}