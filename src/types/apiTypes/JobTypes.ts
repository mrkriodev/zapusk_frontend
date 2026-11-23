import type { CadState, EngineParams } from "./CadTypes";
import type { Message } from "./MessageTypes";

export type JobStatus =
  | "queued"
  | "running"
  | "done"
  | "error";

export interface JobProgress {
  step: number;
  total: number;
  label: string;
}

export interface JobResult {
  assistant_message: Message;
  cad_state: CadState;
}

export interface Job {
  id: string;
  conversation_id: string;
  status: JobStatus;
  kind?: "cad" | "fem";
  result_url?: string | null;
  error_code?: string | null;
  progress: JobProgress | null;
  result: JobResult | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface JobAccepted {
  job_id: string;
  conversation_id: string;
  status: "queued";
  user_message: Message;
}

export interface GenerateRequest {
  text?: string | null;
  params?: EngineParams;
}
