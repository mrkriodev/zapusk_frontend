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
        className={`lg:max-w-2xl rounded-2xl lg:px-6 lg:py-4 px-4 py-2 max-w-[85%] ${
            isUser
            ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white mb-2'
            : 'bg-blue-800/50 backdrop-blur-sm text-blue-100 border border-blue-400/30 mb-3'
            }`}
        >
        <p className="leading-relaxed lg:text-md text-sm">{message.content}</p>
        {isUser && message.has_model_params && (
            <p className="mt-2 text-xs text-blue-100/80">Прикреплён FEM-чертёж</p>
        )}
        {hasFile && (
            <button
                type="button"
                onClick={() => onDownloadCadFile?.(message)}
                disabled={isDownloading}
                className="mt-4 flex items-center gap-2 rounded-lg border border-green-400/30 bg-green-500/20 px-4 py-2 text-green-300 transition-all hover:bg-green-500/30 disabled:cursor-not-allowed disabled:opacity-60 w-47"
            >
                <Download className="w-4 h-4" />
                {isDownloading ? "Скачивание..." : "Скачать модель"}
            </button>
        )}
        </div>
    </li>
    )
}
