import type { CapabilityField, ProductCapability } from '../../../../../types/apiTypes/CapabilityTypes';
import type { GenerationMismatch } from '../../../../../types/apiTypes/CadTypes';
import { FileBox } from 'lucide-react';
import { engineValue, leafEntries, materialComparison, scalar } from './cadPresentation';
import type { CadPresentation } from './cadPresentation';

const operationLabels: Record<string, string> = { set_cooling_channels_circular: 'Круглые каналы охлаждения', fillet: 'Скругление', chamfer: 'Фаска' };

function DataValue({ value }: { value: unknown }) {
  if (value && typeof value === 'object') return <details><summary className="cursor-pointer text-muted">{scalar(value)}</summary><dl className="mt-2 space-y-1 border-l border-line pl-3">{Object.entries(value).map(([key, item]) => <div key={key} className="min-w-0"><dt className="break-all text-xs text-muted">{key}</dt><dd className="break-words"><DataValue value={item} /></dd></div>)}</dl></details>;
  return <>{scalar(value)}</>;
}
function ParameterTable({ value, fields }: { value: unknown; fields: CapabilityField[] }) {
  const entries = leafEntries(value);
  const known = entries.filter(([path]) => fields.some((field) => field.key === path || `engine_conditions.${field.key}` === path || `component_params.${field.key}` === path));
  const unknown = entries.filter(([path]) => !known.some(([key]) => key === path));
  const render = (items: typeof entries) => <dl className="mt-2 space-y-2">{items.map(([path, item]) => {
    const field = fields.find((field) => [field.key, `engine_conditions.${field.key}`, `component_params.${field.key}`].includes(path));
    return <div key={path} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-line pb-1"><dt className="break-words text-muted">{field?.label ?? path}{field?.unit ? ` (${field.unit})` : ''}</dt><dd className="min-w-0 break-words"><DataValue value={item} /></dd></div>;
  })}</dl>;
  return entries.length ? <>{render(known)}{unknown.length > 0 && <details className="mt-2"><summary className="cursor-pointer text-muted">Другие поля ({unknown.length})</summary>{render(unknown)}</details>}</> : <p className="mt-2 text-muted">Данные отсутствуют</p>;
}
function Changes({ rows, fields }: { rows: GenerationMismatch[]; fields: CapabilityField[] }) {
  return <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="text-muted"><th className="p-2">Параметр</th><th className="p-2">Запрошено</th><th className="p-2">Применено</th></tr></thead><tbody>{rows.map((row, index) => {
    const field = fields.find((field) => field.key === row.path || `engine_conditions.${field.key}` === row.path || `component_params.${field.key}` === row.path);
    return <tr key={`${row.path}-${index}`} className="border-t border-line align-top"><th className="max-w-44 break-words p-2 font-normal text-ink-2">{field?.label ?? row.path}{field?.unit ? ` (${field.unit})` : ''}</th><td className="max-w-44 break-words p-2"><DataValue value={row.requested} /></td><td className="max-w-44 break-words p-2"><DataValue value={row.applied} /></td></tr>;
  })}</tbody></table></div>;
}
export default function CadResultCard({ presentation, products, detailsOpen = false }: {
  presentation: CadPresentation;
  products?: ProductCapability[];
  detailsOpen?: boolean;
}) {
  const { cad, notes } = presentation;
  const report = cad.generation_report;
  const productId = cad.params.product_id ?? 'engine_assembly';
  const product = products?.find((item) => item.id === productId);
  const fields = product?.fields ?? [];
  const material = materialComparison(presentation);
  const mismatches = report?.conformance?.mismatches ?? [];
  const warnings = [...new Set([...(report?.warnings ?? []), ...(report?.conformance?.warnings ?? [])])];
  const deviated = material.differs || mismatches.length > 0 || report?.conformance?.status === 'deviated';
  const principal = ['thrust_N', 'Pc_MPa', 'fuel', 'oxidizer', 'expansion_ratio'];
  return <section className="w-full min-w-0 overflow-hidden rounded-2xl bg-panel p-4 text-sm text-ink ring-1 ring-line/70" aria-label={`CAD v${cad.version} результат`}>
    <div className="-mx-4 -mt-4 mb-1 flex flex-wrap items-center justify-between gap-2 bg-panel-2 px-4 py-3"><h3 className="flex items-center gap-2 text-[15px] font-medium text-ink"><FileBox className="h-[18px] w-[18px]" strokeWidth={1.7} />CAD v{cad.version}{product ? ` · ${product.label}` : ''}</h3><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${deviated ? 'bg-amber-50 text-warning ring-1 ring-amber-200' : 'bg-accent-soft text-accent ring-1 ring-accent/30'}`}>{deviated ? 'Есть отклонения' : 'Модель создана'}</span></div>
    {material.applied != null && <p className="mt-2">Материал: <strong>{scalar(material.applied)}</strong></p>}
    {material.differs && <p role="alert" className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-warning">Материал отличается от запрошенного: {scalar(material.requested)} → {scalar(material.applied)}.</p>}
    <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">{principal.map((key) => {
      const value = engineValue(cad.params, key) ?? engineValue(report?.applied_params, key);
      const field = fields.find((item) => item.key === key);
      return value == null ? null : <div key={key}><dt className="text-xs text-muted">{field?.label ?? key}</dt><dd className="mt-0.5 font-medium">{scalar(value)}{field?.unit ? ` ${field.unit}` : ''}</dd></div>;
    })}</dl>
    {mismatches.length > 0 && <p className="mt-3 text-warning">Отклонений параметров: {mismatches.length}</p>}
    {warnings.length > 0 && <div className="mt-3 rounded-lg border border-amber-200 p-2 text-xs text-warning"><h4 className="font-medium">Предупреждения ({warnings.length})</h4>{warnings.slice(0, 2).map((text, index) => <p key={index} className="mt-1 whitespace-pre-wrap break-words">{text}</p>)}</div>}
    {!report && <p className="mt-3 text-xs text-muted">Отчёт генерации отсутствует</p>}
    <details open={detailsOpen} className="mt-3"><summary className="cursor-pointer font-medium text-accent hover:text-accent-hover">Подробный отчёт CAD v{cad.version}</summary>
      <div className="mt-3 space-y-4 text-xs">
        <div><h4 className="font-semibold">Параметры опубликованной CAD-версии</h4><ParameterTable value={cad.params} fields={fields} /></div>
        {report && <>
          <div><h4 className="font-semibold">Запрошенные параметры</h4><ParameterTable value={report.requested_params} fields={fields} /></div>
          <div><h4 className="font-semibold">Параметры, переданные построителю</h4><ParameterTable value={report.applied_params} fields={fields} /></div>
          <div><h4 className="font-semibold">Полученные размеры</h4><ParameterTable value={report.actual_dimensions} fields={fields} />{report.actual_expansion_ratio != null && <p className="mt-2">Фактическая степень расширения: {scalar(report.actual_expansion_ratio)}</p>}</div>
          <div><h4 className="font-semibold">Соответствие параметрам</h4>{report.conformance ? <>{report.conformance.status === 'checked' && !deviated && <p className="mt-2">Проверка соответствия выполнена сервером</p>}{mismatches.length ? <Changes rows={mismatches} fields={fields} /> : <p className="mt-2">Сервер не перечислил отклонений</p>}<details className="mt-2"><summary className="cursor-pointer">Данные проверки</summary><DataValue value={report.conformance} /></details></> : <p className="mt-2 text-muted">Данные проверки соответствия отсутствуют</p>}</div>
          {(report.adjustments?.length ?? 0) > 0 && <div><h4 className="font-semibold">Корректировки построителя</h4><Changes rows={report.adjustments ?? []} fields={fields} /></div>}
          <div><h4 className="font-semibold">Выполненные операции</h4>{report.applied_operations?.length ? <ul className="mt-2 space-y-3">{report.applied_operations.map((operation, index) => <li key={index}><p className="font-medium text-ink-2">{operationLabels[String(operation.operation)] ?? String(operation.operation ?? `Операция ${index + 1}`)}</p>{operation.requested_size_mm != null && <p>Запрошенный размер: {scalar(operation.requested_size_mm)} мм</p>}{operation.actual_size_mm != null && <p>Применённый размер: {scalar(operation.actual_size_mm)} мм</p>}{operation.channel_count != null && <p>Количество каналов: {scalar(operation.channel_count)}</p>}<DataValue value={operation} /></li>)}</ul> : <p className="mt-2 text-muted">Операции не указаны</p>}</div>
          {warnings.length > 0 && <div><h4 className="font-semibold">Все предупреждения</h4><ul className="mt-2 list-disc space-y-2 pl-4">{warnings.map((warning, index) => <li key={index} className="whitespace-pre-wrap break-words">{warning}</li>)}</ul></div>}
          {report.advisor_note && <div><h4 className="font-semibold">Примечание построителя</h4><p className="mt-2 whitespace-pre-wrap break-words">{report.advisor_note}</p></div>}
          {report.validation && <details><summary className="cursor-pointer">Дополнительная проверка геометрии</summary><DataValue value={report.validation} /></details>}
        </>}
        {notes.length > 0 && <div><h4 className="font-semibold">Примечания задачи</h4>{notes.map((note, index) => <p key={index} className="mt-2 whitespace-pre-wrap">{note}</p>)}</div>}
      </div>
    </details>
  </section>;
}
