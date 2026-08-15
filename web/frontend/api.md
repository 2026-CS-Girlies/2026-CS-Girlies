LANDING
Frontend
{
  initial_thought
}
        │
        ▼

01 / 04 FIRST CONVERSATION
Frontend → Backend
{
  conversation_id,
  message
}

Backend → Frontend
{
  stage,
  phase,
  message,
  data: CTReviewData,
  stage_complete
}
        │
        ▼

02 / 04 REVIEW
Frontend displays:

CTReviewData
{
  situation,
  automatic_thought,
  intermediate_belief,
  core_belief
}

User edits
        │
        ▼

Frontend → Backend
{
  conversation_id,
  data: CTReviewData
}
        │
        ▼

03 / 04 SECOND CONVERSATION
Frontend → Backend
{
  conversation_id,
  message
}

Backend → Frontend
{
  stage,
  phase,
  message,
  data: DATStateData,
  stage_complete
}
        │
        ▼

04 / 04 FINAL REFLECTION
Backend → Frontend
{
  result: FinalReflectionData
}