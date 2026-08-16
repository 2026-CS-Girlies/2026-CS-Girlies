from typing import TypedDict


class StillTrueState(TypedDict, total=False):
    phase: str

    # Working belief
    working_belief_messages: list
    initial_thought: str
    working_belief: str | None
    working_belief_confirmed: bool

    # Evidence
    evidence_for: list[str]

    # Open-ended reflection
    reflection_messages: list

    # Final summary
    final_summary: dict | None
