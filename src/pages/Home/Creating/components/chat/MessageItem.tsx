import { BookOpen, Download } from "lucide-react";
import type { DialogChatOut, KnowledgeSource } from "../../../../../types/apiTypes/DialogTypes";
import type { Message } from "../../../../../types/apiTypes/MessageTypes";
import { t } from "../../../../../i18n/i18n";

type MessageItemProps = {
  message: Message;
  onDownloadCadFile?: (message: Message) => void;
  isDownloading?: boolean;
  knowledge?: { status: DialogChatOut["knowledge_status"]; sources: KnowledgeSource[] };
};

const knowledgeNotes: Partial<Record<DialogChatOut["knowledge_status"], string>> = {
  no_evidence: "В базе знаний не нашлось подтверждения для этого ответа.",
  unavailable: "База знаний сейчас недоступна, ответ без источников.",
};

export default function MessageItem({
    message,
    onDownloadCadFile,
    isDownloading = false,
    knowledge,
} : MessageItemProps){

    const isUser = message.role === "user"
    const hasFile = Boolean(message.cad_state_id)

    return(
    <li
    key={message.id}
    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
     >
        <div
        className={`${
            isUser
            ? 'mb-4 max-w-[85%] rounded-2xl bg-panel px-4 py-3 text-ink sm:max-w-[75%]'
            : 'mb-4 w-full py-1 text-ink'
            }`}
        >
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        {isUser && message.has_model_params && (
            <p className="mt-1.5 text-xs text-muted">{t("Прикреплён FEM-чертёж")}</p>
        )}
        {hasFile && (
            <button
                type="button"
                onClick={() => onDownloadCadFile?.(message)}
                disabled={isDownloading}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Download className="h-4 w-4" />
                {isDownloading ? t("Скачивание...") : t("Скачать модель")}
            </button>
        )}
        {knowledge && knowledge.sources.length > 0 && (
            <details className="mt-3 rounded-2xl bg-panel px-4 py-3 text-sm">
                <summary className="flex cursor-pointer items-center gap-2 font-medium text-ink">
                    <BookOpen className="h-4 w-4" strokeWidth={1.7} />
                    {t("Источники из базы знаний ({count})", { count: knowledge.sources.length })}
                </summary>
                <ol className="mt-3 space-y-3">
                    {knowledge.sources.map((source) => (
                        <li key={`${source.citation_id}-${source.chunk_id}`} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                            <p className="font-medium text-ink">[{source.citation_id}] {source.source}</p>
                            <p className="text-xs text-muted">{source.chapter ? `${source.chapter} · ` : ""}{t("стр. {page}", { page: source.page })}</p>
                            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-snug text-ink-2">{source.excerpt}</p>
                        </li>
                    ))}
                </ol>
            </details>
        )}
        {knowledge && knowledgeNotes[knowledge.status] && (
            <p className="mt-2 text-xs text-muted">{t(knowledgeNotes[knowledge.status] ?? "")}</p>
        )}
        </div>
    </li>
    )
}
