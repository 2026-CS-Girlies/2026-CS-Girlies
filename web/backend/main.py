from fastapi import FastAPI, HTTPException
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


# =========================================================
# Request Models
# =========================================================

class StartConversationRequest(BaseModel):
    initial_thought: str


class MessageRequest(BaseModel):
    message: str


class CTReviewData(BaseModel):
    situation: str
    automatic_thought: str
    intermediate_belief: str
    core_belief: str


class UpdateCTReviewRequest(BaseModel):
    data: CTReviewData


class StartDATRequest(BaseModel):
    data: CTReviewData


# =========================================================
# Temporary in-memory storage
# =========================================================

conversations = {}


# =========================================================
# 0. Test
# =========================================================

@app.get("/")
async def root():
    return {
        "message": "Still True mock backend is running."
    }


# =========================================================
# 1. Start Conversation
#
# Landing
#   ↓
# FirstConversationPage
# =========================================================

@app.post("/api/conversations")
async def start_conversation(
    request: StartConversationRequest
):
    conversation_id = str(uuid.uuid4())

    conversations[conversation_id] = {
        "stage": "ct_guided_identification",
        "ct_step": 0,
        "dat_step": 0,

        "ct_data": {
            "situation": "",
            "automatic_thought": request.initial_thought,
            "intermediate_belief": "",
            "core_belief": "",
        },

        "dat_data": {
            "claim": "",
            "defense": [],
            "defense_review": "",
            "prosecution": [],
            "prosecution_review": "",
            "verdict": "",
        },
    }

    print(
        f"[START] {conversation_id}: "
        f"{request.initial_thought}"
    )

    return {
        "conversation_id": conversation_id,
        "stage": "ct_guided_identification",
        "phase": "situation",
        "message": (
            "MOCK: Can you tell me what was happening "
            "when this thought came up?"
        ),
        "data": conversations[conversation_id]["ct_data"],
        "stage_complete": False,
    }


# =========================================================
# 2. Send Message
#
# 같은 endpoint를
# CT conversation / DAT conversation 모두 사용
# =========================================================

