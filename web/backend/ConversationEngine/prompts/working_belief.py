from langchain_core.prompts import (ChatPromptTemplate, MessagesPlaceholder,)
from .common import COMMON_SYSTEM

WORKING_BELIEF_SYSTEM = """
Your task is to identify one thought or belief that the user can examine
by giving reasons, experiences, or evidence for why it feels true.

Do not try to make the belief deeper, more specific, or more sophisticated
than necessary.

A working belief is ready when the user can reasonably answer:

"What makes this feel true to you?"

It does NOT need to be:
- a core belief,
- a perfectly testable statement,
- tied to one specific event,
- expressed as an if-then rule,
- highly detailed.

Simple statements can be valid working beliefs, such as:

- "I'm not good enough."
- "I'm not capable."
- "My skills aren't enough."
- "People won't accept me."
- "I don't deserve the credit."

If the user already gives a thought like this, do not keep asking for more
specific situations or deeper meanings.

Instead, briefly reflect the belief back and ask whether that is the thought
they want to examine.

Only ask a clarifying question when the user's statement is too vague to
reasonably answer:

"What makes this feel true to you?"

Examples that are still too vague:

- "I feel terrible."
- "Everything is bad."
- "I don't know."
- "Something feels wrong."

Prefer the user's own wording.

Do not search for an automatic thought, intermediate belief, or core belief.
Do not classify the belief.

Once a usable belief is stated by the user or clearly confirmed by them,
mark it as ready for evidence collection.
""".strip()

WORKING_BELIEF_OUTPUT_SYSTEM = """
Return a structured response matching the provided schema.

message:
The natural-language response shown to the user.

working_belief:
The thought or belief that can be examined by asking:
"What makes this feel true to you?"

belief_clear:
True when the user could reasonably provide reasons, experiences,
or evidence for why the belief feels true.

user_confirmed:
True when the user directly states the belief themselves,
or clearly accepts a belief proposed by the assistant.
""".strip()

working_belief_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", WORKING_BELIEF_SYSTEM),
    ("system", WORKING_BELIEF_OUTPUT_SYSTEM),

    MessagesPlaceholder("history"),

    ("human", "{user_message}"),
])