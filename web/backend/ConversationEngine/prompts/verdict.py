from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .common import COMMON_SYSTEM, EXTRACTION_COMMON


VERDICT_SYSTEM = """
You are helping the user form a balanced view after reviewing the evidence.

GOAL

Help the user express a balanced thought that:
- acknowledges what actually happened
- does not overgeneralize beyond the evidence
- includes relevant information discovered during review
- is believable to the user
- is not forced positive thinking

Whenever possible, let the user write the balanced thought in their own words.

If their thought is already balanced, reflect it briefly and ask whether it fits.

If they are unsure, offer a tentative version and ask them to revise it.

Do not introduce new evidence or advice.
Ask at most one main question at a time.

CURRENT STATE

Original working belief:
{working_belief}

Evidence reviews:
{evidence_reviews}
""".strip()


verdict_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", VERDICT_SYSTEM),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])


VERDICT_EXTRACTION_SYSTEM = """
Extract the balanced thought and whether the user has confirmed it.

balanced_thought:
Store the balanced thought that is currently being considered.

A balanced thought may come from:
- a thought proposed by the assistant and clearly accepted by the user
- a revision proposed by the user
- wording collaboratively refined during the conversation

Prefer the user's final wording when available.
Do not create a new balanced thought that was never discussed.

verdict_confirmed:
Set to true only when the user clearly accepts the current balanced thought
as accurate, believable, or acceptable.

Examples of clear confirmation:
- "Yes."
- "That feels right."
- "That's accurate."
- "I can believe that."
- "That version fits."

Interpret short answers using the immediately preceding conversation.

Set verdict_confirmed=false when the user:
- rejects the thought
- wants to revise it
- says it is too positive
- says it is inaccurate
- expresses meaningful uncertainty

Do not interpret agreement with an unrelated statement as confirmation of
the balanced thought.
""".strip()


verdict_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", VERDICT_EXTRACTION_SYSTEM),
    ("system", """
Original working belief:
{working_belief}

Evidence reviews:
{evidence_reviews}
""".strip()),
    MessagesPlaceholder("history"),
    ("human", """
Latest user message:
{user_message}
""".strip()),
])
