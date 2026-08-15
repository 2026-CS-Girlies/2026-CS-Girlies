from typing import TypedDict


class StillTrueState(TypedDict, total=False):
    phase: str

    messages: list

    # Cognitive Restructuring
    situation: str | None
    automatic_thought: str | None
    intermediate_belief: str | None
    core_belief: str | None
    working_belief: str | None

    # Defense and Prosecution
    evidence_for: list[str]
    defense_exhausted: bool

    evidence_index: int
    reviewed_evidence: list[str]
    evidence_against: list[str]

    coping_strategies: list[str]
    counterevidence_checked: bool

    balanced_thought: str | None
    verdict_confirmed: bool

    reply: str