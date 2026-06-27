export type MessageRole = "user" | "assistant"

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  cad_state_id: string | null
  created_at: string
}

export interface SendMessageRequest {
  text: string
}

export interface SendMessageArgs {
  conversationId: string
  text: string
}