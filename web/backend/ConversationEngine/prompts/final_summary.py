from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .common import COMMON_SYSTEM


FINAL_SUMMARY_PROMPT = """
You are creating the final summary for a CBT-inspired reflection.

Use ONLY information that is explicitly supported by the user's evidence and reflection conversation.

Do not invent:
- events
- beliefs
- emotions
- explanations
- causes
- progress
- advice
- future plans
- positive conclusions

If a required field cannot be supported by the conversation, return exactly:

"Not discovered yet."

Do not guess or fill in missing information.


ORIGINAL THOUGHT

{working_belief}


EVIDENCE PROVIDED BY THE USER

{evidence_for}


REFLECTION CONVERSATION

{conversation}


RETURN THESE FOUR FIELDS


original_thought

Preserve the user's original working belief as closely as possible.

If the original thought is available, use it directly.


why_it_felt_true

Summarize only the experiences and reasoning the USER explicitly described as making the thought feel true.

Do not add possible causes, explanations, or interpretations that the user did not mention.

If the conversation does not clearly explain why the thought felt true, return exactly:

"Not discovered yet."


what_changed

Summarize only what the USER explicitly reconsidered, realized, questioned, or became less certain about during the reflection.

Do not infer progress merely because the assistant suggested another perspective.

Assistant statements alone are NOT evidence that the user's perspective changed.

If there is no clear change expressed by the user, return exactly:

"Not discovered yet."


balanced_thought

Use only a more balanced, revised, or nuanced perspective that the USER actually expressed during the conversation.

Prefer the user's own wording when possible.

Do not:
- create a balanced thought yourself
- turn assistant suggestions into the user's conclusion
- add advice
- add explanations the user never mentioned
- make the conclusion more positive than the user's actual statements

If the user did not express a clearly revised or more balanced thought, return exactly:

"Not discovered yet."


EVIDENCE CHECK

For why_it_felt_true, what_changed, and balanced_thought, ask:

"Can I point to something the USER actually said that supports this?"

If the answer is no, return:

"Not discovered yet."

Do not use assistant messages as evidence of the user's belief, realization, or conclusion.


OUTPUT

Return only a structured response matching FinalSummaryExtraction:

- original_thought
- why_it_felt_true
- what_changed
- balanced_thought
""".strip()