from pydantic import BaseModel


class WorkingBeliefExtraction(BaseModel):
    message: str
    working_belief: str | None = None
    belief_clear: bool = False
    user_confirmed: bool = False

class EvidenceReviewExtraction(BaseModel):
    what_it_supports: str | None = None
    what_it_does_not_support: str | None = None
    alternative_explanation: str | None = None
    review_complete: bool = False

class VerdictExtraction(BaseModel):
    balanced_thought: str | None = None
    verdict_confirmed: bool = False