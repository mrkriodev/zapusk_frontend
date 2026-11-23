import {
  Download,
  RefreshCcw,
  SlidersHorizontal,
} from "lucide-react";

type InputSendLineProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onAssistantSubmit: () => void;
  isAssistantDisabled: boolean;
  isInputDisabled: boolean;
  needsAssistantPrompt: boolean;
  canDownloadModelParams: boolean;
  canStartFem: boolean;
  femDisabledReason: string | null;
  isStartingFem: boolean;
  onStartFem: () => void;
  onDownloadModelParams: () => void;
};

export function InputSendLine({
  value,
  placeholder,
  onChange,
  onAssistantSubmit,
  isAssistantDisabled,
  isInputDisabled,
  needsAssistantPrompt,
  canDownloadModelParams,
  canStartFem,
  femDisabledReason,
  isStartingFem,
  onStartFem,
  onDownloadModelParams,
}: InputSendLineProps) {
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
         <Download className=" inline h-3.5 w-3.5" />
          <span>Параметры</span>
        </button>

        <button
          type="button"
          onClick={onStartFem}
          disabled={!canStartFem}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          title={femDisabledReason ?? "Запустить FEM текущей CAD-версии"}
        >
          <RefreshCcw className="h-3.5 w-3.5 shrink-0" />
          <span>{isStartingFem ? "Запуск FEM…" : "Запустить FEM"}</span>
        </button>

      </div>

      <div className="flex gap-2 md:gap-3">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing && !isAssistantDisabled) {
              event.preventDefault();
              onAssistantSubmit();
            }
          }}
          disabled={isInputDisabled}
          className="flex-1 rounded-full border border-blue-400/30 bg-blue-800/30 px-4 py-3 text-sm text-white placeholder-blue-300/50 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-4 md:text-base"
        />


      </div>
    </div>
  );
}
