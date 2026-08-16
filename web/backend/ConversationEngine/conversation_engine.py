from langchain_core.messages import HumanMessage, AIMessage
from .model import working_belief_llm, crispers_llm, extractor_llm

from .state import StillTrueState

from .schema import WorkingBeliefExtraction, EvidenceReviewExtraction, VerdictExtraction

from .prompts.working_belief import working_belief_prompt
from .prompts.evidence_review import evidence_review_prompt, evidence_review_extraction_prompt
from .prompts.verdict import verdict_prompt, verdict_extraction_prompt



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
            "verdict_confirmed": False,

            "reply": "",
        }


    def chat(self, user_message):
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


    def _handle_working_belief_phase(self, user_message):

        history = self.state["working_belief_messages"]
        prompt_input = {"history": history, "user_message": user_message}

        # 1. Build prompt messages
        messages = (working_belief_prompt.invoke(prompt_input).to_messages()) #changed to messeage list form ChatPromptValue object
        # 2. Qwen sturctured output
        structured_llm = (working_belief_llm.with_structured_output(WorkingBeliefExtraction))
        result = structured_llm.invoke(messages)

        print("[QWEN RESULT]", result)

        if result.working_belief is not None:
            self.state["working_belief"] = result.working_belief

        if result.belief_clear:
            self.state["phase"] = "belief_confirmation"

        assistant_message = (result.message or "").strip()
        if not result.belief_clear and not assistant_message:
                    assistant_message = (
                        "What thought or feeling would you like to look at?"
                    )

        history.append(HumanMessage(content=user_message))
        history.append(AIMessage(content=assistant_message))

        self.state["reply"] = assistant_message

        print("[WORKING BELIEF]", self.state.get("working_belief"))
        print("[CONFIRMED]", self.state.get("working_belief_confirmed"))
        print("[PHASE]", self.state["phase"])
        print("[ASSISTANT MESSAGE]", assistant_message)

        return assistant_message


    def _handle_evidence_form_phase(self, user_message):
        # No LLM call here, just store the evidence and ask for more if needed

        evidence = user_message.strip()

        if not evidence:
            raise ValueError("Evidence must be provided")

        self.state["evidence_for"].append(evidence)
        evidence_count = len(self.state["evidence_for"])

        if evidence_count == 1:
            assistant_message = (
                "That can be one piece of it. "
                "Is there anything else you'd want to include?"
                )
        else:
            assistant_message = ("Got it. Anything else you'd like to include?")

        self.state["reply"] = assistant_message

        print("[EVIDENCE ADDED]", evidence)
        print("[EVIDENCE COUNT]", evidence_count)
        print("[EVIDENCE FOR]", self.state["evidence_for"])
        print("[PHASE]", self.state["phase"])

        return assistant_message

    def finish_evidence_collection(self) -> str:
        if self.state["phase"] != "evidence_form":
            raise ValueError("Not in evidence form phase")

        if not self.state["evidence_for"]:
            raise ValueError(
                "At least one piece of evidence must be provided"
            )

        self.state["evidence_index"] = 0
        self.state["evidence_review_messages"] = []
        self.state["phase"] = "evidence_review"

        current_evidence = self._current_evidence()

        assistant_message = (
            f'Let’s take a closer look at the first one:\n\n'
            f'“{current_evidence}”\n\n'
            f'What about this experience makes '
            f'“{self.state["working_belief"]}” feel true?'
        )

        self.state["evidence_review_messages"].append(
            AIMessage(content=assistant_message)
        )

        self.state["reply"] = assistant_message

        return assistant_message


    def _current_evidence(self):
        evidence = self.state["evidence_for"]
        index = self.state["evidence_index"]

        if index >= len(evidence):
            return None
    
        return evidence[index]


    def _handle_evidence_review_phase(self, user_message):
        evidence = self._current_evidence()

        if evidence is None:
            self.state["phase"] = "verdict"
            return self._handle_verdict_phase(user_message)

        history = self.state["evidence_review_messages"]
        
        prompt_input = {"history": history,
                        "user_message": user_message,
                        "working_belief": self.state["working_belief"],
                        "current_evidence": evidence,
                        "evidence_for": self.state["evidence_for"],}

        # 1. Crispers conversation
        messages = (evidence_review_prompt.invoke(prompt_input).to_messages()) #changed to messeage list form ChatPromptValue object
        response = crispers_llm.invoke(messages) # send the messages to the model and get an AIMessage response
        assistant_message = response.content # actual text from the model

        # 2. Qwen extractor
        extraction_messages = (evidence_review_extraction_prompt.invoke(prompt_input).to_messages())
        structured_llm = extractor_llm.with_structured_output(EvidenceReviewExtraction)
        extraction = structured_llm.invoke(extraction_messages)

        # 3. Evidence finished
        if extraction.review_complete:
            review = {
            "evidence": evidence,
            "what_it_supports": extraction.what_it_supports,
            "what_it_does_not_support": extraction.what_it_does_not_support,
            "alternative_explanation": extraction.alternative_explanation,
            }

            self.state["evidence_reviews"].append(review)
            # Move to next evidence
            self.state["evidence_index"] += 1
            # reset local history
            self.state["evidence_review_messages"] = []

            # all evidence reviewed
            if self.state["evidence_index"] >= len(self.state["evidence_for"]):
                self.state["phase"] = "verdict"

                assistant_message = (
                    "You've looked at the evidence more closely. "
                    "Now, considering what it supports and what it may leave out, "
                    "what would be a more balanced way to describe this thought?"
                )

                self.state["verdict_messages"] = [
                    AIMessage(content=assistant_message)
                ]

                self.state["reply"] = assistant_message

                return assistant_message

        else:
            # Current evidence still needs more discussion
            history.append(HumanMessage(content=user_message))
            history.append(AIMessage(content=assistant_message))

        self.state["reply"] = assistant_message

        return assistant_message


    def _handle_verdict_phase(self, user_message):
        history = self.state["verdict_messages"]

        prompt_input = {"history": history,
                        "user_message": user_message,
                        "working_belief": self.state["working_belief"],
                        "evidence_reviews": self.state["evidence_reviews"],}

        # 1. Crispers conversation
        messages = (verdict_prompt.invoke(prompt_input).to_messages())
        response = crispers_llm.invoke(messages)
        assistant_message = response.content

        # 2. Qwen extractor
        extraction_messages = (verdict_extraction_prompt.invoke(prompt_input).to_messages())
        structured_llm = extractor_llm.with_structured_output(VerdictExtraction)
        extraction = structured_llm.invoke(extraction_messages)

        if extraction.balanced_thought:
            self.state["balanced_thought"] = extraction.balanced_thought

        if extraction.verdict_confirmed:
            self.state["verdict_confirmed"] = True
            self.state["phase"] = "complete"

        history.append(HumanMessage(content=user_message))
        history.append(AIMessage(content=assistant_message))

        self.state["reply"] = assistant_message

        return assistant_message

    def generate_summary(self) -> str:
        prompt = f"""
    Summarize this reflection clearly and concisely.

    Working belief:
    {self.state.get("working_belief")}

    Evidence:
    {self.state.get("evidence_for", [])}

    Evidence reviews:
    {self.state.get("evidence_reviews", [])}

    Balanced thought:
    {self.state.get("balanced_thought")}

    Return a concise reflection summary with:

    - Original thought
    - What made it feel true
    - What changed when looking closer
    - Balanced thought
    """

        response = extractor_llm.invoke(prompt)

        return response.content