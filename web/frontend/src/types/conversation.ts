export type CBTStage =
  | 'ct_guided_identification'
  | 'dat_driven_restructuring'

export type CTPhase =
  | 'situation'
  | 'automatic_thought'
  | 'intermediate_belief'
  | 'core_belief'

export type DATPhase =
  | 'claim'
  | 'defense'
  | 'defense_review'
  | 'prosecution'
  | 'prosecution_review'
  | 'verdict'
  | 'complete'

export type CTReviewData = {
  situation: string
  automatic_thought: string
  intermediate_belief: string
  core_belief: string
}

export type DATStateData = {
  claim: string
  defense: string[]
  defense_review: string
  prosecution: string[]
  prosecution_review: string
  verdict: string
}

export type FinalReflectionData = {
  situation: string
  original_thought: string
  why_it_felt_true: string
  what_it_may_have_left_out: string
  balanced_thought: string
  next_step: string
}

export type StartConversationRequest = {
  initial_thought: string
}

export type ConversationMessageRequest = {
  message: string
}

export type UpdateCTReviewRequest = {
  data: CTReviewData
}

export type StartDATRequest = {
  data: CTReviewData
}

export type CTConversationResponse = {
  conversation_id: string
  stage: 'ct_guided_identification'
  phase: CTPhase
  message: string
  data: CTReviewData
  stage_complete: boolean
}

export type DATConversationResponse = {
  conversation_id: string
  stage: 'dat_driven_restructuring'
  phase: DATPhase
  message: string
  data: DATStateData
  stage_complete: boolean
  result?: FinalReflectionData
}

// for one-step conversation

export type ModelSummaryData = {
  automatic_thought: string
  intermediate_belief: string
  core_belief: string
  core_belief_inferred: boolean
  balanced_thought: string
  current_progress: string
  next_steps: string[]
}


export type OneStepConversationResponse = {
  conversation_id: string
  stage: string
  phase: string | null
  message: string | null
  data: ModelSummaryData | null
  stage_complete: boolean
}