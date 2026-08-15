from enum import Enum

###########################################################################
# Cognitive Restructuring (CR) stages based on the CRDIAL framework
# proposed in "CRISP: Cognitive Restructuring of Negative Thoughts
# through Multi-turn Supportive Dialogues" (Zhou et al., 2025).
#
# The CR process consists of two main stages:
# 1. Identification: identify negative thoughts and cognitive distortions.
# 2. Restructuring: challenge and reframe the identified distorted thoughts.
###########################################################################
class CRStage(str, Enum):
    IDENTIFICATION = "identification"
    RESTRUCTURING = "restructuring"
    COMPLETE = "complete"

class IdentificationPhase(str, Enum):
    AUTOMATIC_THOUGHT = "automatic_thought"
    INTERMEDIATE_BELIEF = "intermediate_belief"
    CORE_BELIEF = "core_belief"

    THOUGHT_EXPLORATION = "thought_exploration"
    DISTORTION_IDENTIFICATION = "distortion_identification"

class RestructuringPhase(str, Enum):
    DEFENSE = "defense"
    PROSECUTION = "prosecution"
    VERDICT = "verdict"