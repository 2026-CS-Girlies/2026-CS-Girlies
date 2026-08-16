import type { ReactNode } from 'react'
import type { ConversationPhase } from '@/types/conversation'

type PhaseConfig = {
  step: string
  title: ReactNode
  description: string
}

// TODO: Update writing later
export const conversationPhaseConfig: Record<
  ConversationPhase,
  PhaseConfig
> = {
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

  evidence_review: {
    step: '03',
    title: <>Take a <em>Closer Look</em></>,
    description: 'Let’s examine how strongly each reason supports the thought.',
  },

  verdict: {
    step: '04',
    title: <>A More <em>Balanced View</em></>,
    description: 'Let’s see what feels more accurate after looking at the evidence.',
  },

  verdict_confirmation: {
    step: '04',
    title: <>A More <em>Balanced View</em></>,
    description: 'See whether this new view feels accurate to you.',
  },

  complete: {
    step: '04',
    title: <>Your <em>Reflection</em></>,
    description: 'Here’s what changed after looking at the thought more closely.',
  },
}