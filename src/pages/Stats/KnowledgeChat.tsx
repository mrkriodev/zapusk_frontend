import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUp, BookOpen, ChevronDown, CornerDownLeft, FileSearch, Lightbulb, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { RAG_TIMEOUT_MS, useAskRagMutation } from '../../api/repository/RagApi';
import type { RagDomain, RagKnowledgeStatus, RagSource } from '../../types/apiTypes/RagTypes';
import { createUUID } from '../../utils/uuid';
import { t } from '../../i18n/i18n';

type ChatMessage =
  | { id: string; role: 'user'; text: string; domain: RagDomain }
  | { id: string; role: 'assistant'; text: string; status: RagKnowledgeStatus; sources: RagSource[] }
  | { id: string; role: 'error'; text: string; retry: { query: string; domain: RagDomain } };

const STORAGE_KEY = 'knowledge-chat';

const domains: { id: RagDomain; label: string }[] = [
  { id: 'all', label: 'Все разделы' },
  { id: 'structural', label: 'Прочность' },
  { id: 'thermo', label: 'Термодинамика' },
  { id: 'hydraulic', label: 'Гидравлика' },
  { id: 'geometry', label: 'Геометрия' },
  { id: 'general', label: 'Общая инженерия' },
];

const suggestions: { text: string; domain: RagDomain }[] = [
  { text: 'Что такое коэффициент Пуассона материала?', domain: 'structural' },
  { text: 'Как рассчитать прогиб консольной балки?', domain: 'structural' },
  { text: 'Как определить потери давления в трубопроводе?', domain: 'hydraulic' },
];

/* Этапы ожидания: API ответа не стримит, показываем прогресс по времени */
const steps = [
  { icon: Lightbulb, label: 'Анализ вопроса', after: 0 },
  { icon: FileSearch, label: 'Поиск в базе знаний', after: 4 },
  { icon: Sparkles, label: 'Формирование ответа', after: 15 },
];

const statusNotes: Partial<Record<RagKnowledgeStatus, string>> = {
  no_evidence: 'Подтверждение в документах базы знаний не найдено.',
  unavailable: 'База знаний сейчас недоступна, ответ без источников.',
};

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function errorText(error: unknown): string {
  const status = (error as { status?: unknown } | undefined)?.status;
  if (status === 'TIMEOUT_ERROR') return t('Ответ не получен за {sec} секунд. Попробуйте ещё раз или уточните вопрос.', { sec: RAG_TIMEOUT_MS / 1000 });
  if (status === 'FETCH_ERROR') return t('Нет связи с сервером. Проверьте подключение и попробуйте ещё раз.');
  if (typeof status === 'number') return t('Сервер вернул ошибку {status}. Попробуйте ещё раз.', { status });
  return t('Не удалось получить ответ. Попробуйте ещё раз.');
}

