import type {
  BeliefConfirmationRequest,
  ConversationMessageRequest,
  ConversationResponse,
  ConversationSummaryResponse,
  StartConversationRequest,
} from '@/types/conversation'

// const API_BASE_URL = 'http://localhost:8000'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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

export function startConversation(initialThought: string): Promise<ConversationResponse> {
  const body: StartConversationRequest = { initial_thought: initialThought }

  return request<ConversationResponse>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function sendConversationMessage(conversationId: string, message: string): Promise<ConversationResponse> {
  const body: ConversationMessageRequest = { message }

  return request<ConversationResponse>(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function confirmBelief(conversationId: string, confirmed: boolean): Promise<ConversationResponse> {
  const body: BeliefConfirmationRequest = { confirmed }

  return request<ConversationResponse>(`/api/conversations/${conversationId}/belief-confirmation`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function completeEvidenceCollection(conversationId: string): Promise<ConversationResponse> {
  return request<ConversationResponse>(`/api/conversations/${conversationId}/evidence/complete`, {
    method: 'POST',
  })
}

export function completeReflection(conversationId: string): Promise<ConversationResponse> {
  return request<ConversationResponse>(`/api/conversations/${conversationId}/reflection/complete`, {
    method: 'POST',
  })
}

export function getConversationSummary(conversationId: string): Promise<ConversationSummaryResponse> {
  return request<ConversationSummaryResponse>(`/api/conversations/${conversationId}/summary`, {
    method: 'GET',
  })
}