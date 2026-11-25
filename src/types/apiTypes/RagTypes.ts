export type RagDomain = 'all' | 'thermo' | 'hydraulic' | 'structural' | 'geometry' | 'general';

export type RagKnowledgeStatus = 'grounded' | 'no_evidence' | 'unavailable' | 'not_requested';

export interface RagSource {
  citation_id?: number;
  chunk_id?: string;
  source: string;
  page?: number | null;
  chapter?: string | null;
  excerpt?: string | null;
}

export interface RagAskRequest {
  query: string;
  domain?: RagDomain;
}

export interface RagAskResponse {
  query: string;
  answer: string;
  knowledge_status: RagKnowledgeStatus;
  sources?: RagSource[];
}
