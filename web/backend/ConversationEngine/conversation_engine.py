from langchain_core.messages import AIMessage, HumanMessage

from .model import crispers_llm, extractor_llm, working_belief_llm
from .prompts.final_summary import FINAL_SUMMARY_PROMPT
from .prompts.reflection import reflection_prompt
from .prompts.working_belief import working_belief_prompt
from .schema import FinalSummaryExtraction, WorkingBeliefExtraction
from .state import StillTrueState


class ConversationEngine:
    def __init__(self):
        self.state: StillTrueState = {
            "phase": "working_belief",
            "working_belief_messages": [],
            "initial_thought": "",
            "working_belief": None,
            "working_belief_confirmed": False,
            "evidence_for": [],
            "reflection_messages": [],
            "final_summary": None,
        }

    def chat(self, user_message: str) -> str:
        phase = self.state["phase"]

        if phase == "working_belief":
            return self._handle_working_belief_phase(user_message)
        if phase == "evidence_form":
            return self._handle_evidence_form_phase(user_message)
        if phase == "reflection":
            return self._handle_reflection_phase(user_message)

        raise ValueError(f"Unknown phase: {phase}")

    def _handle_working_belief_phase(self, user_message: str) -> str:
        history = self.state["working_belief_messages"]

        prompt_input = {
            "history": history,
            "user_message": user_message,
            "initial_thought": self.state.get("initial_thought", ""),
            "working_belief": self.state.get("working_belief") or "",
        }

        result = working_belief_llm.with_structured_output(
            WorkingBeliefExtraction
        ).invoke(
            working_belief_prompt.invoke(prompt_input).to_messages()
        )

        # print("[WORKING BELIEF RESULT]", result)
        # print("[WORKING BELIEF]", repr(result.working_belief))
        # print("[BELIEF CLEAR]", result.belief_clear)
        # print("[MESSAGE]", repr(result.message))

        history.append(HumanMessage(content=user_message))

        # --------------------------------
        # VALID BELIEF FOUND
        # --------------------------------
        if result.belief_clear:
            if result.working_belief:
                self.state["working_belief"] = result.working_belief.strip()

            self.state["phase"] = "belief_confirmation"

            print("[PHASE] -> belief_confirmation")
            print(
                "[STATE WORKING BELIEF]",
                self.state["working_belief"]
            )

            return ""

        # --------------------------------
        # BELIEF NOT CLEAR YET
        # --------------------------------

        # Never save working_belief when belief_clear=False.
        assistant_message = (result.message or "").strip()

        # Recover from small-model field mixup.
        if not assistant_message and result.working_belief:
            assistant_message = result.working_belief.strip()

            print(
                "[FIELD RECOVERY] working_belief -> message:",
                repr(assistant_message)
            )

        if not assistant_message:
            assistant_message = (
                "What thought or feeling would you like to look at?"
            )

        history.append(AIMessage(content=assistant_message))

        return assistant_message

    

    def _handle_evidence_form_phase(self, user_message: str) -> str:
        evidence = user_message.strip()

        if not evidence:
            raise ValueError("Evidence must be provided")

        self.state["evidence_for"].append(evidence)
        evidence_count = len(self.state["evidence_for"])

        return (
            "That can be one piece of it. Is there anything else you'd want to include?"
            if evidence_count == 1
            else "Got it. Anything else you'd like to include?"
        )

    def finish_evidence_collection(self) -> str:
        if self.state["phase"] != "evidence_form":
            raise ValueError("Not in evidence form phase")

        if not self.state["evidence_for"]:
            raise ValueError("At least one piece of evidence must be provided")

        self.state["phase"] = "reflection"

        first_evidence = self.state["evidence_for"][0]

        assistant_message = (
            "Let’s take a closer look at one of the experiences you mentioned:\n\n"
            f"“{first_evidence}”\n\n"
            f"What about this experience makes “{self.state['working_belief']}” feel true?"
        )

        self.state["reflection_messages"] = [
            AIMessage(content=assistant_message)
        ]

        return assistant_message

    def _handle_reflection_phase(self, user_message: str) -> str:
        history = self.state["reflection_messages"]

        prompt_input = {
            "history": history,
            "user_message": user_message,
            "working_belief": self.state["working_belief"],
            "evidence_for": self.state["evidence_for"],
        }

        assistant_message = crispers_llm.invoke(
            reflection_prompt.invoke(prompt_input).to_messages()
        ).content

        history.append(HumanMessage(content=user_message))
        history.append(AIMessage(content=assistant_message))

        return assistant_message

    def generate_summary(self) -> dict:
        conversation = "\n".join(
            (
                "User"
                if isinstance(message, HumanMessage)
                else "Assistant"
            )
            + f": {message.content}"
            for message in self.state["reflection_messages"]
        )

        prompt_input = {
                "working_belief": self.state.get("working_belief") or "",
                "evidence_for": self.state.get("evidence_for", []),
                "conversation": conversation,
            }

        prompt = FINAL_SUMMARY_PROMPT.format(**prompt_input)

        result = extractor_llm.with_structured_output(
            FinalSummaryExtraction
        ).invoke(prompt)

        summary = result.model_dump()

        self.state["final_summary"] = summary
        self.state["phase"] = "complete"

        print("[FINAL SUMMARY RESULT]", result)
        return summary