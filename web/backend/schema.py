from pydantic import BaseModel, Field

"""
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
"""

# Cognitive Restructuring
class SituationExtraction(BaseModel):
    situation: str | None = None
    complete: bool = False


class ThoughtExtraction(BaseModel):
    automatic_thought: str | None = None
    complete: bool = False


class BeliefExtraction(BaseModel):
    belief: str | None = None
    confirmed: bool = False
    complete: bool = False


# Defense and Prosecution
class DefenseExtraction(BaseModel):
    evidence_for: list[str] = Field(default_factory=list)
    coping_strategies: list[str] = Field(default_factory=list)

    defense_exhausted: bool = False


class ProsecutionExtraction(BaseModel):
    reviewed_current_evidence: bool = False

    evidence_against: list[str] = Field(default_factory=list)
    coping_strategies: list[str] = Field(default_factory=list)

    counterevidence_checked: bool = False


class VerdictExtraction(BaseModel):
    balanced_thought: str | None = None
    verdict_confirmed: bool = False

