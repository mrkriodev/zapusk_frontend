import type { CadState } from "./CadTypes";
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