import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { Paperclip, X } from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { t } from "../../i18n/i18n";
import { useSubmitIdeaMutation } from "../../api/repository/IdeasApi";
import type { IdeaSection, IdeaType } from "../../types/apiTypes/IdeaTypes";
import { IDEA_SECTIONS, IDEA_TYPES, ideasUi, useIdeasUi } from "./ideasUi";

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 3000;
const FILE_MAX = 10 * 1024 * 1024;

/** Раздел подставляется по текущей странице, пользователь может сменить */
const sectionByPath = (path: string): IdeaSection => {
  if (path === "/") return "lab";
  if (path.startsWith("/statistics")) return "core";
  if (path.startsWith("/modelplace")) return "mplace";
  if (path.startsWith("/factory")) return "fab";
  if (path.startsWith("/studio")) return "studio";
  if (path.startsWith("/profile") || path.startsWith("/account")) return "cabinet";
  return "home";
};

const errorText = (error: unknown) => {
  const status = (error as FetchBaseQueryError | undefined)?.status;
  if (status === 429) return t("Лимит — 10 идей в сутки. Попробуйте завтра.");
  if (status === 404 || status === 405 || status === 501) return t("Сервис идей пока не подключён на сервере. Идея не отправлена.");
  if (status === 413) return t("Файл слишком большой. Максимум — 10 МБ.");
  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") return t("Нет связи с сервером. Идея не отправлена.");
  return t("Не удалось отправить идею. Попробуйте ещё раз.");
};

function IdeaForm() {
  const location = useLocation();
  const [submitIdea, { isLoading }] = useSubmitIdeaMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSection] = useState<IdeaSection>(() => sectionByPath(location.pathname));
  const [type, setType] = useState<IdeaType>("feature");
  const [file, setFile] = useState<File | null>(null);
  const [shareContext, setShareContext] = useState(false);
  const [contactAllowed, setContactAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !isLoading;

  const handleFile = (next: File | null) => {
    setError(null);
    if (next && next.size > FILE_MAX) {
      setFile(null);
      setError(t("Файл слишком большой. Максимум — 10 МБ."));
      return;
    }
    setFile(next);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      const idea = await submitIdea({
        title: title.trim(),
        description: description.trim(),
        section,
        type,
        contact_allowed: contactAllowed,
        page_context: shareContext
          ? { url: window.location.href, user_agent: navigator.userAgent, ui_version: import.meta.env.MODE }
          : null,
        attachment: file,
      }).unwrap();
      // Лампочка загорается только после подтверждения сервера
      ideasUi.ignite(String(idea.number ?? idea.id));
    } catch (err) {
      console.error("Ошибка отправки идеи", err);
      setError(errorText(err));
    }
  };

  const field = "w-full rounded-xl bg-panel px-3 py-2.5 text-[15px] text-ink outline-none ring-1 ring-line placeholder:text-subtle focus:ring-accent";
  const label = "mb-1 block text-sm font-medium text-ink";

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="thin-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
        <div>
          <label htmlFor="idea-title" className={label}>{t("Суть идеи")}</label>
          <input id="idea-title" value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder={t("Коротко: что улучшить")} className={field} required />
          <p className="mt-1 text-right text-xs text-muted">{title.length} / {TITLE_MAX}</p>
        </div>

        <div>
          <label htmlFor="idea-description" className={label}>{t("Описание")}</label>
          <textarea id="idea-description" value={description} maxLength={DESCRIPTION_MAX} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder={t("Какая задача, как сейчас, как было бы лучше")} className={`${field} resize-y`} required />
          <p className="mt-1 text-right text-xs text-muted">{description.length} / {DESCRIPTION_MAX}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="idea-section" className={label}>{t("Раздел платформы")}</label>
            <select id="idea-section" value={section} onChange={(e) => setSection(e.target.value as IdeaSection)} className={field}>
              {IDEA_SECTIONS.map((item) => <option key={item.value} value={item.value}>{t(item.label)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="idea-type" className={label}>{t("Тип")}</label>
            <select id="idea-type" value={type} onChange={(e) => setType(e.target.value as IdeaType)} className={field}>
              {IDEA_TYPES.map((item) => <option key={item.value} value={item.value}>{t(item.label)}</option>)}
            </select>
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted">{t("Если что-то работает с ошибкой, опишите это — сообщение сразу уйдёт в поддержку.")}</p>

        <div>
          <span className={label}>{t("Вложение")}</span>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-panel px-3 py-2.5 text-sm text-ink-2 ring-1 ring-line hover:text-ink">
            <Paperclip className="h-4 w-4 shrink-0" strokeWidth={1.7} />
            <span className="truncate">{file ? file.name : t("Снимок экрана или файл до 10 МБ")}</span>
            <input type="file" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </label>
          {file && <button type="button" onClick={() => handleFile(null)} className="mt-1 text-xs text-muted underline">{t("Убрать файл")}</button>}
          <p className="mt-1 text-xs text-muted">{t("Модель из Студии прикладывайте ссылкой.")}</p>
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={shareContext} onChange={(e) => setShareContext(e.target.checked)} className="mt-0.5 accent-accent" />
          <span>{t("Приложить адрес страницы, браузер и версию интерфейса")}</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={contactAllowed} onChange={(e) => setContactAllowed(e.target.checked)} className="mt-0.5 accent-accent" />
          <span>{t("Команда может связаться со мной с уточняющими вопросами")}</span>
        </label>

        <p className="text-xs leading-relaxed text-muted">{t("Отправляя идею, вы разрешаете платформе безвозмездно её использовать. Исключительные права на модели и изобретения при этом не передаются.")}</p>
      </div>

      <div className="border-t border-line/70 px-5 py-4">
        {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}
        <button type="submit" disabled={!canSubmit} className="w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50">
          {isLoading ? t("Отправка…") : t("Отправить идею")}
        </button>
      </div>
    </form>
  );
}

export default function IdeaPanel() {
  const { panelOpen } = useIdeasUi();
  if (!panelOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/35" onClick={ideasUi.close} />
      <div role="dialog" aria-modal="true" aria-labelledby="idea-panel-title" className="relative flex h-full w-full max-w-md flex-col bg-white shadow-[0_24px_64px_rgb(0_0_0/0.18)]">
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <h2 id="idea-panel-title" className="text-xl font-medium tracking-tight text-ink">{t("Предложить идею")}</h2>
            <p className="mt-1 text-sm text-muted">{t("Как сделать платформу лучше? Мы ответим на каждую идею.")}</p>
          </div>
          <button type="button" onClick={ideasUi.close} aria-label={t("Закрыть")} className="rounded-lg p-1.5 text-ink-2 hover:bg-panel-2">
            <X className="h-5 w-5" strokeWidth={1.7} />
          </button>
        </div>
        <IdeaForm />
      </div>
    </div>
  );
}
