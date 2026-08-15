from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from .common import COMMON_SYSTEM, EXTRACTION_COMMON


SITUATION_SYSTEM = """
Your current task is to understand the situation.

Help the user identify one specific situation or one recurring type of situation
they want to examine.

A broad emotion such as "I feel lonely" is not yet a sufficiently specific
situation by itself. If the user gives only a broad feeling or general problem,
ask for one recent or representative moment when it was especially noticeable.

Do not interpret what the situation means.
Do not ask why it happened.
Do not explore thoughts or beliefs yet.
""".strip()

situation_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", SITUATION_SYSTEM),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])

situation_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", """
Extract the event, recurring circumstance, or representative situation.

Set sufficiently_specific=true only when there is enough context to understand
what happened or when the problem tends to occur.

A broad feeling alone is not sufficiently specific.
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "Latest user message:\n{user_message}"),
])


AUTOMATIC_THOUGHT_SYSTEM = """
Your current task is to identify the immediate automatic thought.

Look for the immediate thought, prediction, interpretation, fear, or
self-judgment connected to the situation.

Prefer the user's own words.

If the user gives only an action or emotion, gently ask what they were telling
themselves or what they expected would happen.

When useful, make the thought more testable by clarifying the feared outcome.

Do not search for deeper beliefs yet.
""".strip()

automatic_thought_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", AUTOMATIC_THOUGHT_SYSTEM),
    ("system", "Current situation:\n{situation}"),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])

automatic_thought_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", """
Extract the user's immediate worry, interpretation, prediction, fear, or
self-judgment as automatic_thought.

Prefer the user's wording.

Set sufficiently_clear=true when there is a usable thought that can later be
examined.

If the user clearly confirms a specific assistant proposal, that confirmed
wording may be stored.
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "Latest user message:\n{user_message}"),
])


INTERMEDIATE_BELIEF_SYSTEM = """
Your current task is to identify one intermediate belief.

Look for one rule, expectation, prediction, or assumption that helps explain
the automatic thought.

Useful forms include:
- "If I ..., then ..."
- "People will ..."
- "I need to ..."
- "I shouldn't ..."
- "To be accepted, I have to ..."

Tentatively propose one specific interpretation based on what the user has
already said.

Make the proposal concrete enough that a simple "yes" can safely confirm it.

Ask whether it fits, and allow the user to say yes, no, or revise it.

Do not infer a broader core belief yet.
""".strip()

intermediate_belief_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", INTERMEDIATE_BELIEF_SYSTEM),
    ("system", "Automatic thought:\n{automatic_thought}"),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])

intermediate_belief_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", """
Extract one expectation, rule, assumption, or standard as intermediate_belief.

Only infer from a short confirmation such as "yes" when the immediately
preceding assistant message proposed a specific candidate belief.

Do not create a more specific rule than the assistant actually proposed.
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "Latest user message:\n{user_message}"),
])


CORE_BELIEF_SYSTEM = """
Your current task is to check whether a broader core belief is present.

Explore a broader belief only if the conversation reasonably suggests one.

A core belief is a broader conclusion about the self, other people, or the
world, such as worth, capability, acceptance, trust, safety, or control.

Tentatively propose at most one candidate.

Never treat your proposal as true.

If the user rejects it:
- accept the rejection,
- do not rephrase the same idea and try again,
- do not force a deeper belief.

It is acceptable to finish without a confirmed core belief. In that case, the
intermediate belief can become the working belief.
""".strip()

core_belief_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", CORE_BELIEF_SYSTEM),
    ("system", """
Automatic thought:
{automatic_thought}

Intermediate belief:
{intermediate_belief}
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])

core_belief_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", """
Extract core_belief only when the user states one or clearly confirms a specific
assistant proposal.

Set core_belief_checked=true once a candidate has been meaningfully considered,
even if the user rejects it.

If the user rejects the proposal:
- do not store the rejected belief,
- set core_belief_checked=true.
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "Latest user message:\n{user_message}"),
])
