import { useRef, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  isFemPending, useGetCapabilitiesQuery, useGetFemRunsQuery, useGetFemRunQuery,
  useStartFemMutation, useCancelFemMutation, downloadFemArtifact,
} from '../../../../api/repository/FemApi';
import { useReviseCadMutation } from '../../../../api/repository/CadApi';
import type { CadState } from '../../../../types/apiTypes/CadTypes';
import type { FemJobAccepted, FemRun } from '../../../../types/apiTypes/FemTypes';

function apiError(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data;
    if (data && typeof data === 'object' && 'detail' in data && typeof data.detail === 'string') return data.detail;
  }
  return fallback;
}

export function canReviseFem(run: FemRun) {
  if (run.status !== 'ok' || !run.model_params_new || !run.next_action) return false;
  const expected = `/api/conversations/${run.conversation_id}/cad/${run.version}/revise`;
  try {
    const url = new URL(run.next_action.url, 'https://zapusk.io');
    return (run.next_action.method ?? 'POST').toUpperCase() === 'POST'
      && url.origin === 'https://zapusk.io' && url.pathname.replace(/^\/v1\//, '/api/') === expected;
  } catch { return false; }
}

export function useConversationFem(
  conversationId: string | null,
  currentCad: CadState | null | undefined,
  cadBusy: boolean,
  onCadJob: (jobId: string, conversationId: string) => void,
) {
  const capabilities = useGetCapabilitiesQuery();
  const history = useGetFemRunsQuery(conversationId ?? skipToken, { refetchOnMountOrArgChange: true });
  const runs = [...(history.currentData?.items ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const pendingRun = runs.find((run) => isFemPending(run.status));
  const status = useGetFemRunQuery(pendingRun?.id ?? skipToken, { pollingInterval: pendingRun ? 2000 : 0, refetchOnMountOrArgChange: true });
  const [startFem, starting] = useStartFemMutation();
  const [cancelFem] = useCancelFemMutation();
  const [reviseCad, revising] = useReviseCadMutation();
  const requestLock = useRef(false);
  const acceptedJobs = useRef<Record<string, FemJobAccepted>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cancellingIds, setCancellingIds] = useState<string[]>([]);
  const [revisedIds, setRevisedIds] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const productId = typeof currentCad?.params.product_id === 'string' ? currentCad.params.product_id : 'engine_assembly';
  const product = capabilities.data?.products.find((item) => item.id === productId);
  const pending = Boolean(pendingRun);
  const busy = pending || starting.isLoading || revising.isLoading;
  const reason = !currentCad ? 'Сначала создайте CAD-модель'
    : !currentCad.files.step || !currentCad.files.model_params ? 'Для FEM нужны сохранённые STEP и параметры модели'
    : capabilities.isError ? 'Не удалось проверить поддержку FEM'
    : !capabilities.data ? 'Проверяем поддержку FEM'
    : !product || product.supports_fem === false ? 'FEM для этого изделия недоступен'
    : history.isError ? 'Сначала обновите историю FEM'
    : !history.currentData || history.isFetching ? 'Обновляем историю FEM'
    : cadBusy || busy ? 'Дождитесь завершения текущей операции'
    : null;

  const setError = (key: string, message: string) => setErrors((previous) => ({ ...previous, [key]: message }));
  const clearError = (key: string) => setError(key, '');

  const start = async () => {
    if (!conversationId || !currentCad || reason || requestLock.current) return;
    const id = conversationId;
    requestLock.current = true;
    clearError(id);
    try {
      const result = await startFem({ conversationId: id, version: currentCad.version }).unwrap();
      acceptedJobs.current[id] = result;
    } catch (error) {
      setError(id, apiError(error, 'Не удалось подтвердить запуск FEM. Обновите историю, чтобы проверить, был ли расчёт принят.'));
    } finally { requestLock.current = false; }
  };

  const cancel = async (run: FemRun) => {
    if (!isFemPending(run.status) || cancellingIds.includes(run.id)) return;
    setCancellingIds((ids) => [...ids, run.id]);
    clearError(run.id);
    try {
      const result = await cancelFem({ id: run.id, conversationId: run.conversation_id }).unwrap();
      if (result.note) setError(run.id, result.note);
      // Keep polling: acceptance of cancellation is not a terminal run state.
    } catch (error) {
      setCancellingIds((ids) => ids.filter((id) => id !== run.id));
      setError(run.id, apiError(error, 'Не удалось запросить отмену. Расчёт продолжает отслеживаться.'));
    }
  };

  const revise = async (run: FemRun) => {
    if (!canReviseFem(run) || !run.model_params_new || cadBusy || busy || requestLock.current || revisedIds.includes(run.id)) return;
    requestLock.current = true;
    clearError(run.id);
    try {
      const job = await reviseCad({
        conversationId: run.conversation_id, version: run.version,
        modelParams: run.model_params_new, femRunId: run.id,
      }).unwrap();
      setRevisedIds((ids) => [...ids, run.id]);
      onCadJob(job.job_id, run.conversation_id);
    } catch (error) {
      setError(run.id, apiError(error, 'Не удалось подтвердить пересборку. Повтор использует тот же FEM-прогон.'));
    } finally { requestLock.current = false; }
  };

  const download = async (run: FemRun, format: string) => {
    if (!run.files?.[format]) return;
    const key = `${run.id}:${format}`;
    setDownloading(key);
    clearError(run.id);
    try {
      const file = await downloadFemArtifact(run.id, format);
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName ?? `fem-v${run.version}-${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(run.id, apiError(error, 'Не удалось скачать файл расчёта.'));
    } finally { setDownloading(null); }
  };

  return {
    runs, busy, canStart: !reason, reason, start, cancel, revise, download,
    starting: starting.isLoading, revising: revising.isLoading, errors,
    cancellingIds, revisedIds, downloading, actionsDisabled: cadBusy || busy,
    loading: history.isLoading, historyError: history.isError, statusError: status.isError,
    capabilitiesError: capabilities.isError,
    refresh: () => {
      if (conversationId) void history.refetch();
      if (pendingRun) void status.refetch();
      if (capabilities.isError) void capabilities.refetch();
    },
  };
}

export type ConversationFem = ReturnType<typeof useConversationFem>;
