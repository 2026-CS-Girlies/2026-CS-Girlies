from langchain_core.messages import AIMessage, HumanMessage

from .model import crispers_llm, extractor_llm, working_belief_llm
from .prompts.final_summary import FINAL_SUMMARY_PROMPT
from .prompts.reflection import reflection_prompt
from .prompts.working_belief import working_belief_prompt
from .schema import FinalSummaryExtraction, WorkingBeliefDecision, WorkingBeliefDecision
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
        }

        # prompt to message
        message = working_belief_prompt.invoke(prompt_input).to_messages()
        result = working_belief_llm.with_structured_output(WorkingBeliefDecision).invoke(message)

        print("[DECISION]", result.decision)
        print("[MESSAGE]", repr(result.message))
        print("====================================\n")

        history.append(HumanMessage(content=user_message))

        if result.decision == "belief":
            self.state["working_belief"] = user_message.strip()
            self.state["phase"] = "belief_confirmation"

            print("[WORKING BELIEF]", repr(self.state["working_belief"]))
            print("[PHASE] -> belief_confirmation")

            return ""

        assistant_message = (result.message or "").strip()

        if assistant_message:
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