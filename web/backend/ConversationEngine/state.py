from typing import TypedDict


class StillTrueState(TypedDict, total=False):

    phase: str

    # Working belief conversation
    working_belief_messages: list
    initial_thought: str
    working_belief: str | None
    working_belief_confirmed: bool

    # Evidence form
    evidence_for: list[str]

    # Evidence review
    evidence_index: int
    evidence_review_messages: list
    evidence_reviews: list

    # Verdict
    verdict_messages: list
    balanced_thought: str | None
    verdict_confirmed: bool

    # Frontend
    reply: str