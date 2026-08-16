from langchain_core.messages import AIMessage, HumanMessage

from .model import crispers_llm, extractor_llm, working_belief_llm
from .prompts.evidence_review import evidence_review_extraction_prompt, evidence_review_prompt
from .prompts.verdict import verdict_extraction_prompt, verdict_prompt
from .prompts.working_belief import working_belief_prompt
from .schema import EvidenceReviewExtraction, FinalSummaryExtraction, VerdictExtraction, WorkingBeliefExtraction
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
            "evidence_index": 0,
            "evidence_review_messages": [],
            "evidence_reviews": [],
            "verdict_messages": [],
            "balanced_thought": None,
        }

    def chat(self, user_message: str) -> str:
        phase = self.state["phase"]

        if phase == "working_belief":
            return self._handle_working_belief_phase(user_message)
        if phase == "evidence_form":
            return self._handle_evidence_form_phase(user_message)
        if phase == "evidence_review":
            return self._handle_evidence_review_phase(user_message)
        if phase == "verdict":
            return self._handle_verdict_phase(user_message)

        raise ValueError(f"Unknown phase: {phase}")

    def _handle_working_belief_phase(self, user_message: str) -> str:
        history = self.state["working_belief_messages"]

        prompt_input = {
            "history": history,
            "user_message": user_message,
            "initial_thought": self.state.get("initial_thought", ""),
            "working_belief": self.state.get("working_belief") or "",
        }

        messages = working_belief_prompt.invoke(prompt_input).to_messages()

        result = working_belief_llm.with_structured_output(
            WorkingBeliefExtraction
        ).invoke(messages)

        if result.working_belief is not None:
            self.state["working_belief"] = result.working_belief

        if result.belief_clear:
            self.state["phase"] = "belief_confirmation"

        assistant_message = (result.message or "").strip()

        if not result.belief_clear and not assistant_message:
            assistant_message = "What thought or feeling would you like to look at?"

        history.append(HumanMessage(content=user_message))

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

        self.state["evidence_index"] = 0
        self.state["evidence_review_messages"] = []
        self.state["phase"] = "evidence_review"
        return self._start_current_evidence_review()

    def _current_evidence(self) -> str | None:
        index = self.state["evidence_index"]
        evidence = self.state["evidence_for"]
        return None if index >= len(evidence) else evidence[index]

    def _start_current_evidence_review(self) -> str:
        evidence = self._current_evidence()
        if evidence is None:
            raise ValueError("No evidence available for review")

        index = self.state["evidence_index"]
        label = "first" if index == 0 else "next"

        assistant_message = (
            f"Let’s take a closer look at the {label} one:\n\n"
            f"“{evidence}”\n\n"
            f"What about this experience makes “{self.state['working_belief']}” feel true?"
        )

        self.state["evidence_review_messages"] = [
            AIMessage(content=assistant_message)
        ]

        return assistant_message

    def _handle_evidence_review_phase(self, user_message: str) -> str:
        evidence = self._current_evidence()

        if evidence is None:
            self.state["phase"] = "verdict"
            return self._start_verdict()

        history = self.state["evidence_review_messages"]

        prompt_input = {
            "history": history,
            "user_message": user_message,
            "working_belief": self.state["working_belief"],
            "current_evidence": evidence,
        }

        assistant_message = crispers_llm.invoke(
            evidence_review_prompt.invoke(prompt_input).to_messages()
        ).content

        extraction = extractor_llm.with_structured_output(
            EvidenceReviewExtraction
        ).invoke(
            evidence_review_extraction_prompt.invoke(prompt_input).to_messages()
        )

        history.append(HumanMessage(content=user_message))
        history.append(AIMessage(content=assistant_message))

        if extraction.review_complete:
            self.state["evidence_reviews"].append({
                "evidence": evidence,
                "what_it_supports": extraction.what_it_supports,
                "what_it_does_not_support": extraction.what_it_does_not_support,
                "alternative_explanation": extraction.alternative_explanation,
            })

            self.state["evidence_index"] += 1

            if self.state["evidence_index"] < len(self.state["evidence_for"]):
                return self._start_current_evidence_review()

            self.state["phase"] = "verdict"
            return self._start_verdict()

        return assistant_message

    def _start_verdict(self) -> str:
        assistant_message = (
            "You've looked at the evidence more closely. "
            "Now, considering what it supports and what it may leave out, "
            "what would be a more balanced way to describe this thought?"
        )

        self.state["verdict_messages"] = [
            AIMessage(content=assistant_message)
        ]

        return assistant_message

    def _handle_verdict_phase(self, user_message: str) -> str:
        history = self.state["verdict_messages"]

        prompt_input = {
            "history": history,
            "user_message": user_message,
            "working_belief": self.state["working_belief"],
            "evidence_reviews": self.state["evidence_reviews"],
        }

        assistant_message = crispers_llm.invoke(
            verdict_prompt.invoke(prompt_input).to_messages()
        ).content

        extraction = extractor_llm.with_structured_output(
            VerdictExtraction
        ).invoke(
            verdict_extraction_prompt.invoke(prompt_input).to_messages()
        )

        if extraction.balanced_thought:
            self.state["balanced_thought"] = extraction.balanced_thought

        if extraction.verdict_confirmed:
            self.state["phase"] = "complete"

        history.append(HumanMessage(content=user_message))
        history.append(AIMessage(content=assistant_message))

        return assistant_message

    def generate_summary(self) -> dict:
        prompt = f"""
Create a concise final reflection summary using only the information below.
Do not invent events, beliefs, interpretations, or advice.

Working belief:
{self.state.get('working_belief')}

Evidence provided by the user:
{self.state.get('evidence_for', [])}

Evidence reviews:
{self.state.get('evidence_reviews', [])}

Balanced thought:
{self.state.get('balanced_thought')}

Return these fields:
- original_thought: preserve the working belief as closely as possible.
- why_it_felt_true: summarize the evidence the user provided.
- what_changed: summarize what became less certain or looked different during evidence review.
- balanced_thought: preserve the final balanced thought as closely as possible.
""".strip()

        result = extractor_llm.with_structured_output(
            FinalSummaryExtraction
        ).invoke(prompt)

        print("[FINAL SUMMARY RESULT]", result)
        return result.model_dump()
