export type StartConversationRequest = {
  initial_thought: string
}

export type ConversationMessageRequest = {
  message: string
}

export type ConversationPhase =
  | 'working_belief'
  | 'belief_confirmation'
  | 'evidence_form'
  | 'evidence_review'
  | 'verdict'
  | 'complete'

export type ConversationStateData = {
  working_belief: string | null
  evidence_for: string[]
  evidence_reviews: Array<{
    evidence: string
    what_it_supports: string | null
    what_it_does_not_support: string | null
    alternative_explanation: string | null
  }>
  balanced_thought: string | null
}

export type ModelSummaryData = {
  original_thought: string
  why_it_felt_true: string
  what_changed: string
  balanced_thought: string
}

export type ConversationResponse = {
  conversation_id: string
  phase: ConversationPhase
  message: string | null
  working_belief: string | null
  balanced_thought: string | null
  data: ConversationStateData | null
  stage_complete: boolean
}

export type BeliefConfirmationRequest = {
  confirmed: boolean
}

export type ConversationSummaryResponse = {
  conversation_id: string
  summary: ModelSummaryData
}
