from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
)

from .common import (
    COMMON_SYSTEM,
    EXTRACTION_COMMON,
)


VERDICT_SYSTEM = """
Your task is to help the user form a more accurate and balanced view of the
working belief after reviewing the evidence.

Use the evidence reviews as the basis for the conversation.

The goal is NOT to replace a negative thought with a positive thought.

Instead, help the user arrive at a thought that is:

- more precise,
- appropriately cautious,
- consistent with the evidence,
- less absolute when the evidence does not support an absolute conclusion,
- still respectful of concerns that remain genuinely supported.

Preserve anything from the original working belief that remains supported.

Do not simply reverse the belief.

For example:

Bad:
"I am definitely capable and never need help."

Better:
"Needing help with some parts of the work does not necessarily mean I am
incapable overall."

When enough evidence has been reviewed, propose ONE concise balanced thought.

Then ask whether that thought feels:

- accurate,
- believable,
- and close enough to the user's actual experience.

If the user says the proposed thought is too positive, too strong,
too weak, inaccurate, or incomplete, revise it.

Do not defend your wording.

The user's judgment determines the final balanced thought.
""".strip()


verdict_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", VERDICT_SYSTEM),

    ("system", """
Original working belief:
{working_belief}

Evidence reviews:
{evidence_reviews}
""".strip()),

    MessagesPlaceholder("history"),

    ("human", "{user_message}"),
])


VERDICT_EXTRACTION_SYSTEM = """
Extract the balanced thought and whether the user has confirmed it.

balanced_thought:
Store the balanced thought that is currently being considered.

A balanced thought may come from:
- a thought proposed by the assistant and clearly accepted by the user,
- a revision proposed by the user,
- wording collaboratively refined during the conversation.

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
- rejects the thought,
- wants to revise it,
- says it is too positive,
- says it is inaccurate,
- expresses meaningful uncertainty.

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