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
            ]
        },
        "next_phase": {
            "type": "string",
            "enum": [
                "thought_exploration",
                "distortion_identification",
                "defense",
                "prosecution",
                "verdict",
            ]
        }
    },
    "required": [
        "reply",
        "next_stage",
        "next_phase"
    ]
}

VERDICT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "resolution_status": {
            "type": "string",
            "enum": ["resolved", "unresolved"]
        },
        "rationale": {
            "type": "string"
        }
    },
    "required": [
        "resolution_status",
        "rationale"
    ]
}

SUMMARY_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "automatic_thought": {
            "type": ["string", "null"]
        },
        "intermediate_belief": {
            "type": ["string", "null"]
        },
        "core_belief": {
            "type": ["string", "null"]
        },
        "core_belief_inferred": {
            "type": "boolean"
        },
        "balanced_thought": {
            "type": ["string", "null"]
        },
        "current_progress": {
            "type": "string"
        },
        "next_steps": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": [
        "intermediate_belief",
        "core_belief",
        "core_belief_inferred",
        "balanced_thought",
        "current_progress",
        "next_steps"
    ],
    "additionalProperties": False
}