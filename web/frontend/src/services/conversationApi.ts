import type {
  BeliefConfirmationRequest,
  BeliefConfirmationResponse,
  ConversationMessageRequest,
  CTConversationResponse,
  CTReviewData,
  DATConversationResponse,
  OneStepConversationResponse,
  StartConversationRequest,
  UpdateCTReviewRequest,
} from '@/types/conversation'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function startConversation(initialThought: string) {
  const body: StartConversationRequest = { initial_thought: initialThought }

  return request<CTConversationResponse>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function sendCTMessage(conversationId: string, message: string) {
  return request<CTConversationResponse>(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export function updateCTReview(conversationId: string, data: CTReviewData) {
  const body: UpdateCTReviewRequest = { data }

  return request<{ success: boolean }>(`/api/conversations/${conversationId}/ct-review`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function startDAT(conversationId: string, data: CTReviewData) {
  return request<DATConversationResponse>(`/api/conversations/${conversationId}/dat/start`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  })
}

export function sendDATMessage(conversationId: string, message: string) {
  return request<DATConversationResponse>(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}


export function startOneStepConversation(initialThought: string): Promise<OneStepConversationResponse> {
  const body: StartConversationRequest = {initial_thought: initialThought,}

  return request<OneStepConversationResponse>('/api/conversations',{
      method: 'POST',
      body: JSON.stringify(body),
    }
  )
}

export function sendConversationMessage(conversationId: string, message: string): Promise<OneStepConversationResponse> {
  const body: ConversationMessageRequest = {message,}

  return request<OneStepConversationResponse>(`/api/conversations/${conversationId}/messages`,{
      method: 'POST',
      body: JSON.stringify(body),
    }
  )
}


export function confirmBelief(
  conversationId: string,
  confirmed: boolean,
): Promise<BeliefConfirmationResponse> {
  const body: BeliefConfirmationRequest = {
    confirmed,
  }

  return request<BeliefConfirmationResponse>(
    `/api/conversations/${conversationId}/belief-confirmation`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}