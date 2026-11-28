import { LoaderCircle } from 'lucide-react';
import type { Job } from '../../../../../types/apiTypes/JobTypes';
import { progressPercent } from './cadPresentation';
export default function CadJobCard({ job, paused, error, reading, onRetry }: {
  job?: Job; paused: boolean; error?: string; reading: boolean; onRetry: () => void;
}) {
  const progress = job?.progress;
  const percent = progress ? progressPercent(progress.step, progress.total) : null;
  return <li className="mb-4 w-full rounded-2xl bg-panel p-4 text-sm text-ink ring-1 ring-line/70" aria-label="CAD-задача">
    <h3 className="flex items-center gap-2 text-[15px] font-medium">{!paused && <LoaderCircle className="h-[18px] w-[18px] animate-spin text-accent" strokeWidth={1.8} />}{paused ? 'Нужно обновить результат CAD' : job?.status === 'queued' ? 'CAD: в очереди' : 'CAD: построение модели'}</h3>
    {!paused && progress?.label && <p role="status" className="mt-2">{progress.label}</p>}
    {!paused && progress && <p className="mt-2 text-xs text-muted">Шаг {progress.step} / {progress.total}{percent != null ? ` · ${percent}%` : ''}</p>}
    {!paused && percent != null && <progress aria-label="Прогресс CAD" value={percent} max={100} className="mt-2 h-1.5 w-full overflow-hidden rounded-full accent-[#1493ff] [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:bg-accent" />}
    {!paused && !progress && <p role="status" className="mt-2 text-xs text-muted">Ожидаем обновление статуса задачи…</p>}
    {error && <p role="alert" className="mt-2 text-danger">{error}</p>}
    {paused && <button type="button" disabled={reading} onClick={onRetry} className="mt-3 rounded-full bg-white border border-line px-4 py-2 disabled:opacity-40">{reading ? 'Обновляем…' : 'Повторить чтение CAD-задачи'}</button>}
  </li>;
}
