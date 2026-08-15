from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartConversationRequest(BaseModel):
    initial_thought: str


@app.post("/api/conversations")
async def start_conversation(
    request: StartConversationRequest
):
    print("Received:", request.initial_thought)

    return {
        "conversation_id": str(uuid.uuid4()),
        "stage": "ct_guided_identification",
        "phase": "situation",
        "message": "MOCK: Can you tell me what happened?",
        "data": {
            "situation": "",
            "automatic_thought": request.initial_thought,
            "intermediate_belief": "",
            "core_belief": "",
        },
        "stage_complete": False,
    }