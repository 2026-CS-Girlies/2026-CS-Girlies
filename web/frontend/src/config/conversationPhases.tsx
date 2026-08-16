import type { ReactNode } from 'react'
import type { ConversationPhase } from '@/types/conversation'

type PhaseConfig = {
  step: string
  title: ReactNode
  description: string
}

export const conversationPhaseConfig: Record<ConversationPhase, PhaseConfig> = {
  working_belief: {
    step: '01',
    title: <>Find the <em>Thought</em></>,
    description: 'Let’s narrow down the thought you want to examine.',
  },
  belief_confirmation: {
    step: '01',
    title: <>Find the <em>Thought</em></>,
    description: 'Make sure this feels like the right thought to examine.',
  },
  evidence_form: {
    step: '02',
    title: <>Why Does It <em>Feel True?</em></>,
    description: 'Add the reasons or experiences that make this thought feel believable.',
  },
  reflection: {
    step: '03',
    title: <>Take a <em>Closer Look</em></>,
    description: 'Explore the thought for as long as it feels useful. You decide when you’re ready to see what changed.',
  },
  complete: {
    step: '03',
    title: <>Your <em>Reflection</em></>,
    description: 'Here’s how your perspective shifted during the conversation.',
  },
}
