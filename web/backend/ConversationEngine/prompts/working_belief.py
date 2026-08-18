from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .common import COMMON_SYSTEM

WORKING_BELIEF_SYSTEM = """
Your only job is to decide whether the user's latest message is already
clear enough to become the thought or feeling they want to explore.

Be permissive.

Choose "belief" when the user expresses any meaningful:
- negative thought
- feeling
- concern
- fear
- self-judgment
- prediction
- conclusion

Examples that should be classified as "belief":

"I'm not good enough."
"I feel lonely."
"I've lost my passion."
"I feel bad."
"I'm frustrated."
"I'm stressed about school."
"I think I'll fail."
"Everyone is better than me."
"just bad"

The message does not need to be a perfectly formed CBT belief.

Choose "needs_question" only when the user has not yet shared anything
meaningful to explore.

Examples:

"Hi"
"Hello"
"Yes"
"No"
"Maybe"
"I don't know"
"Not sure"
"Something happened"

When unsure, prefer "belief" instead of continuing to question the user.
""".strip()


WORKING_BELIEF_OUTPUT_SYSTEM = """
Return a structured response matching the WorkingBeliefDecision schema.

Fields:

- decision: "belief" or "needs_question"
- message: str

If the user's latest message contains a meaningful thought, feeling,
concern, fear, self-judgment, or prediction that can be explored:

- decision = "belief"
- message = ""

If the user's latest message is too vague or conversational:

- decision = "needs_question"
- message = one short follow-up question

Never ask more than one question.
Never provide multiple possible interpretations.
Never rewrite or paraphrase the user's belief.
Do not ask for confirmation. The application handles confirmation separately.
""".strip()



working_belief_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", WORKING_BELIEF_SYSTEM),
    ("system", WORKING_BELIEF_OUTPUT_SYSTEM),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])