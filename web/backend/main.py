from pathlib import Path
import sys
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ConversationEngine.conversation_engine import ConversationEngine


# -----------------------------------------------------------------------------
# Import compatibility
# -----------------------------------------------------------------------------

CURRENT_DIR = Path(__file__).resolve().parent
PARENT_DIR = CURRENT_DIR.parent

for path in (CURRENT_DIR, PARENT_DIR):
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)


app = FastAPI(title="Still True API")
engine = ConversationEngine()
conversations: dict[str, ConversationEngine] = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Request models
# -----------------------------------------------------------------------------
class StartConversationRequest(BaseModel):
    initial_thought: str

class MessageRequest(BaseModel):
    message: str

class EvidenceRequest(BaseModel):
    evidence: list[str]

# -----------------------------------------------------------------------------
# Helper functions
# -----------------------------------------------------------------------------

def _build_response(
    conversation_id: str,
    engine: ConversationEngine,
    message: str | None = None,
) -> dict:

    phase = engine.state["phase"]

    if phase == "complete":
        return {
            "conversation_id": conversation_id,
            "phase": "complete",
            "message": message,
            "data": {
                "working_belief": engine.state.get("working_belief"),
                "evidence_for": engine.state.get("evidence_for", []),
                "evidence_reviews": engine.state.get("evidence_reviews", []),
                "balanced_thought": engine.state.get("balanced_thought"),
            },
            "stage_complete": True,
        }

    return {
        "conversation_id": conversation_id,
        "phase": phase,
        "message": message,
        "data": None,
        "stage_complete": False,
    }



# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Still True backend is running."
    }


@app.post("/api/conversations")
def start_conversation(request: StartConversationRequest):
    initial_thought = request.initial_thought.strip()

    if not initial_thought:
        raise HTTPException(
            status_code=400,
            detail="initial_thought cannot be empty",
        )

    conversation_id = str(uuid.uuid4())
    engine = ConversationEngine()
    engine.state["initial_thought"] = initial_thought
    conversations[conversation_id] = engine


    try:
        # The thought entered on the Landing page becomes the first user turn.
        message = engine.chat(initial_thought)
    except Exception as exc:
        # Do not keep a conversation that failed during initialization.
        conversations.pop(conversation_id, None)
        print(f"[MODEL ERROR] start_conversation: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Model request failed",
        ) from exc

    print(f"[START] {conversation_id}: {initial_thought}")

    return _build_response(
        conversation_id=conversation_id,
        engine=engine,
        message=message,
    )


@app.post("/api/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, request: MessageRequest,):

    engine = conversations.get(conversation_id)

    if engine is None: 
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    if engine.state["phase"] == "evidence_form":
        # Evidence form phase expects a list of evidence items.
        raise HTTPException(
            status_code=400,
            detail="Evidence form phase expects a list of evidence items. Use the /evidence endpoint.",
        )

    if engine.state["phase"] == "complete":
        raise HTTPException(
            status_code=400,
            detail="Conversation is already complete. No further messages are accepted.",
        )
    

    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )


    # if request.message == "__test__":
    #     return {
    #         "conversation_id": conversation_id,
    #         "stage": "complete",
    #         "phase": None,
    #         "message": None,
    #         "stage_complete": True,
    #         "data": {
    #             "automatic_thought": "I only succeeded because I used GPT.",
    #             "intermediate_belief": "If I need help, I am not capable.",
    #             "core_belief": "I am not capable on my own.",
    #             "core_belief_inferred": True,
    #             "balanced_thought": (
    #                 "Using GPT does not erase my own ideas, "
    #                 "judgment, or contribution."
    #             ),
    #             "current_progress": (
    #                 "I can see that using a tool and being capable "
    #                 "are not mutually exclusive."
    #             ),
    #             "next_steps": [
    #                 "Write down one part of the project that came from your own judgment.",
    #                 "Notice one recent problem you solved without relying entirely on external help.",
    #                 "Use GPT as support while checking that you understand the final result.",
    #             ],
    #         },
    #     }

    try:
        result = engine.chat(request.message)
        print("[FASTAPI RESULT]", result)
        print("[PHASE]", engine.state["phase"])

    except Exception as e:
        print("[MODEL ERROR] send_message:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    return _build_response(conversation_id=conversation_id, engine=engine, message=result)