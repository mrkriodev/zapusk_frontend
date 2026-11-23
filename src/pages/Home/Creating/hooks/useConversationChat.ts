import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  canRetryChat, useChatMutation, useGetConservationByIdQuery, useLazyGetConservationByIdQuery,
} from '../../../../api/repository/ConversationsApi';
import type { DialogChatRequest, DialogDraft } from '../../../../types/apiTypes/DialogTypes';
import type { Message } from '../../../../types/apiTypes/MessageTypes';

interface Turn {
  conversationId: string;
  request: Readonly<DialogChatRequest>;
  confirmation: boolean;
  visit: symbol;
  createdAt: string;
}
interface FailedTurn { turn: Turn; message: string; retryable: boolean }
interface Prompt {
  conversationId: string;
  draft: DialogDraft;
  notice?: string;
  requestId?: string;
}
function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data;
    if (data && typeof data === 'object' && 'detail' in data) {
      if (typeof data.detail === 'string') return data.detail;
      if (data.detail && typeof data.detail === 'object' && 'message' in data.detail && typeof data.detail.message === 'string') return data.detail.message;
    }
  }
  return 'Не удалось получить ответ. Повтор запроса сохранит исходные данные.';
}
function staleDraft(error: unknown): DialogDraft | null {
  if (!error || typeof error !== 'object' || !('status' in error) || error.status !== 409 || !('data' in error)) return null;
  const data = error.data as { detail?: { code?: string; draft?: DialogDraft } };
  const draft = data?.detail?.draft;
  return data?.detail?.code === 'stale_draft' && draft && typeof draft.revision === 'number'
    && draft.params && Array.isArray(draft.missing_inputs) ? draft : null;
}

