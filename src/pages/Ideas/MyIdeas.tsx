import { Bot, Lightbulb, Plus, ServerOff } from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Layout from "../../components/Layout";
import { getLocale, t } from "../../i18n/i18n";
import { useGetMyIdeasQuery } from "../../api/repository/IdeasApi";
import { IDEA_SECTIONS, IDEA_TYPES, ideasUi } from "../../components/ideas/ideasUi";
import type { IdeaStatus } from "../../types/apiTypes/IdeaTypes";

const STATUS: Record<IdeaStatus, { label: string; tone: string }> = {
  submitted: { label: "Отправлена", tone: "bg-accent-soft text-accent" },
  in_review: { label: "На рассмотрении", tone: "bg-amber-50 text-warning" },
  planned: { label: "Принята в план", tone: "bg-accent-soft text-accent" },
  done: { label: "Реализована", tone: "bg-green-50 text-success" },
  rejected: { label: "Отклонена", tone: "bg-red-50 text-danger" },
  merged: { label: "Объединена", tone: "bg-panel-2 text-ink-2" },
};

const labelOf = (list: { value: string; label: string }[], value: string) => t(list.find((item) => item.value === value)?.label ?? value);

export default function MyIdeas() {
  const { data, isLoading, isError, error, refetch } = useGetMyIdeasQuery();
  const ideas = data?.items ?? [];
  const status = (error as FetchBaseQueryError | undefined)?.status;
  const notConnected = isError && (status === 404 || status === 405 || status === 501);

  return (
    <Layout
      title={t("Мои идеи")}
      actions={
        <button type="button" onClick={ideasUi.open} className="hidden items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover sm:flex">
          <Plus className="h-4 w-4" strokeWidth={2} />
          {t("Предложить идею")}
        </button>
      }
    >
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-3xl pt-4">
          <p className="text-[15px] text-muted">{t("Ваши идеи и идеи ваших ИИ-агентов, их статусы и ответы платформы.")}</p>

          {isLoading && <p className="mt-8 text-sm text-muted">{t("Загрузка…")}</p>}

          {notConnected && (
            <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl bg-accent-soft p-4 text-sm text-ink ring-1 ring-accent/20">
              <ServerOff className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.7} />
              <div>
                <p className="font-medium">{t("Сервис идей пока не подключён на сервере")}</p>
                <p className="mt-1 text-ink-2">{t("Интерфейс готов по ТЗ. Идеи начнут сохраняться, когда сервер начнёт поддерживать ручки /ideas.")}</p>
              </div>
            </div>
          )}

          {isError && !notConnected && (
            <p role="alert" className="mt-6 text-sm text-danger">
              {t("Не удалось загрузить идеи.")}{" "}
              <button type="button" onClick={() => refetch()} className="underline">{t("Повторить")}</button>
            </p>
          )}

          {!isLoading && !isError && ideas.length === 0 && (
            <div className="mt-10 flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 text-ink-2">
                <Lightbulb className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <p className="mt-4 text-lg font-medium text-ink">{t("Идей пока нет")}</p>
              <p className="mt-1 max-w-sm text-sm text-muted">{t("Нажмите на лампочку в шапке любого раздела, чтобы предложить идею.")}</p>
            </div>
          )}

          {ideas.length > 0 && (
            <ul className="mt-6 space-y-3">
              {ideas.map((idea) => (
                <li key={idea.id} className="rounded-2xl bg-panel p-4 ring-1 ring-line/70">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 text-[15px] font-medium text-ink">
                      <span className="mr-1.5 text-muted">№{idea.number ?? idea.id}</span>
                      {idea.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[idea.status]?.tone ?? "bg-panel-2 text-ink-2"}`}>
                      {STATUS[idea.status] ? t(STATUS[idea.status].label) : idea.status}
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span>{labelOf(IDEA_SECTIONS, idea.section)}</span>·<span>{labelOf(IDEA_TYPES, idea.type)}</span>·
                    <span>{new Date(idea.created_at).toLocaleDateString(getLocale())}</span>
                    {idea.submitted_by_agent && <span className="inline-flex items-center gap-1"><Bot className="h-3.5 w-3.5" />{t("отправлена агентом")}</span>}
                  </p>
                  {idea.reply && (
                    <div className="mt-3 rounded-xl bg-white p-3 text-sm text-ink-2 ring-1 ring-line/70">
                      <p className="mb-1 text-xs font-medium text-muted">{t("Ответ платформы")}</p>
                      {idea.reply}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </Layout>
  );
}
