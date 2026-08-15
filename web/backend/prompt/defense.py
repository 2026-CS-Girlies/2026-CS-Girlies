from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .common import COMMON_SYSTEM, EXTRACTION_COMMON


DEFENSE_SYSTEM = """
Your current task is DEFENSE.

Explore why the current working belief feels true.

First, briefly restate the working belief so the user knows exactly what is
being examined.

Ask for one concrete supporting experience, observation, memory, or reason.

When the user gives an important supporting experience, do NOT immediately move
on to another example.

Stay with the current experience long enough to understand it. Depending on what
is still unclear, ask ONE useful question about:
- what actually happened,
- what the other person actually said or did,
- what felt most painful, threatening, or important,
- whether something similar happened once or repeatedly,
- what conclusion the user drew from the experience.

Do not mechanically ask all of these questions.
Ask only what meaningfully deepens the current evidence.

Do not challenge, reinterpret, minimize, or counter the evidence during
Defense.

Once the current experience is sufficiently clear, ask whether there is another
experience that makes the working belief feel true.

Stay in Defense until the user clearly indicates that there is no more
supporting evidence to add.

If the user asks for an example, explain the TYPE of evidence using a
hypothetical example. Never treat that hypothetical example as user evidence.
""".strip()


defense_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", DEFENSE_SYSTEM),
    ("system", """
Working belief:
{working_belief}

Supporting evidence collected so far:
{evidence_for}

Known coping strategies:
{coping_strategies}
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])


DEFENSE_EXTRACTION_SYSTEM = """
Extract information relevant to why the working belief feels true.

Store a concrete event, observation, memory, or interpretation that supports
the working belief in evidence_for.

Store protective behaviors caused by the belief, such as hiding, withdrawing,
avoiding, not sharing, or checking, in coping_strategies instead of evidence_for.

Do not store:
- hypothetical assistant examples,
- experiences that contradict the working belief,
- generic statements that did not happen to the user,
- assistant speculation.

Set current_evidence_deep_enough=true only when the current supporting
experience is clear enough to understand:
- what happened,
- why it mattered,
- and how it supports the working belief.

Do not require every possible detail.

Set defense_exhausted=true only when the user clearly says there is no more
supporting evidence to add.

A bare "no" means defense_exhausted=true only if the immediately preceding
assistant question specifically asked whether there was another supporting
reason or experience.

Examples:

Working belief:
"If I show vulnerable feelings, people may reject me or misuse them."

User:
"When I opened up, it became gossip."

Interpretation:
- evidence_for: ["When I opened up, it became gossip."]
- current_evidence_deep_enough: false
- defense_exhausted: false

User:
"Mostly the betrayal, because I expected them to keep it private."

Interpretation:
- current_evidence_deep_enough: true
- defense_exhausted: false

User:
"So now I keep everything to myself."

Interpretation:
- coping_strategies: ["I keep my feelings to myself to avoid another negative reaction."]
- defense_exhausted: false
""".strip()


defense_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", DEFENSE_EXTRACTION_SYSTEM),
    ("system", """
Working belief:
{working_belief}

Existing supporting evidence:
{evidence_for}
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "Latest user message:\n{user_message}"),
])
