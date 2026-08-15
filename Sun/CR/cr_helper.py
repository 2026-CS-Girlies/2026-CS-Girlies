from CR.stages import CRStage, IdentificationPhase, RestructuringPhase
from CR.prompt import get_chat_prompt
from Sun.model_client import ModelClient

class CRHelper:
    def __init__(self):
        self.stage = CRStage.IDENTIFICATION
        self.phase = IdentificationPhase.THOUGHT_EXPLORATION

        self.history = []

        self.automatic_thought = None
        self.intermediate_belief = None
        self.cognitive_distortion = None

        self.evidence_for = []
        self.evidence_against = []

        self.balanced_thought = None

        self.model_client = ModelClient()

    def reset(self):
        self.stage = CRStage.IDENTIFICATION
        self.phase = IdentificationPhase.THOUGHT_EXPLORATION

        self.history = []

        self.automatic_thought = None
        self.intermediate_belief = None
        self.cognitive_distortion = None

        self.evidence_for = []
        self.evidence_against = []

        self.balanced_thought = None

    def add_message(self, role, content):
        self.history.append({
            "role": role,
            "content": content
        })

    """ # model decides next stage, phase
        def advance_phase(self):
        # Identification has a fixed progression
        if self.stage == CRStage.IDENTIFICATION:
            if self.phase == IdentificationPhase.THOUGHT_EXPLORATION:
                self.phase = IdentificationPhase.DISTORTION_IDENTIFICATION

            elif self.phase == IdentificationPhase.DISTORTION_IDENTIFICATION:
                self.stage = CRStage.RESTRUCTURING
                self.phase = None

    def change_phase(self, phase):
        # Restructuring phases can move dynamically
        if self.stage != CRStage.RESTRUCTURING:
            raise ValueError("Phase can only be changed during restructuring.")

        if phase not in {
            RestructuringPhase.DEFENSE,
            RestructuringPhase.PROSECUTION,
            RestructuringPhase.VERDICT
        }:
            raise ValueError(f"Invalid restructuring phase: {phase}")

        self.phase = phase
    """

    def loop_to_identification(self):
        self.stage = CRStage.IDENTIFICATION
        self.phase = IdentificationPhase.THOUGHT_EXPLORATION

    def complete(self):
        if self.stage == CRStage.RESTRUCTURING and self.phase == RestructuringPhase.VERDICT:
            self.stage = CRStage.COMPLETE
            self.phase = None

    def is_complete(self):
        return self.stage == CRStage.COMPLETE

    def update_state(self, next_stage, next_phase):
        stage = CRStage(next_stage)

        if stage == CRStage.IDENTIFICATION:
            phase = IdentificationPhase(next_phase)

        elif stage == CRStage.RESTRUCTURING:
            phase = RestructuringPhase(next_phase)

        elif stage == CRStage.COMPLETE:
            phase = None

        self.stage = stage
        self.phase = phase

    def chat(self, user_message):
        self.add_message("user", user_message)

        system_prompt = get_chat_prompt(self.stage, self.phase)

        reply, next_stage, next_phase = self.model_client.chat(system_prompt=system_prompt, history=self.history)

        self.add_message("assistant", reply)
        print(f"[current stage] {self.stage}")
        print(f"[current phase] {self.phase}")
        print(f"[next stage] {next_stage}")
        print(f"[next phase] {next_phase}")

        self.update_state(next_stage, next_phase)

        return reply

