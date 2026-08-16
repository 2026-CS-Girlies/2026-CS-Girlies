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

        if result.working_belief is not None:
            self.state["working_belief"] = result.working_belief

        if result.belief_clear:
            self.state["phase"] = "belief_confirmation"
            
        print("[WORKING BELIEF]", self.state.get("working_belief"))
        print("[CONFIRMED]", self.state.get("working_belief_confirmed"))
        print("[PHASE]", self.state["phase"])

        history.append(HumanMessage(content=user_message))
        history.append(AIMessage(content=result.message))

        self.state["reply"] = result.message

        return result.message


    def submit_evidence(self, evidence):
        if self.state["phase"] != "evidence_form":
            raise ValueError("Not in evidence form phase")

        cleaned = [item.strip() for item in evidence if item.strip()]

        if not cleaned:
            raise ValueError("At lease one piece of evidence must be provided")

        self.state["evidence_for"] = cleaned
        self.state["evidence_index"] = 0
        self.state["evidence_review_messages"] = []
        self.state["phase"] = "evidence_review"


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


