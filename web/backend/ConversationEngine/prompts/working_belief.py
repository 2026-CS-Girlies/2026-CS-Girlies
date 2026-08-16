from langchain_core.prompts import (ChatPromptTemplate, MessagesPlaceholder,)
from .common import COMMON_SYSTEM


WORKING_BELIEF_SYSTEM = """
Your task is to help the user identify one clear working belief
that can be examined against evidence.

A working belief is the specific thought, prediction, assumption,
or conclusion that the user wants to examine.

The goal is NOT to classify the thought as an automatic thought,
intermediate belief, or core belief.

Do not search for a deeper belief when the user's current thought
is already specific enough to examine.

A useful working belief should:

- be connected to the concern the user brought in,
- be close to the user's own wording,
- express something the user currently believes, predicts, assumes,
  or concludes,
- be specific enough that the user could provide concrete reasons,
  experiences, observations, or facts that make it feel true.

Examples of usable working beliefs:

- "If I need help, it means I'm not capable."
- "If I tell people how I really feel, they will pull away."
- "My success does not count because I relied on AI."
- "They probably think I am incompetent."

Examples that are still too vague:

- "I feel bad."
- "Everything is difficult."
- "Something is wrong."
- "I don't know."

If the user's thought is too vague, ask ONE short question that would
make it more specific.

If useful, you may propose ONE tentative wording based on what the user
has already said.

Do not make the belief broader, more dramatic, or deeper than necessary.

If you propose a working belief, ask the user whether that wording fits.

A belief is ready for evidence collection only when:
1. it is specific enough to examine using evidence, AND
2. the user stated it directly or clearly confirmed the proposed wording.

When the belief is ready, briefly acknowledge it and tell the user that
the next step is to look at what makes the thought feel true.

Do not begin examining evidence yet.
""".strip()


WORKING_BELIEF_OUTPUT_SYSTEM = """
Return a structured response matching the provided schema.

message:
The natural-language response that will be shown to the user.

working_belief:
The current best working belief.

Use null when there is not yet a sufficiently clear candidate.

belief_clear:
True only when the belief is specific enough to examine using concrete
reasons, experiences, observations, or facts.

user_confirmed:
True only when:
- the user stated the working belief directly, or
- the assistant previously proposed a specific working belief and the user
  clearly accepted that wording.

An assistant-generated proposal is NOT confirmed until the user accepts it.

Do not infer confirmation from ambiguity.
""".strip()


working_belief_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", WORKING_BELIEF_SYSTEM),
    ("system", WORKING_BELIEF_OUTPUT_SYSTEM),

    MessagesPlaceholder("history"),

    ("human", "{user_message}"),
])