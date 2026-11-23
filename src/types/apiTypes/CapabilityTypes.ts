export interface CapabilityField {
  key: string;
  label: string;
  type: 'number' | 'integer' | 'enum' | 'boolean' | 'string';
  required: boolean;
  unit?: string | null;
  options?: string[] | null;
  minimum?: number | null;
  maximum?: number | null;
}
export interface ProductCapability {
  id: string;
  label: string;
  fields: CapabilityField[];
  result_kind?: 'cad';
  supports_fem?: boolean;
  input_policy?: 'required_fields' | 'dimensions_or_engine_conditions';
}
export interface Capabilities { products: ProductCapability[] }
