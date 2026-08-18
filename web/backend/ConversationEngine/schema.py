from pydantic import BaseModel
from typing import Literal


# class WorkingBeliefExtraction(BaseModel):
#     message: str
#     working_belief: str | None = None
#     belief_clear: bool = False

class WorkingBeliefDecision(BaseModel):
    decision: Literal["belief", "needs_question"]
    message: str = ""


class FinalSummaryExtraction(BaseModel):
    original_thought: str
    why_it_felt_true: str
    what_changed: str
    balanced_thought: str


class MessageRequest(BaseModel):
    message: str


class MessageResponse(BaseModel):
    message: str | None = None
    stage_complete: bool = False
    data: FinalSummaryExtraction | None = None