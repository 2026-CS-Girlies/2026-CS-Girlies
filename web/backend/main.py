from pathlib import Path
import sys
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# -----------------------------------------------------------------------------
# Import compatibility
# -----------------------------------------------------------------------------

CURRENT_DIR = Path(__file__).resolve().parent
PARENT_DIR = CURRENT_DIR.parent

for path in (CURRENT_DIR, PARENT_DIR):
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)

from CR.cr_helper import CRHelper  # noqa: E402


app = FastAPI(title="Still True API")

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


# -----------------------------------------------------------------------------
# Temporary in-memory conversation storage
# -----------------------------------------------------------------------------
# One CRHelper instance = one conversation.
# Restarting the FastAPI server clears all conversations.
conversations: dict[str, CRHelper] = {}


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def _stage_value(helper: CRHelper) -> str:
    return helper.stage.value


def _phase_value(helper: CRHelper) -> str | None:
    return helper.phase.value if helper.phase is not None else None


def _summary_from_helper(helper: CRHelper) -> dict:
    """
    CRHelper.complete() creates these attributes through summarize().

    The current CRHelper.handle_verdict() calls complete() but does not return
    its result. Reading the generated values here lets main.py work without
    changing cr_helper.py.
    """
    return {
        "intermediate_belief": getattr(helper, "intermediate_belief", None),
        "core_belief": getattr(helper, "core_belief", None),
        "core_belief_inferred": getattr(helper, "core_belief_inferred", False),
        "balanced_thought": getattr(helper, "balanced_thought", None),
        "current_progress": getattr(helper, "current_progress", None),
        "next_steps": getattr(helper, "next_steps", []),
    }


def _build_response(
    conversation_id: str,
    helper: CRHelper,
    result,
) -> dict:
    if helper.is_complete():
        # If CRHelper is later changed to return the summary directly,
        # prefer that result. Otherwise read the values stored on the helper.
        summary = result if isinstance(result, dict) else _summary_from_helper(helper)

        return {
            "conversation_id": conversation_id,
            "stage": _stage_value(helper),
            "phase": None,
            "message": None,
            "data": summary,
            "stage_complete": True,
        }

    return {
        "conversation_id": conversation_id,
        "stage": _stage_value(helper),
        "phase": _phase_value(helper),
        "message": result,
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
    helper = CRHelper()
    conversations[conversation_id] = helper

    try:
        # The thought entered on the Landing page becomes the first user turn.
        result = helper.chat(initial_thought)
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
        helper=helper,
        result=result,
    )


@app.post("/api/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    request: MessageRequest,
):
    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )


    if request.message == "__test__":
        return {
            "conversation_id": conversation_id,
            "stage": "complete",
            "phase": None,
            "message": None,
            "stage_complete": True,
            "data": {
                "automatic_thought": "I only succeeded because I used GPT.",
                "intermediate_belief": "If I need help, I am not capable.",
                "core_belief": "I am not capable on my own.",
                "core_belief_inferred": True,
                "balanced_thought": (
                    "Using GPT does not erase my own ideas, "
                    "judgment, or contribution."
                ),
                "current_progress": (
                    "I can see that using a tool and being capable "
                    "are not mutually exclusive."
                ),
                "next_steps": [
                    "Write down one part of the project that came from your own judgment.",
                    "Notice one recent problem you solved without relying entirely on external help.",
                    "Use GPT as support while checking that you understand the final result.",
                ],
            },
        }

    helper = conversations[conversation_id]

    try:
        result = helper.chat(request.message)
        print("[FASTAPI RESULT]", result)
        print("[IS COMPLETE]", helper.is_complete())

    except Exception as e:
        print("[MODEL ERROR] send_message:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    if helper.is_complete():
        return {
            "conversation_id": conversation_id,
            "stage": "complete",
            "phase": None,
            "message": None,

            # main result
            "data": result,

            "stage_complete": True,
        }

    return {
        "conversation_id": conversation_id,
        "stage": helper.stage.value,
        "phase": helper.phase.value,
        "message": result,
        "data": None,
        "stage_complete": False,
    }