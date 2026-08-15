from CR.stages import CRStage, IdentificationPhase, RestructuringPhase
from CR.prompt import get_chat_prompt, get_summary_prompt
from Sun.model_client import ModelClient

class CRHelper:
    def __init__(self):
        self.stage = CRStage.IDENTIFICATION
        self.phase = IdentificationPhase.THOUGHT_EXPLORATION

        self.history = []
        self.last_message = None

        self.automatic_thought = None
        self.intermediate_belief = None
        self.cognitive_distortion = None

        #self.evidence_for = []
        #self.evidence_against = []

        self.balanced_thought = None

        self.model_client = ModelClient()

    def reset(self):
        self.stage = CRStage.IDENTIFICATION
        self.phase = IdentificationPhase.THOUGHT_EXPLORATION

        self.history = []
        self.last_message = None

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

    def validate_state(self, next_stage, next_phase):
        valid_states = {
            ("identification", "thought_exploration"),
            ("identification", "distortion_identification"),
            ("restructuring", "defense"),
            ("restructuring", "prosecution"),
            ("restructuring", "verdict"),
        }

        return (next_stage, next_phase) in valid_states

    def validate_transition(self, next_stage, next_phase):
        if self.stage == CRStage.IDENTIFICATION:
            if self.phase == IdentificationPhase.THOUGHT_EXPLORATION:
                allowed = {
                    (CRStage.IDENTIFICATION, IdentificationPhase.THOUGHT_EXPLORATION),
                    (CRStage.IDENTIFICATION, IdentificationPhase.DISTORTION_IDENTIFICATION),
                }
            elif self.phase == IdentificationPhase.DISTORTION_IDENTIFICATION:
                allowed = {
                    (CRStage.IDENTIFICATION, IdentificationPhase.DISTORTION_IDENTIFICATION),
                    (CRStage.RESTRUCTURING, RestructuringPhase.DEFENSE),
                }

        elif self.stage == CRStage.RESTRUCTURING:
            if self.phase == RestructuringPhase.DEFENSE:
                allowed = {
                    (CRStage.RESTRUCTURING, RestructuringPhase.DEFENSE),
                    (CRStage.RESTRUCTURING, RestructuringPhase.PROSECUTION),
                }
            elif self.phase == RestructuringPhase.PROSECUTION:
                allowed = {
                    (CRStage.RESTRUCTURING, RestructuringPhase.DEFENSE),
                    (CRStage.RESTRUCTURING, RestructuringPhase.PROSECUTION),
                    (CRStage.RESTRUCTURING, RestructuringPhase.VERDICT),
                }

            elif self.phase == RestructuringPhase.VERDICT:
                return False

        else:
            return False

        return (next_stage, next_phase) in allowed

    def update_state(self, next_stage, next_phase):
        if not self.validate_state(next_stage, next_phase):
            print(
                f"[WARNING] Invalid stage/phase combination ignored: "
                f"{next_stage}/{next_phase}"
            )
            print(
                f"[STATE KEPT] {self.stage}/{self.phase}"
            )
            return False

        # convert only after validation
        stage = CRStage(next_stage)

        if stage == CRStage.IDENTIFICATION:
            phase = IdentificationPhase(next_phase)

        elif stage == CRStage.RESTRUCTURING:
            phase = RestructuringPhase(next_phase)

        self.stage = stage
        self.phase = phase

        return True

    def loop_to_identification(self):
        self.stage = CRStage.IDENTIFICATION
        self.phase = IdentificationPhase.THOUGHT_EXPLORATION

    def complete(self):
        if self.stage == CRStage.RESTRUCTURING and self.phase == RestructuringPhase.VERDICT:
            self.stage = CRStage.COMPLETE
            self.phase = None

        print("[!CR PROCESS COMPLETE!]")
        dialogue = self.get_dialogue()
        print(f"[dialogue]\n {dialogue}")

        summary = self.summarize(dialogue)

        return summary

    def is_complete(self):
        return self.stage == CRStage.COMPLETE

    def chat(self, user_message):
        if self.stage == CRStage.RESTRUCTURING and self.phase == RestructuringPhase.VERDICT:
            self.last_message = user_message
            return self.handle_verdict()

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

    def handle_verdict(self):
        system_prompt = get_chat_prompt(self.stage, self.phase)

        verdict_history = self.history + [
            {
                "role": "user",
                "content": self.last_message
            }
        ]

        resolved, rationale = self.model_client.judge_verdict(system_prompt=system_prompt, history=verdict_history)

        print(f"[verdict resolved] {resolved}")
        print(f"[verdict rationale] {rationale}")

        if resolved:
            self.add_message("user", self.last_message)
            self.last_message = None

            self.complete()
            return

        # unresolved -> continue prosecution
        message = self.last_message
        self.last_message = None

        self.stage = CRStage.RESTRUCTURING
        self.phase = RestructuringPhase.PROSECUTION

        return self.chat(message)

    def get_dialogue(self):
        dialogue = []

        for message in self.history:
            if message["role"] == "user":
                role = "User"
            elif message["role"] == "assistant":
                role = "Assistant"
            else:
                continue

            dialogue.append(f"{role}: {message['content']}")

        return "\n".join(dialogue)

    def summarize(self, dialogue):
        system_prompt = get_summary_prompt()

        result = self.model_client.summarize(system_prompt=system_prompt, dialogue=dialogue)

        self.intermediate_belief = result["intermediate_belief"]
        self.core_belief = result["core_belief"]
        self.core_belief_inferred = result["core_belief_inferred"]
        self.balanced_thought = result["balanced_thought"]
        self.current_progress = result["current_progress"]
        self.next_steps = result["next_steps"]

        print("[SUMMARY]")
        print(result)

        return result


