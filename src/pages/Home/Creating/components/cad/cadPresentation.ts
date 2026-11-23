import type { CadState, JsonValue } from '../../../../../types/apiTypes/CadTypes';
import type { DialogDraft } from '../../../../../types/apiTypes/DialogTypes';

export interface CadPresentation {
  cad: CadState;
  notes: string[];
  confirmedDraft?: DialogDraft;
}
export const cadKey = (cad: CadState) => `${cad.conversation_id}:${cad.version}`;
export function isCadState(value: unknown, owner: string): value is CadState {
  if (!value || typeof value !== 'object') return false;
  const cad = value as Partial<CadState>;
  return typeof cad.id === 'string' && cad.id.length > 0 && cad.conversation_id === owner
    && Number.isInteger(cad.version) && Number(cad.version) > 0
    && Boolean(cad.params && typeof cad.params === 'object' && !Array.isArray(cad.params))
    && Boolean(cad.files && typeof cad.files === 'object' && !Array.isArray(cad.files))
    && typeof cad.created_at === 'string';
}
export function mergeCadVersions(owner: string | null, ...groups: (CadState | undefined | null)[][]): CadState[] {
  if (!owner) return [];
  const versions = new Map<number, CadState>();
  for (const group of groups) for (const cad of group) if (isCadState(cad, owner)) {
    const previous = versions.get(cad.version);
    versions.set(cad.version, previous ? { ...previous, ...cad, generation_report: cad.generation_report ?? previous.generation_report } : cad);
  }
  return [...versions.values()].sort((a, b) => a.version - b.version);
}
export function readPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((item, key) => item && typeof item === 'object' ? (item as Record<string, unknown>)[key] : undefined, value);
}
export function engineValue(value: unknown, key: string): unknown {
  return readPath(value, key) ?? readPath(value, `engine_conditions.${key}`);
}
export function scalar(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (typeof value === 'number') return value.toLocaleString('ru-RU', { maximumFractionDigits: 20 });
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} элементов` : 'Объект';
  return String(value);
}
export function materialComparison({ cad, confirmedDraft }: CadPresentation) {
  const report = cad.generation_report;
  const requested = engineValue(confirmedDraft?.params, 'material')
    ?? engineValue(report?.conformance?.target_params, 'material') ?? engineValue(report?.requested_params, 'material');
  const applied = engineValue(cad.params, 'material') ?? engineValue(report?.applied_params, 'material');
  return { requested, applied, differs: requested != null && applied != null && requested !== applied };
}
export function progressPercent(step: number, total: number): number | null {
  return Number.isFinite(step) && Number.isFinite(total) && total > 0 ? Math.max(0, Math.min(100, Math.round(step / total * 100))) : null;
}
export function leafEntries(value: unknown, prefix = ''): [string, JsonValue][] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]): [string, JsonValue][] => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === 'object' && !Array.isArray(item)) return leafEntries(item, path);
    return [[path, item as JsonValue]];
  });
}
