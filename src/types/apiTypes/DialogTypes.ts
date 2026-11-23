import type { JsonObject } from './CadTypes';
import type { Message } from './MessageTypes';

export interface DialogChatRequest {
  request_id: string;
  text: string;
  expected_draft_revision?: number | null;
  product_id?: string | null;
}
export interface DraftSummaryItem {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string | null;
}
export interface DialogDraft {
  params: JsonObject;
  revision: number;
  confirmed_fields: string[];
  missing_inputs: string[];
  summary?: DraftSummaryItem[];
  baseline_version?: number | null;
  base_version?: number | null;
  product_id?: string;
  ready_to_generate?: boolean;
}
export interface DialogGeneration {
  active_job_id?: string | null;
  active_draft_revision?: number | null;
  pending?: boolean;
}
export interface DialogState {
  draft: DialogDraft;
  generation: DialogGeneration;
}
export interface KnowledgeSource {
  citation_id: number;
  chunk_id: string;
  source: string;
  page: number;
  chapter: string;
  excerpt: string;
}
export interface DialogChatOut extends DialogState {
  conversation_id: string;
  request_id: string;
  user_message: Message;
  assistant_message: Message;
  action: 'reply' | 'clarify' | 'draft_updated' | 'generation_started' | 'generation_pending';
  knowledge_status: 'not_requested' | 'grounded' | 'no_evidence' | 'unavailable';
  sources?: KnowledgeSource[];
}
export interface DialogChatArgs {
  conversationId: string;
  request: Readonly<DialogChatRequest>;
  retryOnce?: boolean;
}
