import type { ConversationFem } from '../../hooks/useConversationFem';
import { canReviseFem } from '../../hooks/useConversationFem';
import { isFemPending } from '../../../../../api/repository/FemApi';
import type { JsonObject } from '../../../../../types/apiTypes/CadTypes';

const statusLabels: Record<string, string> = {
  queued: 'В очереди', running: 'Выполняется', ok: 'Расчёт завершён',
  failed: 'Ошибка расчёта', timed_out: 'Время расчёта истекло', cancelled: 'Расчёт отменён',
};
const buttonClass = 'rounded-lg border border-blue-400/30 px-3 py-2 text-xs text-blue-100 hover:bg-blue-800/40 disabled:cursor-not-allowed disabled:opacity-40';
const detailLabels: Record<string, string> = {
  message: 'Описание', description: 'Описание', type: 'Тип', severity: 'Уровень',
  recommendation: 'Рекомендация', reason: 'Причина', field: 'Параметр', path: 'Параметр',
  requested: 'Запрошено', applied: 'Применено', limit: 'Предел',
};
function detailText(item: JsonObject) {
  return Object.entries(item).map(([key, value]) => `${detailLabels[key] ?? key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`).join('; ');
}

export default function FemReports({ fem, conversationId }: { fem: ConversationFem; conversationId: string | null }) {
  const generalError = conversationId ? fem.errors[conversationId] : null;
  return (
    <>
      {(generalError || fem.historyError || fem.statusError || fem.capabilitiesError) && (
        <li className="mb-3 max-w-3xl rounded-xl border border-amber-400/30 bg-slate-900 p-3 text-sm text-amber-100" role="status">
          <p>{generalError || (fem.capabilitiesError ? 'Не удалось проверить поддержку FEM.' : fem.historyError ? 'Не удалось загрузить историю FEM.' : 'Не удалось обновить статус FEM. Расчёт может продолжаться.')}</p>
          <button type="button" onClick={fem.refresh} className={`${buttonClass} mt-2`}>Обновить статус FEM</button>
        </li>
      )}
      {fem.runs.map((run) => {
        const pending = isFemPending(run.status);
        const summary = run.summary;
        const metrics = [
          ['Максимальное напряжение', summary?.max_stress_mpa, 'МПа'],
          ['Допустимое напряжение', summary?.limit_stress_mpa, 'МПа'],
          ['Максимальное перемещение', summary?.max_displacement_mm, 'мм'],
          ['Масса', summary?.total_mass_kg, 'кг'],
        ] as const;
        return (
          <li key={run.id} className="mb-3 w-full max-w-3xl rounded-xl border border-emerald-400/25 bg-slate-900 p-4 text-sm text-blue-100" aria-label={`FEM CAD v${run.version}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-white">FEM · CAD v{run.version}</h3>
              <span role="status" className={run.status === 'ok' ? 'text-emerald-300' : 'text-blue-200'}>{statusLabels[run.status] ?? run.status}</span>
            </div>
            <p className="mt-1 text-xs text-blue-400">{new Date(run.created_at).toLocaleString('ru-RU')}</p>
            {run.pre_fem && <div className="mt-3 rounded-lg border border-blue-400/20 p-2 text-xs">
              <p>Перед FEM исправлена геометрия: исходная CAD v{run.pre_fem.source_version} → расчёт по CAD v{run.version}.</p>
              {run.pre_fem.json_changes.map((change, index) => <p key={index} className="mt-1">{change}</p>)}
            </div>}
            {summary?.passes != null && <p className={`mt-3 font-medium ${summary.passes ? 'text-emerald-300' : 'text-amber-300'}`}>
              {summary.passes ? 'Прочностной критерий выполнен' : 'Прочностной критерий не выполнен'}
            </p>}
            {summary?.text && <p className="mt-2 whitespace-pre-wrap">{summary.text}</p>}
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {metrics.filter(([, value]) => value != null).map(([label, value, unit]) => (
                <div key={label}><dt className="text-xs text-blue-400">{label}</dt><dd>{value?.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} {unit}</dd></div>
              ))}
            </dl>
            {(run.json_changes?.length ?? 0) > 0 && <div className="mt-3"><h4 className="font-medium">Рекомендованные изменения</h4><ul className="mt-1 list-disc space-y-1 pl-5">{run.json_changes?.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}
            {(run.issues?.length ?? 0) > 0 && <details className="mt-3"><summary className="cursor-pointer">Замечания к геометрии ({run.issues?.length})</summary><ul className="mt-2 space-y-2 break-words">{run.issues?.map((issue, index) => <li key={index}>{detailText(issue)}</li>)}</ul></details>}
            {run.issues_note && <p className="mt-2 text-xs text-blue-300">{run.issues_note}</p>}
            {(run.clamped?.length ?? 0) > 0 && <details className="mt-3"><summary className="cursor-pointer">Ограничения изменений</summary><ul className="mt-2 space-y-2 break-words">{run.clamped?.map((item, index) => <li key={index}>{detailText(item)}</li>)}</ul></details>}
            {run.notes?.map((note, index) => <p key={index} className="mt-2 text-xs text-blue-300">{note}</p>)}
            {run.error && <p role="alert" className="mt-3 text-red-300">{run.error}</p>}
            {fem.errors[run.id] && <p role="alert" className="mt-3 text-amber-200">{fem.errors[run.id]}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {pending && <button type="button" onClick={() => void fem.cancel(run)} disabled={fem.cancellingIds.includes(run.id)} className={buttonClass}>{fem.cancellingIds.includes(run.id) ? 'Отмена запрошена…' : 'Отменить FEM'}</button>}
              {canReviseFem(run) && <button type="button" onClick={() => void fem.revise(run)} disabled={fem.actionsDisabled || fem.revisedIds.includes(run.id)} className={`${buttonClass} border-emerald-400/40 text-emerald-200`}>
                {fem.revisedIds.includes(run.id) ? 'Пересборка запущена' : fem.revising ? 'Запуск пересборки…' : 'Пересобрать по рекомендациям'}
              </button>}
              {Object.entries(run.files ?? {}).filter(([, url]) => Boolean(url)).map(([format]) => (
                <button key={format} type="button" onClick={() => void fem.download(run, format)} disabled={fem.downloading === `${run.id}:${format}`} className={buttonClass}>
                  {fem.downloading === `${run.id}:${format}` ? 'Скачивание…' : format === 'report' ? 'Скачать отчёт' : `Скачать ${format}`}
                </button>
              ))}
            </div>
          </li>
        );
      })}
    </>
  );
}
