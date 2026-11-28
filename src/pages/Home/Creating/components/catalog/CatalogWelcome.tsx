import type { CapabilityField, ProductCapability } from '../../../../../types/apiTypes/CapabilityTypes';
import { t } from "../../../../../i18n/i18n";

function FieldList({ fields }: { fields: CapabilityField[] }) {
  return <ul className="mt-2 space-y-2 text-sm">{fields.map((field) => <li key={field.key}>
    <span className="text-ink">{field.label}{field.unit ? ` (${field.unit})` : ''}</span>
    {field.required && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">{t("Обязательно")}</span>}
    {field.options?.length ? <p className="mt-0.5 text-xs text-muted">{field.options.join(', ')}</p> : null}
    {(field.minimum != null || field.maximum != null) && <p className="text-xs text-muted">{field.minimum != null ? t('От {value}', { value: field.minimum }) : ''}{field.minimum != null && field.maximum != null ? ' · ' : ''}{field.maximum != null ? t('До {value}', { value: field.maximum }) : ''}{field.unit ? ` ${field.unit}` : ''}</p>}
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
  return <details open={open} className="rounded-2xl bg-panel px-4 py-3 text-ink ring-1 ring-line/70">
    <summary className="cursor-pointer text-sm font-medium">{t('Параметры: {product}', { product: product.label })}</summary>
    <div className="mt-2 max-h-64 overflow-y-auto pr-2">
      {alternatives && <p className="text-xs text-muted">{t("Можно задать размеры детали или описать условия двигателя. Какие данные ещё нужны, уточнит диалог.")}</p>}
      <h4 className="mt-3 text-sm font-medium">{alternatives ? t('Размеры детали') : t('Обязательные параметры')}</h4>
      <FieldList fields={main} />
      {alternatives && <><h4 className="mt-4 text-sm font-medium">{t("Или условия двигателя")}</h4><FieldList fields={engineConditions} /></>}
      {additional.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-sm">{t("Дополнительные параметры")}</summary><FieldList fields={additional} /></details>}
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
  return <li className="mb-4 w-full rounded-2xl bg-panel p-5 text-ink ring-1 ring-line/70">
    <h2 className="text-[17px] font-medium text-ink">{t("Что будем создавать?")}</h2>
    <p className="mt-2 text-sm text-muted">{t("Выберите изделие, затем опишите известные параметры своими словами. Диалог уточнит недостающее и покажет сводку перед генерацией.")}</p>
    {loading && <p role="status" className="mt-3 text-sm">{t("Загружаем каталог…")}</p>}
    {error && <div role="alert" className="mt-3 text-sm text-warning">{t("Не удалось загрузить каталог.")} <button type="button" onClick={onRetry} className="underline">{t("Повторить загрузку каталога")}</button></div>}
    {!loading && !error && products?.length === 0 && <p role="status" className="mt-3 text-sm">{t("В каталоге пока нет доступных изделий.")}</p>}
    {canChoose && !error && <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{products?.map((item) => <button key={item.id} type="button" aria-pressed={product?.id === item.id} onClick={() => onChoose(item.id)} className={`rounded-xl px-4 py-3 text-left text-sm transition-colors ${product?.id === item.id ? 'bg-accent-soft text-ink ring-1 ring-accent' : 'bg-white ring-1 ring-line hover:bg-panel-2'}`}>{item.label}</button>)}</div>}
    {product && <div className="mt-4"><p className="mb-2 text-sm">{t("Выбрано:")} <strong>{product.label}</strong></p><CatalogHints product={product} engine={products?.find((item) => item.id === 'engine_assembly')} open /></div>}
  </li>;
}
