import { RefreshCcw } from 'lucide-react';
import type { ConversationFem } from '../../hooks/useConversationFem';
import { canReviseFem } from '../../hooks/useConversationFem';
import { isFemPending } from '../../../../../api/repository/FemApi';
import type { JsonObject } from '../../../../../types/apiTypes/CadTypes';
import { getLocale, t } from '../../../../../i18n/i18n';

const statusLabels: Record<string, string> = {
  queued: 'В очереди', running: 'Выполняется', ok: 'Расчёт завершён',
  failed: 'Ошибка расчёта', timed_out: 'Время расчёта истекло', cancelled: 'Расчёт отменён',
};
const buttonClass = 'rounded-full bg-white px-4 py-1.5 text-xs font-medium text-ink ring-1 ring-line transition-colors hover:bg-panel-2 disabled:cursor-not-allowed disabled:opacity-40';
const detailLabels: Record<string, string> = {
  message: 'Описание', description: 'Описание', type: 'Тип', severity: 'Уровень',
  recommendation: 'Рекомендация', reason: 'Причина', field: 'Параметр', path: 'Параметр',
  requested: 'Запрошено', applied: 'Применено', limit: 'Предел',
};
function detailText(item: JsonObject) {
  return Object.entries(item).map(([key, value]) => `${detailLabels[key] ? t(detailLabels[key]) : key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`).join('; ');
}

export default function FemReports({ fem, conversationId }: { fem: ConversationFem; conversationId: string | null }) {
  const generalError = conversationId ? fem.errors[conversationId] : null;
  return (
    <>
      {(generalError || fem.historyError || fem.statusError || fem.capabilitiesError) && (
        <li className="mb-4 w-full rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-warning" role="status">
          <p>{generalError || (fem.capabilitiesError ? t('Не удалось проверить поддержку FEM.') : fem.historyError ? t('Не удалось загрузить историю FEM.') : t('Не удалось обновить статус FEM. Расчёт может продолжаться.'))}</p>
          <button type="button" onClick={fem.refresh} className={`${buttonClass} mt-2`}>{t('Обновить статус FEM')}</button>
        </li>
      )}
      {fem.runs.map((run) => {
        const pending = isFemPending(run.status);
        const summary = run.summary;
        const metrics = [
          [t('Максимальное напряжение'), summary?.max_stress_mpa, t('МПа')],
          [t('Допустимое напряжение'), summary?.limit_stress_mpa, t('МПа')],
          [t('Максимальное перемещение'), summary?.max_displacement_mm, t('мм')],
          [t('Масса'), summary?.total_mass_kg, t('кг')],
        ] as const;
        return (
          <li key={run.id} className="mb-4 w-full overflow-hidden rounded-2xl bg-panel p-4 text-sm text-ink ring-1 ring-line/70" aria-label={`FEM CAD v${run.version}`}>
            <div className="-mx-4 -mt-4 mb-2 flex flex-wrap items-center justify-between gap-2 bg-panel-2 px-4 py-3">
              <h3 className="flex items-center gap-2 text-[15px] font-medium text-ink"><RefreshCcw className="h-[18px] w-[18px]" strokeWidth={1.7} />FEM · CAD v{run.version}</h3>
              <span role="status" className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${run.status === 'ok' ? 'bg-emerald-50 text-success ring-1 ring-emerald-200' : 'bg-white text-ink-2 ring-1 ring-line'}`}>{statusLabels[run.status] ? t(statusLabels[run.status]) : run.status}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{new Date(run.created_at).toLocaleString(getLocale())}</p>
            {run.pre_fem && <div className="mt-3 rounded-lg border border-line p-2 text-xs">
              <p>{t('Перед FEM исправлена геометрия: исходная CAD v{source} → расчёт по CAD v{version}.', { source: run.pre_fem.source_version, version: run.version })}</p>
              {run.pre_fem.json_changes.map((change, index) => <p key={index} className="mt-1">{change}</p>)}
            </div>}
            {summary?.passes != null && <p className={`mt-3 font-medium ${summary.passes ? 'text-success' : 'text-warning'}`}>
              {summary.passes ? t('Прочностной критерий выполнен') : t('Прочностной критерий не выполнен')}
            </p>}
            {summary?.text && <p className="mt-2 whitespace-pre-wrap">{summary.text}</p>}
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {metrics.filter(([, value]) => value != null).map(([label, value, unit]) => (
                <div key={label}><dt className="text-xs text-muted">{label}</dt><dd>{value?.toLocaleString(getLocale(), { maximumFractionDigits: 3 })} {unit}</dd></div>
              ))}
            </dl>
            {(run.json_changes?.length ?? 0) > 0 && <div className="mt-3"><h4 className="font-medium">{t('Рекомендованные изменения')}</h4><ul className="mt-1 list-disc space-y-1 pl-5">{run.json_changes?.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}
            {(run.issues?.length ?? 0) > 0 && <details className="mt-3"><summary className="cursor-pointer">{t('Замечания к геометрии ({count})', { count: run.issues?.length ?? 0 })}</summary><ul className="mt-2 space-y-2 break-words">{run.issues?.map((issue, index) => <li key={index}>{detailText(issue)}</li>)}</ul></details>}
            {run.issues_note && <p className="mt-2 text-xs text-muted">{run.issues_note}</p>}
            {(run.clamped?.length ?? 0) > 0 && <details className="mt-3"><summary className="cursor-pointer">{t('Ограничения изменений')}</summary><ul className="mt-2 space-y-2 break-words">{run.clamped?.map((item, index) => <li key={index}>{detailText(item)}</li>)}</ul></details>}
            {run.notes?.map((note, index) => <p key={index} className="mt-2 text-xs text-muted">{note}</p>)}
            {run.error && <p role="alert" className="mt-3 text-danger">{run.error}</p>}
            {fem.errors[run.id] && <p role="alert" className="mt-3 text-warning">{fem.errors[run.id]}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {pending && <button type="button" onClick={() => void fem.cancel(run)} disabled={fem.cancellingIds.includes(run.id)} className={buttonClass}>{fem.cancellingIds.includes(run.id) ? t('Отмена запрошена…') : t('Отменить FEM')}</button>}
              {canReviseFem(run) && <button type="button" onClick={() => void fem.revise(run)} disabled={fem.actionsDisabled || fem.revisedIds.includes(run.id)} className={`${buttonClass} !bg-accent !text-white !ring-0 hover:!bg-accent-hover`}>
                {fem.revisedIds.includes(run.id) ? t('Пересборка запущена') : fem.revising ? t('Запуск пересборки…') : t('Пересобрать по рекомендациям')}
              </button>}
              {Object.entries(run.files ?? {}).filter(([, url]) => Boolean(url)).map(([format]) => (
                <button key={format} type="button" onClick={() => void fem.download(run, format)} disabled={fem.downloading === `${run.id}:${format}`} className={buttonClass}>
                  {fem.downloading === `${run.id}:${format}` ? t('Скачивание…') : format === 'report' ? t('Скачать отчёт') : t('Скачать {format}', { format })}
                </button>
              ))}
            </div>
          </li>
        );
      })}
    </>
  );
}
