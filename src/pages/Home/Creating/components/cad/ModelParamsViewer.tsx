import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cadApi } from '../../../../../api/repository/CadApi';
import type { ProductCapability } from '../../../../../types/apiTypes/CapabilityTypes';
import { scalar } from './cadPresentation';

interface Props {
  conversationId: string;
  version: number;
  productId?: string;
  products?: ProductCapability[];
  onClose: () => void;
}
const labels: Record<string, string> = {
  version: 'Версия', source: 'Источник', conversation_id: 'Диалог', component: 'Деталь', artifact_kind: 'Тип модели',
  units: 'Единицы размеров', coordinate_system: 'Система координат', stem: 'Имя модели',
  volume_mm3: 'Объём (мм³)', solid_count: 'Количество тел', bounds_mm: 'Габариты (мм)',
  throat_diameter: 'Входной диаметр', exit_diameter: 'Выходной диаметр', height: 'Длина', wall_thickness: 'Толщина стенки',
  T_flame_K: 'Температура пламени (К)', T_chamber_K: 'Температура камеры (К)', T_throat_K: 'Температура горла (К)',
  T_wall_max_K: 'Максимальная температура стенки (К)', sigma_vm_MPa: 'Напряжение Мизеса (МПа)',
  t_wall_mm: 'Расчётная толщина стенки (мм)', Isp_vac_s: 'Удельный импульс в вакууме (с)',
  c_star_m_s: 'Характеристическая скорость (м/с)', R_throat_mm: 'Радиус горла (мм)', R_chamber_mm: 'Радиус камеры (мм)',
};
const groups = [
  ['component_params', 'Параметры и размеры детали'], ['explicit_component_params', 'Явно заданные размеры'],
  ['engine_conditions', 'Исходные условия двигателя'], ['effective_engine_conditions', 'Фактически использованные условия двигателя'],
  ['geometry', 'Геометрические характеристики'], ['physics', 'Расчётные показатели'],
  ['parameter_source', 'Источник параметров'], ['meta', 'Сведения о модели'],
] as const;
const hasValue = (value: unknown) => value != null && (typeof value !== 'object' || Object.keys(value).length > 0);
const sources: Record<string, string> = { engine_conditions: 'Рассчитано по условиям двигателя', explicit_component_params: 'Задано явно', component_params: 'Параметры детали' };

function Value({ value, source = false }: { value: unknown; source?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  if (value && typeof value === 'object') return <details onToggle={(event) => { if (event.target === event.currentTarget) setExpanded(event.currentTarget.open); }}>
    <summary className="cursor-pointer text-muted">{scalar(value)}</summary>
    {expanded && <dl className="mt-2 space-y-2 border-l border-line pl-3">{Object.entries(value).map(([key, item]) => <div key={key} className="min-w-0"><dt className="break-all text-xs text-muted">{labels[key] ?? key}</dt><dd className="min-w-0 break-words"><Value value={item} source={source} /></dd></div>)}</dl>}
  </details>;
  return <>{source && typeof value === 'string' ? sources[value] ?? value : scalar(value)}</>;
}

export default function ModelParamsViewer({ conversationId, version, productId, products, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const query = cadApi.endpoints.getCadModelParams.useQuery({ conversationId, version }, { refetchOnMountOrArgChange: true });
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    return () => { element?.close(); if (opener?.isConnected) opener.focus(); };
  }, []);
  const data = query.currentData;
  const valid = data && typeof data === 'object' && !Array.isArray(data);
  const meta = valid && data.meta && typeof data.meta === 'object' && !Array.isArray(data.meta) ? data.meta : null;
  const modelProduct = typeof meta?.component === 'string' ? meta.component : productId;
  const fields = products?.find((product) => product.id === modelProduct)?.fields ?? [];
  const dimensionUnit = typeof meta?.units === 'string' ? meta.units : undefined;
  const title = `Параметры модели · v${version}`;
  const renderTable = (value: unknown, group: string) => <dl className="mt-3 space-y-2 text-sm">{value && typeof value === 'object' ? Object.entries(value).map(([key, item]) => {
    const field = fields.find((field) => field.key === key || field.key === `${group}.${key}`);
    let unit = field?.unit;
    if ((group === 'component_params' || group === 'explicit_component_params') && typeof item === 'number' && /diameter|height|length|thickness|radius|width|depth|size|pitch/.test(key) && dimensionUnit && (!unit || ['mm', 'мм', 'm', 'м', 'cm', 'см'].includes(unit))) unit = dimensionUnit;
    return <div key={key} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-line pb-2"><dt className="break-words text-muted">{field?.label ?? labels[key] ?? key}{unit ? ` (${unit})` : ''}</dt><dd className="min-w-0 break-words"><Value value={item} source={group === 'parameter_source'} /></dd></div>;
  }) : <Value value={value} />}</dl>;
  const extra = valid ? Object.fromEntries(Object.entries(data).filter(([key]) => !groups.some(([group]) => group === key))) : {};
  return <dialog ref={dialog} aria-labelledby="model-params-title" aria-busy={query.isFetching} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto w-[calc(100%_-_24px)] max-w-3xl overflow-visible border-0 bg-transparent p-0 text-ink backdrop:bg-black/35">
    <div className="max-h-[85dvh] overflow-y-auto thin-scroll rounded-3xl bg-white p-6 shadow-[0_24px_64px_rgb(0_0_0/0.18)]">
      <div className="flex items-start justify-between gap-3"><h2 id="model-params-title" className="text-lg font-medium tracking-tight text-ink">{title}</h2><button type="button" autoFocus onClick={onClose} aria-label="Закрыть параметры модели" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-2 text-white hover:bg-ink focus-visible:outline-2 focus-visible:outline-accent"><X className="h-4 w-4" /></button></div>
      {query.isFetching && <p role="status" className="mt-4 text-sm text-muted">Загружаем параметры…</p>}
      {!query.isFetching && (query.isError || !valid) && <div role="alert" className="mt-4 text-sm text-danger"><p>Не удалось загрузить параметры модели.</p><button type="button" onClick={() => void query.refetch()} className="mt-3 rounded-full bg-white border border-line px-4 py-2 text-ink">Повторить</button></div>}
      {!query.isFetching && !query.isError && valid && <div className="mt-5 space-y-5">
        {groups.filter(([key]) => hasValue(data[key])).map(([key, label]) => <section key={key} aria-label={label}><h3 className="text-[15px] font-medium text-ink">{label}</h3>{renderTable(data[key], key)}</section>)}
        {Object.keys(extra).length > 0 && <details><summary className="cursor-pointer font-medium">Дополнительные параметры</summary>{renderTable(extra, '')}</details>}
        {!Object.keys(data).some((key) => hasValue(data[key])) && <p className="text-sm text-muted">В файле нет параметров для отображения.</p>}
      </div>}
    </div>
  </dialog>;
}
