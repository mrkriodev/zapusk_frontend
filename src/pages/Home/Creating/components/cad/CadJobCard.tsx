import { LoaderCircle } from 'lucide-react';
import type { Job } from '../../../../../types/apiTypes/JobTypes';
import { formatElapsed, type JobPercent } from './useJobPercent';

export default function CadJobCard({ job, percent, paused, error, reading, onRetry }: {
  job?: Job; percent: JobPercent | null; paused: boolean; error?: string; reading: boolean; onRetry: () => void;
}) {
  const progress = job?.progress;
  const title = paused ? 'Нужно обновить результат CAD' : job?.status === 'queued' ? 'CAD: в очереди' : 'CAD: построение модели';
  const percentText = percent ? `${percent.estimated && percent.value > 0 ? '≈' : ''}${percent.value}%` : null;

  return <li className="mb-4 w-full rounded-2xl bg-panel p-4 text-sm text-ink ring-1 ring-line/70" aria-label="CAD-задача">
    <div className="flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-[15px] font-medium">{!paused && <LoaderCircle className="h-[18px] w-[18px] animate-spin text-accent" strokeWidth={1.8} />}{title}</h3>
      {!paused && percentText && <span aria-live="polite" className="shrink-0 text-[20px] font-medium tabular-nums tracking-tight text-accent">{percentText}</span>}
    </div>
    {!paused && percent && <progress aria-label="Прогресс генерации модели" value={percent.value} max={100} className="mt-3 h-1.5 w-full overflow-hidden rounded-full accent-[#1493ff] [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-accent [&::-webkit-progress-value]:transition-all [&::-moz-progress-bar]:bg-accent" />}
    {!paused && progress?.label && <p role="status" className="mt-2">{progress.label}</p>}
    {!paused && percent && <p className="mt-2 text-xs text-muted">
      {progress ? `Шаг ${progress.step} / ${progress.total}` : job?.status === 'queued' ? 'Ожидаем начала генерации' : 'Оценка по времени'}
      {` · прошло ${formatElapsed(percent.elapsedSec)}`}
    </p>}
    {error && <p role="alert" className="mt-2 text-danger">{error}</p>}
    {paused && <button type="button" disabled={reading} onClick={onRetry} className="mt-3 rounded-full bg-white border border-line px-4 py-2 disabled:opacity-40">{reading ? 'Обновляем…' : 'Повторить чтение CAD-задачи'}</button>}
  </li>;
}
