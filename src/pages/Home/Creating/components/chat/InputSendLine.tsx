import {
  FlaskConical,
  Paperclip,
  RefreshCcw,
  Send,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRef } from "react";

type InputSendLineProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAssistantSubmit: () => void;
  isAssistantDisabled: boolean;
  isInputDisabled: boolean;
  isSendDisabled: boolean;
  needsAssistantPrompt: boolean;
  attachedFileName: string | null;
  attachmentError: string | null;
  canDownloadModelParams: boolean;
  canReviseFromAttachment: boolean;
  onAttachFile: (file: File) => void;
  onClearAttachment: () => void;
  onDownloadModelParams: () => void;
  onAdvancedSubmit: () => void;
};

export function InputSendLine({
  value,
  placeholder,
  onChange,
  onSend,
  onAssistantSubmit,
  isAssistantDisabled,
  isInputDisabled,
  isSendDisabled,
  needsAssistantPrompt,
  attachedFileName,
  attachmentError,
  canDownloadModelParams,
  canReviseFromAttachment,
  onAttachFile,
  onClearAttachment,
  onDownloadModelParams,
  onAdvancedSubmit,
}: InputSendLineProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearAttachedFile = () => {
    onClearAttachment();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full shrink-0 space-y-3 border-t border-blue-400/20 bg-blue-900/20 p-4 backdrop-blur-md md:p-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAssistantSubmit}
          disabled={isAssistantDisabled}
          className={`flex items-center gap-1.5 rounded-xl border border-purple-400/40 bg-purple-500/10 px-3 py-2 text-sm font-medium text-purple-300 transition-all hover:bg-purple-500/20 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-40 ${needsAssistantPrompt ? "animate-assistant-prompt motion-reduce:animate-none" : ""}`}
          title="Уточнить параметры"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden min-[480px]:inline">Уточнить</span>
          <span className="min-[480px]:hidden">Параметры</span>
        </button>

        <button
          type="button"
          onClick={onDownloadModelParams}
          disabled={!canDownloadModelParams || isInputDisabled}
          className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          title="Скачать JSON-чертёж текущей CAD-версии"
        >
          <FlaskConical className="h-3.5 w-3.5 shrink-0" />
          <span>FEM-тест</span>
        </button>

        <button
          type="button"
          onClick={onAdvancedSubmit}
          disabled={!canReviseFromAttachment || isInputDisabled}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          title="Отправить приложенный JSON-чертёж на пересборку"
        >
          <RefreshCcw className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Обновить по FEM</span>
          <span className="sm:hidden">По FEM</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onAttachFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
            attachedFileName
              ? "border-blue-400/60 bg-blue-500/20 text-blue-200"
              : "border-blue-400/30 bg-blue-800/20 text-blue-400 hover:bg-blue-800/40 hover:text-blue-200"
          }`}
          title="Прикрепить JSON-файл"
        >
          <Paperclip className="h-3.5 w-3.5 shrink-0" />
          <span className="max-w-[120px] truncate">
            {attachedFileName ?? "JSON"}
          </span>
          {attachedFileName && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Удалить прикреплённый JSON-файл"
              onClick={(event) => {
                event.stopPropagation();
                clearAttachedFile();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  clearAttachedFile();
                }
              }}
              className="ml-0.5 text-blue-400 transition-colors hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </div>

      {attachmentError && <p className="text-sm text-red-300">{attachmentError}</p>}

      <div className="flex gap-2 md:gap-3">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onSend()}
          disabled={isInputDisabled}
          className="flex-1 rounded-full border border-blue-400/30 bg-blue-800/30 px-4 py-3 text-sm text-white placeholder-blue-300/50 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-4 md:text-base"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={isSendDisabled}
          className="flex shrink-0 items-center gap-2 rounded-full bg-linear-to-r from-blue-500 to-purple-600 px-4 py-3 text-white shadow-lg shadow-purple-500/30 transition-all hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:from-blue-500 disabled:hover:to-purple-600 md:px-8 md:py-4"
          title={
            isSendDisabled && needsAssistantPrompt
              ? "Сначала уточните параметры у ассистента"
              : "Сгенерировать"
          }
        >
          <Send className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
    </div>
  );
}
