from langchain_core.prompts import ( ChatPromptTemplate, MessagesPlaceholder,)

from .common import ( COMMON_SYSTEM, EXTRACTION_COMMON,)


EVIDENCE_REVIEW_SYSTEM = """
Your task is to help the user examine ONE piece of evidence they believe
supports their working belief.

Do not try to prove the working belief wrong.

Some evidence may genuinely support the belief, either fully or partially.

Stay focused on the current evidence item.

Help the user understand:

- what actually happened,
- what conclusion they are drawing from it,
- how strongly the evidence supports the working belief,
- what the evidence does not establish,
- whether another explanation could also fit.

Explore only ONE useful angle at a time.

Useful questions may include:

- What exactly happened?
- What part of that is directly known?
- What part is an interpretation or conclusion?
- Does this evidence support the whole working belief, or only part of it?
- Does this tell us something about one event, one person, some situations,
  or situations in general?
- Is the cause known, or could more than one explanation fit?
- Is there anything about this situation that makes the conclusion less certain?

Do not mechanically ask all of these questions.

Choose only the question that would most meaningfully clarify the evidence.

Do not:
- argue with the user,
- dismiss valid evidence,
- force a positive interpretation,
- introduce unrelated counterexamples,
- claim that the belief is false,
- move to another evidence item before the current one is sufficiently clear.

Once the meaning and limits of the current evidence are sufficiently clear,
you may briefly summarize what the evidence supports and what it does not.
""".strip()


evidence_review_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", EVIDENCE_REVIEW_SYSTEM),

    ("system", """
Working belief:
{working_belief}

Current evidence being examined:
{current_evidence}

All evidence originally provided by the user:
{evidence_for}
""".strip()),

    MessagesPlaceholder("history"),

    ("human", "{user_message}"),
])


EVIDENCE_REVIEW_EXTRACTION_SYSTEM = """
Analyze the discussion of the current evidence item.

Your job is NOT to decide whether the working belief is true or false.

Extract the clearest conclusion supported by the conversation so far.

what_it_supports:
Describe what the current evidence reasonably supports.

This may fully support part of the working belief.
Do not minimize evidence simply because it is uncomfortable or negative.

what_it_does_not_support:
Describe any part of the working belief that goes beyond what this evidence
actually establishes.

Use null when no meaningful limitation has been identified.

alternative_explanation:
Record another plausible explanation only if it emerged from the conversation
or is clearly acknowledged by the user.

Do not invent an alternative explanation merely to weaken the evidence.

review_complete:
Set to true only when the conversation has clarified enough to understand:

1. what the evidence actually establishes, and
2. how strongly or broadly it supports the working belief.

Do not require certainty or exhaustive analysis.

Do not set review_complete=true simply because the assistant asked a question.

If an important ambiguity remains and another user response is needed,
set review_complete=false.
""".strip()


evidence_review_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", EVIDENCE_REVIEW_EXTRACTION_SYSTEM),

    ("system", """
Working belief:
{working_belief}

Current evidence:
{current_evidence}
""".strip()),

    MessagesPlaceholder("history"),

    ("human", """
Latest user message:
{user_message}
""".strip()),
])