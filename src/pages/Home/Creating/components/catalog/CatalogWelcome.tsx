import type { CapabilityField, ProductCapability } from '../../../../../types/apiTypes/CapabilityTypes';

function FieldList({ fields }: { fields: CapabilityField[] }) {
  return <ul className="mt-2 space-y-2 text-sm">{fields.map((field) => <li key={field.key}>
    <span className="text-blue-100">{field.label}{field.unit ? ` (${field.unit})` : ''}</span>
    {field.required && <span className="ml-2 text-xs text-purple-300">Обязательно</span>}
    {field.options?.length ? <p className="mt-0.5 text-xs text-blue-300">{field.options.join(', ')}</p> : null}
    {(field.minimum != null || field.maximum != null) && <p className="text-xs text-blue-300">{field.minimum != null ? `От ${field.minimum}` : ''}{field.minimum != null && field.maximum != null ? ' · ' : ''}{field.maximum != null ? `До ${field.maximum}` : ''}{field.unit ? ` ${field.unit}` : ''}</p>}
  </li>)}</ul>;
}
export function CatalogHints({ product, engine, open = false }: { product: ProductCapability; engine?: ProductCapability; open?: boolean }) {
  const fields = product.fields ?? [];
  const alternatives = product.input_policy === 'dimensions_or_engine_conditions';
  const engineKeys = new Set(engine?.fields?.map((field) => field.key) ?? ['thrust_N', 'Pc_MPa', 'fuel', 'oxidizer', 'material', 'expansion_ratio', 'OF_ratio', 'safety_factor', 'Pe_MPa']);
  const dimensions = fields.filter((field) => !engineKeys.has(field.key));
  const engineConditions = fields.filter((field) => engineKeys.has(field.key));
  const main = alternatives ? dimensions : fields.filter((field) => field.required);
  const additional = alternatives ? [] : fields.filter((field) => !field.required);
  return <details open={open} className="rounded-xl border border-blue-400/20 bg-blue-950/30 p-3 text-blue-100">
    <summary className="cursor-pointer text-sm font-medium">Параметры: {product.label}</summary>
    <div className="mt-2 max-h-64 overflow-y-auto pr-2">
      {alternatives && <p className="text-xs text-blue-300">Можно задать размеры детали или описать условия двигателя. Какие данные ещё нужны, уточнит диалог.</p>}
      <h4 className="mt-3 text-sm font-medium">{alternatives ? 'Размеры детали' : 'Обязательные параметры'}</h4>
      <FieldList fields={main} />
      {alternatives && <><h4 className="mt-4 text-sm font-medium">Или условия двигателя</h4><FieldList fields={engineConditions} /></>}
      {additional.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-sm">Дополнительные параметры</summary><FieldList fields={additional} /></details>}
    </div>
  </details>;
}
interface WelcomeProps {
  products?: ProductCapability[];
  product?: ProductCapability;
  canChoose: boolean;
  loading: boolean;
  error: boolean;
  onChoose: (id: string) => void;
  onRetry: () => void;
}
export default function CatalogWelcome({ products, product, canChoose, loading, error, onChoose, onRetry }: WelcomeProps) {
  return <li className="mb-4 w-full max-w-3xl rounded-2xl border border-blue-400/20 bg-slate-900 p-4 text-blue-100">
    <h2 className="font-semibold text-white">Что будем создавать?</h2>
    <p className="mt-2 text-sm text-blue-300">Выберите изделие, затем опишите известные параметры своими словами. Диалог уточнит недостающее и покажет сводку перед генерацией.</p>
    {loading && <p role="status" className="mt-3 text-sm">Загружаем каталог…</p>}
    {error && <div role="alert" className="mt-3 text-sm text-amber-200">Не удалось загрузить каталог. <button type="button" onClick={onRetry} className="underline">Повторить загрузку каталога</button></div>}
    {!loading && !error && products?.length === 0 && <p role="status" className="mt-3 text-sm">В каталоге пока нет доступных изделий.</p>}
    {canChoose && !error && <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{products?.map((item) => <button key={item.id} type="button" aria-pressed={product?.id === item.id} onClick={() => onChoose(item.id)} className={`rounded-xl border p-3 text-left text-sm ${product?.id === item.id ? 'border-purple-400 bg-purple-500/20 text-white' : 'border-blue-400/25 bg-blue-950/30 hover:bg-blue-900/40'}`}>{item.label}</button>)}</div>}
    {product && <div className="mt-4"><p className="mb-2 text-sm">Выбрано: <strong>{product.label}</strong></p><CatalogHints product={product} engine={products?.find((item) => item.id === 'engine_assembly')} open /></div>}
  </li>;
}
