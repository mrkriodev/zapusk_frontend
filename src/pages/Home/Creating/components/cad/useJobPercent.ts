import { useEffect, useState } from 'react';
import type { Job } from '../../../../../types/apiTypes/JobTypes';
import { progressPercent } from './cadPresentation';

/** Характерное время построения модели для оценки, когда сервер не прислал progress. */
const ESTIMATE_TAU_MS = 60_000;
/** Оценка по времени не поднимается выше этого значения, пока задача не завершилась. */
const ESTIMATE_CAP = 95;

export type JobPercent = {
  /** Процент выполнения 0–100 */
  value: number;
  /** true — оценка по прошедшему времени, false — данные сервера (progress.step / progress.total) */
  estimated: boolean;
  /** Сколько секунд прошло с начала наблюдения за задачей */
  elapsedSec: number;
};

/**
 * Процент выполнения CAD-задачи для Лаборатории.
 * Если сервер присылает progress — считаем step / total.
 * Если нет — показываем оценку по времени, которая плавно растёт и не доходит до 100 %, пока задача не завершена.
 */
export function useJobPercent(jobId: string | null, job: Job | undefined, paused: boolean): JobPercent | null {
  const [startedAt, setStartedAt] = useState<{ jobId: string | null; at: number }>({ jobId: null, at: 0 });
  const [now, setNow] = useState(0);

  // отсчёт времени начинается, когда появилась новая задача; тикаем раз в секунду
  useEffect(() => {
    if (!jobId || paused) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      setStartedAt((current) => current.jobId === jobId ? current : { jobId, at: t });
    };
    const firstTick = window.setTimeout(tick, 0);
    const intervalId = window.setInterval(tick, 1000);
    return () => { window.clearTimeout(firstTick); window.clearInterval(intervalId); };
  }, [jobId, paused]);

  if (!jobId) return null;
  const elapsedMs = startedAt.jobId === jobId ? Math.max(0, now - startedAt.at) : 0;
  const elapsedSec = Math.floor(elapsedMs / 1000);

  if (job?.status === 'done') return { value: 100, estimated: false, elapsedSec };

  const real = job?.progress ? progressPercent(job.progress.step, job.progress.total) : null;
  if (real != null) return { value: real, estimated: false, elapsedSec };

  if (job?.status === 'queued') return { value: 0, estimated: true, elapsedSec };

  const estimate = Math.round(ESTIMATE_CAP * (1 - Math.exp(-elapsedMs / ESTIMATE_TAU_MS)));
  return { value: estimate, estimated: true, elapsedSec };
}

export const formatElapsed = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
