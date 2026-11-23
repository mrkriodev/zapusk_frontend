import type { Job } from '../../../../../types/apiTypes/JobTypes';
import { progressPercent } from './cadPresentation';
export default function CadJobCard({ job, paused, error, reading, onRetry }: {
  job?: Job; paused: boolean; error?: string; reading: boolean; onRetry: () => void;
}) {
  const progress = job?.progress;
  const percent = progress ? progressPercent(progress.step, progress.total) : null;
  return <li className="mb-3 w-full max-w-3xl rounded-xl border border-blue-400/30 bg-slate-900 p-4 text-sm text-blue-100" aria-label="CAD-задача">
    <h3 className="font-semibold">{paused ? 'Нужно обновить результат CAD' : job?.status === 'queued' ? 'CAD: в очереди' : 'CAD: построение модели'}</h3>
    {!paused && progress?.label && <p role="status" className="mt-2">{progress.label}</p>}
    {!paused && progress && <p className="mt-2 text-xs text-blue-300">Шаг {progress.step} / {progress.total}{percent != null ? ` · ${percent}%` : ''}</p>}
    {!paused && percent != null && <progress aria-label="Прогресс CAD" value={percent} max={100} className="mt-2 h-2 w-full accent-purple-500" />}
    {!paused && !progress && <p role="status" className="mt-2 text-xs text-blue-300">Ожидаем обновление статуса задачи…</p>}
    {error && <p role="alert" className="mt-2 text-red-200">{error}</p>}
    {paused && <button type="button" disabled={reading} onClick={onRetry} className="mt-3 rounded-lg border border-blue-400/30 px-3 py-2 disabled:opacity-40">{reading ? 'Обновляем…' : 'Повторить чтение CAD-задачи'}</button>}
  </li>;
}
