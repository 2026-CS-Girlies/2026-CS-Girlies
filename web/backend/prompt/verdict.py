from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .common import COMMON_SYSTEM, EXTRACTION_COMMON


VERDICT_SYSTEM = """
Your current task is VERDICT.

Build one balanced thought from the full evidence review.

The balanced thought should integrate:
- concerns that remain genuinely supported,
- conclusions that became narrower or less certain,
- meaningful counterevidence,
- the benefit and cost of important coping strategies when relevant.

Do not simply reverse the original belief.

Aim for a more precise thought, not a more positive thought.

Preserve valid caution.
Avoid absolutes unless the evidence supports them.

Propose one concise balanced thought and ask whether it feels believable.

If the user says it feels too strong, too positive, inaccurate, or incomplete,
revise it rather than defending it.
""".strip()


verdict_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", VERDICT_SYSTEM),
    ("system", """
Situation:
{situation}

Original thought:
{automatic_thought}

Working belief:
{working_belief}

Supporting evidence:
{evidence_for}

Counterevidence / narrowed conclusions:
{evidence_against}

Coping strategies:
{coping_strategies}

Coping benefits:
{coping_benefits}

Coping costs:
{coping_costs}

Current balanced thought, if any:
{balanced_thought}
""".strip()),
    MessagesPlaceholder("history"),
    ("human", "{user_message}"),
])


VERDICT_EXTRACTION_SYSTEM = """
Extract balanced_thought only when the user proposes a revision or clearly
accepts a balanced thought proposed by the assistant.

Set verdict_confirmed=true only when the immediately preceding assistant message
clearly proposed a balanced thought and asked whether that specific thought felt
believable, accurate, or acceptable.

A generic "yes", "no", "I don't think so", or similar short reply must be
interpreted according to the exact preceding assistant question.

Never create a balanced_thought from an answer to an unrelated question.

Example:

Assistant:
"Some people have broken your trust, so being selective makes sense. But that
doesn't mean everyone will respond the same way. Does that feel believable?"

User:
"Yes, that feels right."

Interpretation:
- verdict_confirmed: true

Assistant:
"Has keeping everything inside helped you feel more understood?"

User:
"I don't think so."

Interpretation:
- verdict_confirmed: false
- do not create balanced_thought
""".strip()


verdict_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", EXTRACTION_COMMON),
    ("system", VERDICT_EXTRACTION_SYSTEM),
    MessagesPlaceholder("history"),
    ("human", """
Current balanced thought:
{balanced_thought}

Latest user message:
{user_message}
""".strip()),
])


COMPLETE_SYSTEM = """
End the reflection.

Summarize only information that came from the conversation.

Include:
- Situation
- Original Thought
- Working / Underlying Belief
- Evidence That Made It Feel True
- What Changed After Examining the Evidence
- Relevant Coping Pattern and Its Tradeoff, if one emerged
- Balanced Verdict
- One Small Next Step

Keep the next step optional, concrete, and low-pressure.

Do not ask a question.
Do not introduce a new topic.
Do not restart exploration.
""".strip()


complete_prompt = ChatPromptTemplate.from_messages([
    ("system", COMMON_SYSTEM),
    ("system", COMPLETE_SYSTEM),
    ("system", """
Situation:
{situation}

Original thought:
{automatic_thought}

Working belief:
{working_belief}

Supporting evidence:
{evidence_for}

Counterevidence / narrowed conclusions:
{evidence_against}

Coping strategies:
{coping_strategies}

Coping benefits:
{coping_benefits}

Coping costs:
{coping_costs}

Balanced verdict:
{balanced_thought}
""".strip()),
])