function Sources({ sources }: { sources: RagSource[] }) {
  return (
    <details className="group mt-3 rounded-2xl bg-panel px-4 py-3 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-ink [&::-webkit-details-marker]:hidden">
        <BookOpen className="h-4 w-4 shrink-0" strokeWidth={1.7} />
        {t('Источники из базы знаний ({count})', { count: sources.length })}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" strokeWidth={1.7} />
      </summary>
      <ol className="mt-3 space-y-3">
        {sources.map((source, index) => (
          <li key={source.chunk_id ?? index} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
            <p className="font-medium text-ink">
              <span className="mr-1.5 text-accent">[{source.citation_id ?? index + 1}]</span>
              {source.source}
            </p>
            {(source.chapter || source.page != null) && (
              <p className="mt-0.5 text-xs text-muted">
                {[source.chapter, source.page != null ? t('стр. {page}', { page: source.page }) : null].filter(Boolean).join(' · ')}
              </p>
            )}
            {source.excerpt && (
              <p className="thin-scroll mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-ink-2">{source.excerpt}</p>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}

function Pending({ elapsed }: { elapsed: number }) {
  const current = steps.reduce((acc, step, index) => (elapsed >= step.after ? index : acc), 0);
  return (
    <div role="status" aria-live="polite" className="space-y-2.5 py-1">
      {steps.map(({ icon: Icon, label }, index) => {
        if (index > current) return null;
        const active = index === current;
        return (
          <p key={label} className={`flex items-center gap-2 text-sm ${active ? 'text-ink-2' : 'text-muted'}`}>
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.7} />
            <span className={active ? 'animate-pulse' : ''}>{t(label)}{active ? '…' : ''}</span>
          </p>
        );
      })}
      <p className="pl-6 text-xs text-subtle">
        {t('{sec} с · ответ обычно занимает до 2 минут', { sec: elapsed })}
      </p>
    </div>
  );
}

export default function KnowledgeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [question, setQuestion] = useState('');
  const [domain, setDomain] = useState<RagDomain>('all');
  const [elapsed, setElapsed] = useState(0);
  const [askRag, { isLoading }] = useAskRagMutation();
  const listRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<{ abort: () => void } | null>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => {
      window.clearInterval(timer);
      setElapsed(0);
    };
  }, [isLoading]);

  // Уход со страницы отменяет ожидающий запрос
  useEffect(() => () => requestRef.current?.abort(), []);

  const send = async (text: string, askDomain: RagDomain, withUserMessage = true) => {
    const query = text.trim();
    if (!query || isLoading) return;
    setQuestion('');
    setMessages((prev) => [
      ...prev.filter((message) => message.role !== 'error'),
      ...(withUserMessage ? [{ id: createUUID(), role: 'user' as const, text: query, domain: askDomain }] : []),
    ]);

    const request = askRag({ query, domain: askDomain });
    requestRef.current = request;
    try {
      const data = await request.unwrap();
      setMessages((prev) => [
        ...prev,
        { id: createUUID(), role: 'assistant', text: data.answer, status: data.knowledge_status, sources: data.sources ?? [] },
      ]);
    } catch (error) {
      if ((error as { name?: string } | undefined)?.name === 'AbortError') return;
      setMessages((prev) => [...prev, { id: createUUID(), role: 'error', text: errorText(error), retry: { query, domain: askDomain } }]);
    } finally {
      if (requestRef.current === request) requestRef.current = null;
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(question, domain);
  };

  const clear = () => {
    requestRef.current?.abort();
    setMessages([]);
  };

  const hasChat = messages.length > 0 || isLoading;
  const domainLabel = (id: RagDomain) => { const label = domains.find((item) => item.id === id)?.label; return label ? t(label) : undefined; };

  return (
    <div className="mx-auto mt-10 max-w-[800px] text-left">
      {hasChat ? (
        <div className="relative">
          <div ref={listRef} className="thin-scroll max-h-[min(440px,55vh)] min-h-[200px] space-y-5 overflow-y-auto pb-2 pr-2">
            {messages.map((message) => {
              if (message.role === 'user') {
                return (
                  <div key={message.id} className="flex flex-col items-end">
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-panel px-4 py-3 text-[15px] leading-relaxed text-ink sm:max-w-[65%]">{message.text}</p>
                    {message.domain !== 'all' && <span className="mt-1 text-xs text-muted">{domainLabel(message.domain)}</span>}
                  </div>
                );
              }
              if (message.role === 'error') {
                return (
                  <div key={message.id} role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl bg-danger/5 px-4 py-3 text-sm text-danger">
                    <span className="min-w-0 flex-1">{message.text}</span>
                    <button
                      type="button"
                      onClick={() => void send(message.retry.query, message.retry.domain, false)}
                      className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-panel"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} />
                      {t('Повторить')}
                    </button>
                  </div>
                );
              }
              const note = statusNotes[message.status];
              return (
                <div key={message.id} className="max-w-full sm:max-w-[85%]">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{message.text}</p>
                  {note && <p className="mt-2 text-xs text-muted">{t(note)}</p>}
                  {message.sources.length > 0 && <Sources sources={message.sources} />}
                </div>
              );
            })}
            {isLoading && <Pending elapsed={elapsed} />}
          </div>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={clear} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted transition-colors hover:bg-panel hover:text-ink">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.7} />
              {t('Очистить диалог')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((item) => (
            <button
              key={item.text}
              type="button"
              onClick={() => { setDomain(item.domain); void send(t(item.text), item.domain); }}
              className="flex items-center gap-2 rounded-lg bg-panel-3 px-3 py-1.5 text-left text-[13px] text-ink transition-colors hover:bg-line-strong/60 sm:text-sm"
            >
              <CornerDownLeft className="h-4 w-4 shrink-0" strokeWidth={1.7} />
              {t(item.text)}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-[580px] items-center gap-1 rounded-full bg-white py-1.5 pl-5 pr-1.5 ring-1 ring-line focus-within:ring-accent">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={t("Спросите ИИ-инженера…")}
          aria-label={t("Вопрос ИИ-инженеру")}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
        />
        <label className="relative hidden shrink-0 sm:block">
          <span className="sr-only">{t("Раздел базы знаний")}</span>
          <select
            value={domain}
            onChange={(event) => setDomain(event.target.value as RagDomain)}
            className="appearance-none rounded-full bg-panel py-1.5 pl-3 pr-7 text-xs text-ink-2 outline-none transition-colors hover:bg-panel-3 focus-visible:ring-2 focus-visible:ring-accent"
          >
            {domains.map((item) => <option key={item.id} value={item.id}>{t(item.label)}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" strokeWidth={1.8} />
        </label>
        <button type="submit" disabled={!question.trim() || isLoading} aria-label={t("Спросить")} className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:bg-line-strong">
          <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      </form>
      <p className="mt-3 text-center text-xs text-muted">
        {t('Спросите своими словами. Поиск идёт по документам, формулам и концептам базы знаний.')}
      </p>
    </div>
  );
}
