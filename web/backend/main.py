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

app.add_middleware(CORSMiddleware,
                    allow_origins=["http://localhost:5173",],
                    allow_credentials=True,
                    allow_methods=["*"],
                    allow_headers=["*"],)


# -----------------------------------------------------------------------------
# Request models
# -----------------------------------------------------------------------------
class StartConversationRequest(BaseModel):
    initial_thought: str

class MessageRequest(BaseModel):
    message: str

class EvidenceRequest(BaseModel):
    evidence: list[str]

class BeliefConfirmationRequest(BaseModel):
    confirmed: bool

class EvidenceRequest(BaseModel):
    evidence: list[str]

class VerdictConfirmationRequest(BaseModel):
    confirmed: bool


# -----------------------------------------------------------------------------
# Helper functions
# -----------------------------------------------------------------------------

def _build_response(conversation_id: str, engine: ConversationEngine,
                    message: str | None = None,) -> dict:

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
        "working_belief": engine.state.get("working_belief"),
        "balanced_thought": engine.state.get("balanced_thought"),
        "stage_complete": phase == "complete",
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
async def send_message(
    conversation_id: str,
    request: MessageRequest,
):
    engine = conversations.get(conversation_id)

    if engine is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    if engine.state["phase"] == "complete":
        raise HTTPException(
            status_code=400,
            detail="Conversation is already complete.",
        )

    try:
        result = engine.chat(request.message)

        print("[FASTAPI RESULT]", result)
        print("[PHASE]", engine.state["phase"])

    except Exception as exc:
        print("[MODEL ERROR] send_message:", exc)

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    return _build_response(
        conversation_id=conversation_id,
        engine=engine,
        message=result,
    )


@app.post("/api/conversations/{conversation_id}/belief-confirmation")
async def confirm_belief(conversation_id: str, request: BeliefConfirmationRequest):
    engine = conversations.get(conversation_id)

    if engine is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    if engine.state["phase"] != "belief_confirmation":
        raise HTTPException(
            status_code=400,
            detail="Not waiting for belief confirmation",
        )

    if request.confirmed:
        engine.state["working_belief_confirmed"] = True
        engine.state["phase"] = "evidence_form"

        message = (
            "Now let’s look at what makes this thought feel true to you. "
            "Can you share one specific experience, example, or reason that supports it?"
        )

    else:
        engine.state["working_belief_confirmed"] = False
        engine.state["phase"] = "working_belief"
        message = None

    print("[BELIEF CONFIRMED]", request.confirmed)
    print("[PHASE]", engine.state["phase"])

    return _build_response(
        conversation_id=conversation_id,
        engine=engine,
        message=message,
    )


@app.post("/api/conversations/{conversation_id}/evidence/complete")
async def complete_evidence_collection(
    conversation_id: str,
):
    engine = conversations.get(conversation_id)

    if engine is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    try:
        message = engine.finish_evidence_collection()
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    print("[EVIDENCE COLLECTION COMPLETE]")
    print("[EVIDENCE FOR]", engine.state["evidence_for"])
    print("[PHASE]", engine.state["phase"])

    return _build_response(
        conversation_id=conversation_id,
        engine=engine,
        message=message,
    )


@app.get("/api/conversations/{conversation_id}/summary")
async def get_conversation_summary(
    conversation_id: str,
):
    engine = conversations.get(conversation_id)

    if engine is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    try:
        summary = engine.generate_summary()
    except Exception as exc:
        print("[SUMMARY ERROR]", exc)
        raise HTTPException(
            status_code=500,
            detail="Could not generate summary",
        ) from exc

    print("[SUMMARY RESULT]", summary)

    return {
        "conversation_id": conversation_id,
        "summary": summary,
    }