@app.post(
    "/api/conversations/{conversation_id}/messages"
)
async def send_message(
    conversation_id: str,
    request: MessageRequest,
):
    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    state = conversations[conversation_id]

    print(
        f"[MESSAGE] {conversation_id}: "
        f"{request.message}"
    )

    # -----------------------------------------------------
    # CT Guided Identification
    # -----------------------------------------------------

    if state["stage"] == "ct_guided_identification":
        state["ct_step"] += 1

        step = state["ct_step"]
        data = state["ct_data"]

        # Step 1
        # situation
        if step == 1:
            data["situation"] = request.message

            return {
                "conversation_id": conversation_id,
                "stage": "ct_guided_identification",
                "phase": "automatic_thought",
                "message": (
                    "MOCK: What went through your mind "
                    "in that moment?"
                ),
                "data": data,
                "stage_complete": False,
            }

        # Step 2
        # automatic thought
        elif step == 2:
            data["automatic_thought"] = request.message

            return {
                "conversation_id": conversation_id,
                "stage": "ct_guided_identification",
                "phase": "intermediate_belief",
                "message": (
                    "MOCK: If that thought were true, "
                    "what would it mean to you?"
                ),
                "data": data,
                "stage_complete": False,
            }

        # Step 3
        # intermediate belief
        elif step == 3:
            data["intermediate_belief"] = request.message

            return {
                "conversation_id": conversation_id,
                "stage": "ct_guided_identification",
                "phase": "core_belief",
                "message": (
                    "MOCK: And what might that say "
                    "about how you see yourself?"
                ),
                "data": data,
                "stage_complete": False,
            }

        # Step 4
        # core belief → CT complete
        else:
            data["core_belief"] = request.message

            return {
                "conversation_id": conversation_id,
                "stage": "ct_guided_identification",
                "phase": "core_belief",
                "message": (
                    "MOCK: I think I have enough context "
                    "to reflect back what I understood."
                ),
                "data": data,
                "stage_complete": True,
            }

    # -----------------------------------------------------
    # DAT Driven Restructuring
    # -----------------------------------------------------

    if state["stage"] == "dat_driven_restructuring":
        state["dat_step"] += 1

        step = state["dat_step"]
        data = state["dat_data"]

        # Step 1
        # defense
        if step == 1:
            data["defense"].append(request.message)

            return {
                "conversation_id": conversation_id,
                "stage": "dat_driven_restructuring",
                "phase": "defense",
                "message": (
                    "MOCK: Is there another experience "
                    "that makes this thought feel true?"
                ),
                "data": data,
                "stage_complete": False,
            }

        # Step 2
        # defense review
        elif step == 2:
            data["defense"].append(request.message)

            return {
                "conversation_id": conversation_id,
                "stage": "dat_driven_restructuring",
                "phase": "defense_review",
                "message": (
                    "MOCK: Looking more closely, "
                    "are these facts, interpretations, "
                    "or predictions?"
                ),
                "data": data,
                "stage_complete": False,
            }

        # Step 3
        elif step == 3:
            data["defense_review"] = request.message

            return {
                "conversation_id": conversation_id,
                "stage": "dat_driven_restructuring",
                "phase": "prosecution",
                "message": (
                    "MOCK: What evidence or experiences "
                    "might this thought be leaving out?"
                ),
                "data": data,
                "stage_complete": False,
            }

        # Step 4
        elif step == 4:
            data["prosecution"].append(request.message)

            return {
                "conversation_id": conversation_id,
                "stage": "dat_driven_restructuring",
                "phase": "prosecution_review",
                "message": (
                    "MOCK: What does that evidence suggest "
                    "when you consider the situation as a whole?"
                ),
                "data": data,
                "stage_complete": False,
            }

        # Step 5
        elif step == 5:
            data["prosecution_review"] = request.message

            return {
                "conversation_id": conversation_id,
                "stage": "dat_driven_restructuring",
                "phase": "verdict",
                "message": (
                    "MOCK: Based on everything you've considered, "
                    "what would be a more balanced way "
                    "to describe this situation?"
                ),
                "data": data,
                "stage_complete": False,
            }

        # Step 6
        # Complete → FinalReflectionPage
        else:
            data["verdict"] = request.message

            ct = state["ct_data"]

            return {
                "conversation_id": conversation_id,
                "stage": "dat_driven_restructuring",
                "phase": "complete",
                "message": (
                    "MOCK: You've looked at this thought "
                    "from more than one side."
                ),
                "data": data,
                "stage_complete": True,

                "result": {
                    "situation": (
                        ct["situation"]
                        or "Giving a presentation in class."
                    ),
                    "original_thought": (
                        ct["automatic_thought"]
                        or "Everyone thought I was incompetent."
                    ),
                    "why_it_felt_true": (
                        "I felt nervous, paused several times, "
                        "and forgot part of what I wanted to say."
                    ),
                    "what_it_may_have_left_out": (
                        "People stayed engaged, asked questions, "
                        "and I received positive feedback afterward."
                    ),
                    "balanced_thought": (
                        request.message
                        or
                        "I was nervous and made some mistakes, "
                        "but that does not mean I was incompetent."
                    ),
                    "next_step": (
                        "Before the next presentation, "
                        "practice the opening once and remind myself "
                        "that feeling nervous does not mean failing."
                    ),
                },
            }

    raise HTTPException(
        status_code=400,
        detail="Invalid conversation stage",
    )


# =========================================================
# 3. ReviewPage
#
# User edits CT data
# =========================================================

@app.put(
    "/api/conversations/{conversation_id}/ct-review"
)
async def update_ct_review(
    conversation_id: str,
    request: UpdateCTReviewRequest,
):
    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    conversations[conversation_id]["ct_data"] = (
        request.data.model_dump()
    )

    print(
        "[REVIEW UPDATED]",
        request.data.model_dump(),
    )

    return {
        "success": True,
        "data": request.data.model_dump(),
    }


# =========================================================
# 4. Start DAT
#
# ReviewPage
#   ↓ Continue
# SecondConversationPage
# =========================================================

@app.post(
    "/api/conversations/{conversation_id}/dat/start"
)
async def start_dat(
    conversation_id: str,
    request: StartDATRequest,
):
    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    state = conversations[conversation_id]

    # Review에서 수정된 최신 데이터 사용
    state["ct_data"] = request.data.model_dump()

    state["stage"] = "dat_driven_restructuring"
    state["dat_step"] = 0

    state["dat_data"] = {
        "claim": request.data.automatic_thought,
        "defense": [],
        "defense_review": "",
        "prosecution": [],
        "prosecution_review": "",
        "verdict": "",
    }

    print(
        f"[DAT START] {conversation_id}"
    )

    return {
        "conversation_id": conversation_id,
        "stage": "dat_driven_restructuring",
        "phase": "claim",
        "message": (
            "MOCK: Let's begin with the experiences "
            "that make this thought feel believable. "
            "What makes it feel true?"
        ),
        "data": state["dat_data"],
        "stage_complete": False,
    }