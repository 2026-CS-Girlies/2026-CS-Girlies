import type { ConversationPhase, ConversationResponse, ModelSummaryData } from '@/types/conversation'

export const DEMO_THOUGHT = `I feel like I'm falling behind.\n\nEverything is changing so fast, especially with AI.`

export type DemoTurn = {
  phase: ConversationPhase
  user: string
  assistant: string
  nextPhase?: ConversationPhase
  workingBelief?: string
}

export const DEMO_TURNS: DemoTurn[] = [
  {
    phase: 'working_belief',
    user: `That my skills are becoming obsolete, and eventually I'll be left behind.`,
    assistant: `How true does that feel right now?`,
  },
  {
    phase: 'working_belief',
    user: `90%.`,
    assistant: `What has been happening lately that makes it feel so true?`,
  },
  {
    phase: 'working_belief',
    user: `New AI tools come out constantly.

People are building things much faster than I can.

Job postings ask for skills I don't have.

And people younger than me already know technologies I haven't learned.`,
    assistant: `Which of those hits you hardest?`,
  },
  {
    phase: 'working_belief',
    user: `Seeing people do things faster than me.

It makes what I spent years learning feel worthless.`,
    assistant: `So the thought underneath that might be:`,
    workingBelief: `I learned the wrong things, and now I'm too late.`,
    nextPhase: 'belief_confirmation',
  },
  {
    phase: 'evidence_form',
    user: `Some of my work can already be automated.`,
    assistant: `What else makes “I'm being left behind” feel true?`,
  },
  {
    phase: 'evidence_form',
    user: `I don't know every new technology.`,
    assistant: `Anything else?`,
  },
  {
    phase: 'evidence_form',
    user: `Jobs keep asking for skills I haven't used.`,
    assistant: `Those are real changes. When that feels like enough evidence to work with, continue and we'll look at what they actually mean.`,
  },
  {
    phase: 'reflection',
    user: `Basic coding. Boilerplate. Some analysis.`,
    assistant: `And when you use those tools now, does your old knowledge stop mattering?`,
  },
  {
    phase: 'reflection',
    user: `Not really.

I can usually tell when the output is bad, and I know what to ask for.`,
    assistant: `So maybe:

“AI can do some tasks I learned”

doesn't necessarily mean:

“What I learned is worthless.”

Could it be closer to:

“The value of doing some tasks manually is changing, but my knowledge still helps me use the tools well.”`,
  },
  {
    phase: 'reflection',
    user: `Yeah. That's much more accurate.`,
    assistant: `Now take this one:

“Other people know newer technologies than I do.”

What conclusion do you make from that?`,
  },
  {
    phase: 'reflection',
    user: `That they're ahead of me.`,
    assistant: `Do you know things they don't?`,
  },
  {
    phase: 'reflection',
    user: `Sure. I understand older systems much better.`,
    assistant: `So are they simply ahead of you?

Or are you comparing only one dimension — how recent the technology is?`,
  },
  {
    phase: 'reflection',
    user: `...Probably the second one.`,
    assistant: `And when a job asks for skills you don't have yet, your mind says?`,
  },
  {
    phase: 'reflection',
    user: `“I'm not qualified anymore.”`,
    assistant: `Did you already know everything you needed before starting your previous jobs?`,
  },
  {
    phase: 'reflection',
    user: `No. I learned a lot while doing them.`,
    assistant: `Then maybe:

“There are things I don't know yet”

and

“I'm no longer capable of keeping up”

aren't the same statement.`,
  },
  {
    phase: 'reflection',
    user: `Yeah. They're not.`,
    assistant: `There's another piece of evidence we haven't included yet.

Have you had to learn unfamiliar technology before?`,
  },
  {
    phase: 'reflection',
    user: `Of course.

Cloud tools, Python, frameworks...

Even AI tools.`,
    assistant: `So while technology has been changing, you've also been adapting.

That doesn't mean you don't need to learn anything new.

Some of your skills may genuinely need updating.

But is:

“I need to keep adapting”

the same as:

“I'm becoming obsolete”?`,
  },
  {
    phase: 'reflection',
    user: `No.

That feels very different.`,
    assistant: `Without pretending the world isn't changing, how would you describe the situation now?`,
  },
  {
    phase: 'reflection',
    user: `Maybe:

“Technology is changing quickly, and I do need to keep learning. Some of what I know may become less valuable, but my experience still matters. I've adapted before, and I don't need to learn everything — I need to learn what matters next.”`,
    assistant: `How true does the original thought feel now?`,
  },
  {
    phase: 'reflection',
    user: `Maybe 40%.`,
    assistant: `And what part still feels true?`,
  },
  {
    phase: 'reflection',
    user: `That I shouldn't stop learning.`,
    assistant: `That's useful information.

It's different from a prediction that you'll be left behind.

BEFORE

“Things are changing.”
→ “I'm becoming obsolete.”

AFTER

“Things are changing.”
→ “I need to keep adapting.”

BALANCED VIEW

“I don't need to keep up with everything. I need to stay capable of learning what matters.”

Would you like to see how your thought has changed?`,
  },
]

export const DEMO_SUMMARY: ModelSummaryData = {
  original_thought: `My skills are becoming obsolete, and eventually I'll be left behind.`,
  why_it_felt_true: `AI tools are changing work quickly, some tasks can already be automated, job postings ask for unfamiliar skills, and other people sometimes seem to be moving faster.`,
  what_changed: `The changes are real, but they do not prove that my experience is worthless or that I cannot keep up. My existing knowledge helps me judge and use new tools, and I have adapted to unfamiliar technology before. “Things are changing” can mean “I need to keep adapting” rather than “I'm becoming obsolete.”`,
  balanced_thought: `I don't need to keep up with everything. I need to stay capable of learning what matters.`,
}

export const DEMO_START_RESPONSE: ConversationResponse = {
  conversation_id: 'demo-conversation',
  phase: 'working_belief',
  message: `It sounds like this is about more than learning a new tool.\n\nWhat are you afraid all this change means about you?`,
  working_belief: null,
  data: null,
  stage_complete: false,
}
