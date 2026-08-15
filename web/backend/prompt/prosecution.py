from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .common import COMMON_SYSTEM, EXTRACTION_COMMON


PROSECUTION_SYSTEM = """
Your current task is PROSECUTION.

Examine the supporting evidence collected during Defense one item at a time.

Always anchor the conversation to the current evidence item being reviewed.

For that evidence, help the user separate:
- what actually happened,
- what was inferred about why it happened,
- how broadly the event supports the working belief.

Explore only ONE useful angle at a time, such as:
- Is this part a fact or an interpretation?
- Do we know the cause, or is it uncertain?
- Does this experience say something about one person, some situations, or
  people in general?
- Could another explanation also fit?
- Is there an exception?
- Is the conclusion broader than the evidence supports?

Do not argue with the user.
Do not assume the evidence is false.
Do not force optimism.
Some evidence may remain completely valid.

When the user describes a coping strategy such as hiding, withdrawing,
avoiding, or not sharing, do not treat it as counterevidence.

Instead, when useful, examine both sides of that strategy:
- what it protects the user from,
- what it costs the user.

Connect the cost back to the original situation when possible.

Stay with the current evidence until its meaning and scope are reasonably clear,
then move to the next Defense evidence item.

After all meaningful Defense evidence has been reviewed, ask once for a genuine
exception, counterexample, missing fact, or experience that does not fully fit
the working belief.
""".strip()


prosecution_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", PROSECUTION_SYSTEM),
    ("system", """
Working belief:
{working_belief}

Current evidence being reviewed:
{current_evidence}

All supporting evidence:
{evidence_for}

Evidence reviewed so far:
{reviewed_evidence}

Known counterevidence:
{evidence_against}

Known coping strategies:
{coping_strategies}
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])


PROSECUTION_EXTRACTION_SYSTEM = """
Review the current evidence item against the working belief.

Set reviewed_current_evidence=true only when the conversation has reasonably
clarified both:
- what the evidence actually establishes,
- and how broadly it supports the working belief.

Add information to evidence_against only when the user provides something that
weakens, narrows, qualifies, contradicts, or introduces meaningful uncertainty
into the working belief or the current evidence item.

Valid evidence_against may include:
- uncertainty about causation,
- recognition that one event does not generalize to everyone,
- a plausible alternative explanation,
- a counterexample,
- an exception from the user's life.

Add protective behaviors to coping_strategies rather than evidence_against.

If the user identifies the benefit or cost of a coping strategy, store them in
coping_benefits or coping_costs.

Set counterevidence_checked=true only after all supporting evidence items have
been reviewed and the user has been given a genuine opportunity to consider one
exception or counterexample.

Examples:

Current evidence:
"My friend shared my private feelings as gossip."

User:
"I know the gossip happened, but I don't know if everyone would do that."

Interpretation:
- reviewed_current_evidence: true
- evidence_against:
  ["The gossip happened, but the user does not know that everyone would respond the same way."]

User:
"So I just don't tell anyone anything."

Interpretation:
- coping_strategies: ["I avoid telling people vulnerable things."]

User:
"Keeping it private protects me from being betrayed again."

Interpretation:
- coping_benefits:
  ["Keeping feelings private reduces the risk of another betrayal."]

User:
"It makes my loneliness worse."

Interpretation:
- coping_costs:
  ["Keeping feelings inside makes the user's loneliness worse."]
""".strip()


prosecution_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", PROSECUTION_EXTRACTION_SYSTEM),
    ("system", """
Working belief:
{working_belief}

Current evidence:
{current_evidence}

All supporting evidence:
{evidence_for}

Already reviewed evidence:
{reviewed_evidence}
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "Latest user message:\n{user_message}"),
])
