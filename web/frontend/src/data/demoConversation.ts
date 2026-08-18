import type {
  ConversationPhase,
  ConversationResponse,
  ModelSummaryData,
} from '@/types/conversation'

export const DEMO_THOUGHT =
  `I keep seeing everyone doing amazing things online, and I feel like I'm falling behind.`

export type DemoTurn = {
  phase: ConversationPhase
  user: string
  assistant: string
  nextPhase?: ConversationPhase
  workingBelief?: string
}

export const DEMO_TRANSITIONS = {
  beliefConfirmed:
    `Let's make the strongest case for that thought first. What evidence makes “I'm falling behind” feel true?`,

  beliefRejected:
    `What would be a more accurate way to say the thought that's bothering you?`,

  evidenceComplete:
    `Okay. These are real things you're seeing: your friend got promoted, someone you know started a company, and you're seeing people reach milestones you want. We don't need to dismiss any of that. Let's look at what those facts actually tell us — and what your mind may be adding to them. Start with your friend's promotion. What does that seem to say about where you are in your own life?`,
}

export const DEMO_TURNS: DemoTurn[] = [
  {
    phase: 'working_belief',
    user: `People I know are getting promoted, moving to new cities, traveling, starting businesses... and I feel like I'm just standing still.`,
    assistant: `When you see those updates, what do you start telling yourself about your own life?`,
  },
  {
    phase: 'working_belief',
    user: `That everyone else is moving forward and I'm wasting my time.`,
    assistant: `So the thought might be:`,
    workingBelief: `Everyone else is moving forward, and I'm falling behind.`,
    nextPhase: 'belief_confirmation',
  },
  {
    phase: 'evidence_form',
    user: `My friend just got promoted.`,
    assistant: `That's one thing making the comparison feel real. What else?`,
  },
  {
    phase: 'evidence_form',
    user: `Someone I went to school with just launched a company.`,
    assistant: `Okay. Anything else that makes “I'm falling behind” feel true?`,
  },
  {
    phase: 'evidence_form',
    user: `I keep seeing people traveling, buying homes, getting engaged. Meanwhile, nothing big is happening for me.`,
    assistant: `That gives us enough to look at. Let's separate what you're actually seeing from what those updates seem to mean about you.`,
  },
  {
    phase: 'reflection',
    user: `My friend really did get promoted.`,
    assistant: `Yes. That's a fact. What does your mind add after “my friend got promoted”?`,
  },
  {
    phase: 'reflection',
    user: `That she's ahead of me.`,
    assistant: `Does her promotion tell us where your whole life is supposed to be right now?`,
  },
  {
    phase: 'reflection',
    user: `No. Not really.`,
    assistant: `So “she reached a milestone I want” and “I'm behind in life” aren't quite the same claim.`,
  },
  {
    phase: 'reflection',
    user: `But it's not just her. I see stuff like this constantly.`,
    assistant: `When you scroll through those posts, what parts of other people's lives are you mostly seeing?`,
  },
  {
    phase: 'reflection',
    user: `The good parts, I guess. Promotions, trips, relationships, achievements.`,
    assistant: `And how much do you know about the ordinary, uncertain, or difficult parts of those same lives?`,
  },
  {
    phase: 'reflection',
    user: `Basically none.`,
    assistant: `So are you comparing your whole life with their whole lives — or your whole life with the moments they chose to post?`,
  },
  {
    phase: 'reflection',
    user: `...My whole life with what they posted.`,
    assistant: `That's a very different comparison.`,
  },
  {
    phase: 'reflection',
    user: `I guess I wasn't really counting anything in my own life unless it looked impressive.`,
    assistant: `What has actually changed or grown in your life recently, even if it isn't the kind of thing you'd announce online?`,
  },
  {
    phase: 'reflection',
    user: `I've gotten better at my job. I've been learning new things. And honestly, I've become more independent than I was a year ago.`,
    assistant: `So your life hasn't been standing still. Some of the progress just doesn't look like a headline.`,
  },
  {
    phase: 'reflection',
    user: `Yeah. I still want some of the things I'm seeing, though.`,
    assistant: `That can still be true. Seeing someone else's milestone can show you what you want without proving that you're behind. How would you describe the situation now?`,
  },
  {
    phase: 'reflection',
    user: `Other people are reaching milestones I want, and that does make me think about where I'm going. But I'm comparing all of my life to the best parts of theirs. I'm making progress too, even if it looks different.`,
    assistant: `What part of the original thought still feels useful?`,
  },
  {
    phase: 'reflection',
    user: `That I should think more intentionally about what I actually want next.`,
    assistant: `Exactly. “I want to decide what matters to me next” gives you direction. “Everyone is ahead of me” turns comparison into a verdict about your whole life. Is there another thought you'd like to test?`,
  },
]

export const DEMO_SUMMARY: ModelSummaryData = {
  original_thought:
    `Everyone else is moving forward, and I'm falling behind.`,
  why_it_felt_true:
    `I kept seeing promotions, businesses, travel, relationships, and other milestones online while my own life felt less eventful.`,
  what_changed:
    `Those milestones are real, but I was comparing my whole life with selected moments from other people's lives. I was also ignoring forms of progress in my own life that are less visible or impressive online.`,
  balanced_thought:
    `Other people's milestones can show me what I want, but they don't tell me where my life should be. My progress may look different, and I can decide what matters to me next.`,
}

export const DEMO_START_RESPONSE: ConversationResponse = {
  conversation_id: 'demo-conversation',
  phase: 'working_belief',
  message:
    `It sounds like seeing other people's updates is starting to say something about your own life. What do you start telling yourself when you see them?`,
  working_belief: null,
  data: null,
  stage_complete: false,
}
