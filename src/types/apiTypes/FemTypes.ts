import type { JsonObject } from './CadTypes';

export type FemStatus = 'queued' | 'running' | 'ok' | 'failed' | 'timed_out' | 'cancelled';
export interface FemRunRequest {
  model_params?: JsonObject | null;
  calculation_settings?: JsonObject | null;
  max_growth?: number;
  timeout_s?: number;
  keep_heavy_artifacts?: boolean;
  note?: string | null;
}
export interface FemJobAccepted {
  job_id: string;
  conversation_id: string;
  fem_run_id: string;
  version: number;
  status?: string;
}
export interface FemSummary {
  max_stress_mpa?: number | null;
  limit_stress_mpa?: number | null;
  max_displacement_mm?: number | null;
  total_mass_kg?: number | null;
  node_count?: number | null;
  element_count?: number | null;
  duration_s?: number | null;
  freecad_version?: string | null;
  passes?: boolean | null;
  text?: string | null;
}
export interface FemPrecheck {
  source_version: number;
  source_cad_state_id: string;
  precheck_run_id: string;
  json_changes: string[];
  fem_started: false;
}
export interface FemRun {
  id: string;
  conversation_id: string;
  cad_state_id?: string | null;
  version: number;
  input_model_version?: string | null;
  run_id: string;
  status: FemStatus;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  summary?: FemSummary | null;
  pre_fem?: FemPrecheck | null;
  updated?: boolean;
  json_changes?: string[];
  clamped?: JsonObject[];
  model_params_new?: JsonObject | null;
  next_action?: { method?: string; url: string; body_hint?: string } | null;
  issues?: JsonObject[];
  issues_note?: string | null;
  notes?: string[];
  error?: string | null;
  files?: Record<string, string>;
}
export interface FemCancel {
  status: 'ok' | 'failed' | 'timed_out' | 'cancelled' | 'cancelling';
  note?: string | null;
}
export interface ProductCapability {
  id: string;
  label: string;
  supports_fem?: boolean;
}