export function useConversationChat(conversationId: string | null, onCadJob: (id: string, conversationId: string) => void) {
  const [sendChat] = useChatMutation();
  const [getConversation] = useLazyGetConservationByIdQuery();
  const [pending, setPending] = useState<Turn | null>(null);
  const [failures, setFailures] = useState<FailedTurn[]>([]);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [notices, setNotices] = useState<Record<string, string>>({});
  const [waiting, setWaiting] = useState<string[]>([]);
  const lock = useRef(false);
  const visit = useRef({ conversationId, token: Symbol() });
  const watchedJobs = useRef(new Set<string>());
  const approvedByRevision = useRef<Record<string, DialogDraft>>({});
  const jobSnapshots = useRef<Record<string, DialogDraft>>({});
  const getApprovedDraft = useCallback((id: string) => jobSnapshots.current[id], []);

  useLayoutEffect(() => {
    visit.current = { conversationId, token: Symbol() };
  }, [conversationId]);

  const beginJob = useCallback((id: string, owner: string, revision?: number | null) => {
    if (revision != null) {
      const snapshot = approvedByRevision.current[`${owner}:${revision}`];
      if (snapshot) jobSnapshots.current[id] = snapshot;
    }
    if (watchedJobs.current.has(id)) return;
    watchedJobs.current.add(id);
    onCadJob(id, owner);
  }, [onCadJob]);

  const continueAfterJob = useCallback(async (owner: string, completedId: string) => {
    if (!watchedJobs.current.has(completedId)) return;
    try {
      const data = await getConversation(owner, false).unwrap();
      const generation = data.dialog_state?.generation;
      const nextId = generation?.active_job_id;
      if (nextId && nextId !== completedId) beginJob(nextId, owner, generation?.active_draft_revision);
      setWaiting((ids) => generation?.pending ? [...new Set([...ids, owner])] : ids.filter((id) => id !== owner));
      setNotices((values) => ({ ...values, [owner]: generation?.pending ? 'Следующая сборка ожидает завершения текущей.' : '' }));
    } catch {
      setWaiting((ids) => [...new Set([...ids, owner])]);
      setNotices((values) => ({ ...values, [owner]: 'Не удалось обновить очередь сборки. Проверяем состояние…' }));
    }
  }, [getConversation, beginJob]);

  const waitingOwner = waiting[0];
  const queue = useGetConservationByIdQuery(waitingOwner ?? skipToken, { pollingInterval: waitingOwner ? 2000 : 0, refetchOnMountOrArgChange: true });
  useEffect(() => {
    const data = queue.currentData;
    if (!waitingOwner || !data || data.id !== waitingOwner || queue.isFetching || queue.isError) return;
    const timer = window.setTimeout(() => {
      const generation = data.dialog_state?.generation;
      if (generation?.active_job_id) beginJob(generation.active_job_id, waitingOwner, generation.active_draft_revision);
      if (!generation?.pending) {
        setWaiting((ids) => ids.filter((id) => id !== waitingOwner));
        setNotices((values) => ({ ...values, [waitingOwner]: '' }));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [queue.currentData, queue.isFetching, queue.isError, waitingOwner, beginJob]);

  const perform = async (turn: Turn, retryOnce: boolean) => {
    if (lock.current) return;
    lock.current = true;
    setPending(turn);
    setFailures((items) => items.filter((item) => item.turn.request.request_id !== turn.request.request_id));
    setPrompt((current) => current?.conversationId === turn.conversationId
      ? turn.confirmation ? { ...current, requestId: turn.request.request_id } : null
      : current);
    setNotices((values) => ({ ...values, [turn.conversationId]: '' }));
    try {
      const response = await sendChat({ conversationId: turn.conversationId, request: turn.request, retryOnce }).unwrap();
      const currentVisit = visit.current.conversationId === turn.conversationId && visit.current.token === turn.visit;
      setPrompt((current) => current?.conversationId === turn.conversationId ? null : current);
      if (response.action === 'draft_updated' && response.draft.ready_to_generate && currentVisit) {
        setPrompt({ conversationId: turn.conversationId, draft: structuredClone(response.draft) });
      }
      if (response.action === 'generation_started') {
        if (response.generation.active_job_id) beginJob(response.generation.active_job_id, turn.conversationId, response.generation.active_draft_revision);
        else setNotices((values) => ({ ...values, [turn.conversationId]: 'Сервер не вернул ID CAD-задачи. Генерация не подтверждена.' }));
      }
      if (response.action === 'generation_pending') {
        setNotices((values) => ({ ...values, [turn.conversationId]: 'Следующая сборка ожидает завершения текущей.' }));
        if (response.generation.active_job_id) beginJob(response.generation.active_job_id, turn.conversationId, response.generation.active_draft_revision);
        else setWaiting((ids) => [...new Set([...ids, turn.conversationId])]);
      }
    } catch (error) {
      const draft = staleDraft(error);
      const currentVisit = visit.current.conversationId === turn.conversationId && visit.current.token === turn.visit;
      if (draft) {
        const message = 'Параметры изменились. Проверьте актуальную сводку и подтвердите её заново.';
        if (currentVisit) setPrompt({ conversationId: turn.conversationId, draft: structuredClone(draft), notice: message });
        else setNotices((values) => ({ ...values, [turn.conversationId]: message }));
      } else {
        const retryable = error && typeof error === 'object' && 'status' in error && canRetryChat(error as FetchBaseQueryError);
        setFailures((items) => [...items.filter((item) => item.turn.request.request_id !== turn.request.request_id), { turn, message: errorMessage(error), retryable: Boolean(retryable) }]);
        if (turn.confirmation && currentVisit) {
          setPrompt((current) => current ?? {
            conversationId: turn.conversationId,
            draft: confirmationSnapshots.current[turn.request.request_id],
            requestId: turn.request.request_id,
          });
        }
      }
    } finally {
      lock.current = false;
      setPending(null);
    }
  };

  const confirmationSnapshots = useRef<Record<string, DialogDraft>>({});
  const submit = (text: string, productId?: string) => {
    if (!conversationId || !text.trim() || text.trim().length > 12000 || lock.current) return false;
    const turn: Turn = {
      conversationId, request: Object.freeze({ request_id: crypto.randomUUID(), text: text.trim(), ...(productId ? { product_id: productId } : {}) }),
      confirmation: false, visit: visit.current.token, createdAt: new Date().toISOString(),
    };
    void perform(turn, true);
    return true;
  };
  const confirm = () => {
    if (!prompt || prompt.conversationId !== conversationId || !prompt.draft.ready_to_generate || lock.current) return;
    const previous = failures.find((item) => item.turn.request.request_id === prompt.requestId);
    if (previous) {
      if (previous.retryable) void perform(previous.turn, false);
      return;
    }
    const request = Object.freeze({ request_id: crypto.randomUUID(), text: 'Сгенерируй модель', expected_draft_revision: prompt.draft.revision });
    confirmationSnapshots.current[request.request_id] = structuredClone(prompt.draft);
    approvedByRevision.current[`${prompt.conversationId}:${prompt.draft.revision}`] = structuredClone(prompt.draft);
    void perform({ conversationId: prompt.conversationId, request, confirmation: true, visit: visit.current.token, createdAt: new Date().toISOString() }, true);
  };
  const retry = (id: string) => {
    const failed = failures.find((item) => item.turn.request.request_id === id);
    if (failed?.retryable && !lock.current) {
      // An explicit retry is a new user action, but replays the exact same server turn.
      void perform({ ...failed.turn, visit: visit.current.token }, false);
    }
  };
  const visiblePrompt = prompt?.conversationId === conversationId ? prompt : null;
  const promptFailure = failures.find((item) => item.turn.request.request_id === visiblePrompt?.requestId);
  const optimisticMessage: Message | null = pending ? {
    id: `optimistic-${pending.request.request_id}`, conversation_id: pending.conversationId,
    role: 'user', content: pending.request.text, cad_state_id: null, has_model_params: false, created_at: pending.createdAt,
  } : null;

  return {
    submit, confirm, retry, continueAfterJob, getApprovedDraft,
    dismiss: () => { if (!lock.current) setPrompt(null); },
    hideForNavigation: () => setPrompt(null),
    prompt: visiblePrompt,
    promptError: promptFailure?.message ?? null,
    promptCanRetry: promptFailure?.retryable ?? false,
    promptHasFailed: Boolean(promptFailure),
    failures: failures.filter((item) => item.turn.conversationId === conversationId),
    notice: conversationId ? notices[conversationId] : '',
    busy: Boolean(pending),
    isConfirming: Boolean(pending?.confirmation),
    pendingConversationId: pending?.conversationId,
    optimisticMessage,
    queueBusy: Boolean(conversationId && waiting.includes(conversationId)),
  };
}

export type ConversationChat = ReturnType<typeof useConversationChat>;
