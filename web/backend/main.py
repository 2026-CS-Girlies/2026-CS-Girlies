import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ConversationEngine.conversation_engine import ConversationEngine
from ConversationEngine.schema import FinalSummaryExtraction


app = FastAPI(title="Still True API")
conversations: dict[str, ConversationEngine] = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartConversationRequest(BaseModel):
    initial_thought: str


class MessageRequest(BaseModel):
    message: str


class BeliefConfirmationRequest(BaseModel):
    confirmed: bool


class ConversationResponse(BaseModel):
    conversation_id: str
    phase: str
    message: str | None = None
    working_belief: str | None = None
    data: FinalSummaryExtraction | None = None
    stage_complete: bool = False


def _build_response(conversation_id: str, engine: ConversationEngine, message: str | None = None) -> ConversationResponse:
    phase = engine.state["phase"]

    return ConversationResponse(
        conversation_id=conversation_id,
        phase=phase,
        message=message,
        working_belief=engine.state.get("working_belief"),
        data=engine.state.get("final_summary") if phase == "complete" else None,
        stage_complete=phase == "complete",
    )


@app.get("/")
def root():
    return {"message": "Still True backend is running."}


@app.post("/api/conversations", response_model=ConversationResponse)
def start_conversation(request: StartConversationRequest):
    initial_thought = request.initial_thought.strip()
    if not initial_thought:
        raise HTTPException(status_code=400, detail="initial_thought cannot be empty")

    conversation_id = str(uuid.uuid4())
    engine = ConversationEngine()
    engine.state["initial_thought"] = initial_thought
    conversations[conversation_id] = engine

    try:
        message = engine.chat(initial_thought)
    except Exception as exc:
        conversations.pop(conversation_id, None)
        print("[MODEL ERROR] start_conversation:", exc)
        raise HTTPException(status_code=500, detail="Model request failed") from exc

    print(f"[START] {conversation_id}: {initial_thought}")
    return _build_response(conversation_id, engine, message)


@app.post("/api/conversations/{conversation_id}/messages", response_model=ConversationResponse)
async def send_message(conversation_id: str, request: MessageRequest):
    engine = conversations.get(conversation_id)
    if engine is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if engine.state["phase"] == "complete":
        raise HTTPException(status_code=400, detail="Conversation is already complete.")

    try:
        message = engine.chat(request.message)
    except Exception as exc:
        print("[MODEL ERROR] send_message:", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    print("[FASTAPI RESULT]", message)
    print("[PHASE]", engine.state["phase"])
    return _build_response(conversation_id, engine, message)


@app.post("/api/conversations/{conversation_id}/belief-confirmation", response_model=ConversationResponse)
async def confirm_belief(conversation_id: str, request: BeliefConfirmationRequest):
    engine = conversations.get(conversation_id)
    if engine is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if engine.state["phase"] != "belief_confirmation":
        raise HTTPException(status_code=400, detail="Not waiting for belief confirmation")

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

    return _build_response(conversation_id, engine, message)


@app.post("/api/conversations/{conversation_id}/evidence/complete", response_model=ConversationResponse)
async def complete_evidence_collection(conversation_id: str):
    engine = conversations.get(conversation_id)
    if engine is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    try:
        message = engine.finish_evidence_collection()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return _build_response(conversation_id, engine, message)


@app.post("/api/conversations/{conversation_id}/reflection/complete", response_model=ConversationResponse)
async def complete_reflection(conversation_id: str):
    engine = conversations.get(conversation_id)
    if engine is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if engine.state["phase"] != "reflection":
        raise HTTPException(status_code=400, detail="Not in reflection phase")

    try:
        engine.generate_summary()
    except Exception as exc:
        print("[SUMMARY ERROR]", exc)
        raise HTTPException(status_code=500, detail="Could not generate summary") from exc

    response = _build_response(conversation_id, engine)

    print("[REFLECTION COMPLETE RESPONSE]", response)
    return response


@app.get("/api/conversations/{conversation_id}/summary")
async def get_conversation_summary(conversation_id: str):
    engine = conversations.get(conversation_id)
    if engine is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if engine.state["phase"] != "complete":
        raise HTTPException(status_code=400, detail="Conversation is not complete yet")

    summary = engine.state.get("final_summary")
    if summary is None:
        raise HTTPException(status_code=404, detail="Summary not found")

    return {
        "conversation_id": conversation_id,
        "data": summary,
    }
