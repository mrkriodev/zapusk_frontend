import { Download } from "lucide-react";
import type { Message } from "../../../../../types/apiTypes/MessageTypes";

type MessageItemProps = {
  message: Message;
  onDownloadCadFile?: (message: Message) => void;
  isDownloading?: boolean;
};

export default function MessageItem({
    message,
    onDownloadCadFile,
    isDownloading = false,
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
            <p className="mt-1.5 text-xs text-muted">Прикреплён FEM-чертёж</p>
        )}
        {hasFile && (
            <button
                type="button"
                onClick={() => onDownloadCadFile?.(message)}
                disabled={isDownloading}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Download className="h-4 w-4" />
                {isDownloading ? "Скачивание..." : "Скачать модель"}
            </button>
        )}
        </div>
    </li>
    )
}
