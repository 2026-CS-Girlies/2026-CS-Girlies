export interface Message {
  id: number
  role: 'assistant' | 'user'
  text: string
}
