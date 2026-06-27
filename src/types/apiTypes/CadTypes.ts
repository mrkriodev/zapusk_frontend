export type Fuel =
  | "Methane"
  | "Kerosene"
  | "LH2"
  | "UDMH"
  | "Ethanol";

export type Oxidizer =
  | "LOX"
  | "NTO"
  | "H2O2"
  | "N2O";

export type EngineMaterial =
  | "Inconel718"
  | "SS316L"
  | "CuCrZr"
  | "Ti6Al4V";

export type CadBackend = "cadquery" | "sdf";

export type CadDownloadFormat = "stl" | "step";

export interface CoolingChannels {
  n?: number;
  width_mm?: number;
  depth_mm?: number;
}

export interface Injector {
  n_elements?: number;
  hole_r_mm?: number;
}

export interface CustomFeature {
  type?: string;

  [key: string]: unknown;
}

export interface EngineParams {
  thrust_N?: number;
  Pc_MPa?: number;
  fuel?: Fuel;
  oxidizer?: Oxidizer;
  OF_ratio?: number;
  expansion_ratio?: number;
  material?: EngineMaterial;
  cycle?: string;
  backend?: CadBackend;
  cooling_channels?: CoolingChannels;
  injector?: Injector;
  custom_features?: CustomFeature[];

  [key: string]: unknown;
}

export interface BoundingBox {
  x?: number;
  y?: number;
  z?: number;
}

export interface Physics {
  T_flame_K?: number;
  T_chamber_K?: number;
  T_wall_max_K?: number;
  t_wall_mm?: number;
  sigma_vm_MPa?: number;
  Isp_vac_s?: number;
  c_star_m_s?: number;
  R_throat_mm?: number;
  R_chamber_mm?: number;
  bounding_box_mm?: BoundingBox;

  [key: string]: unknown;
}

export interface CadFiles {
  stl?: string;
  step?: string;
}

export interface CadState {
  id: string;
  conversation_id: string;
  message_id: string;
  version: number;
  params: EngineParams;
  physics: Physics;
  files: CadFiles;
  created_at: string;
}

export interface CadVersionsResponse {
  items: CadState[];
  current_version: number | null;
}

export interface DownloadCadFileArgs {
  conversationId: string;
  version: number;
  format: CadDownloadFormat;
}