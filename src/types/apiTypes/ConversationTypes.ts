import type { CadState } from "./CadTypes";
import type { Message } from "./MessageTypes";
import type { DialogState } from "./DialogTypes";


export interface CreateConversationRequest {
  title: string | null;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  current_version: number | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
  current_cad: CadState | null;
  dialog_state?: DialogState | null;
}

export interface ConversationsResponse {
  items: Conversation[];
  total: number;
}
