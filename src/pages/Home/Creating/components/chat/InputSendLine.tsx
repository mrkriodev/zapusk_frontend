import { ArrowUp, RefreshCcw, Settings, WandSparkles } from "lucide-react";

type InputSendLineProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onAssistantSubmit: () => void;
  isAssistantDisabled: boolean;
  isInputDisabled: boolean;
  needsAssistantPrompt: boolean;
  canViewModelParams: boolean;
  canStartFem: boolean;
  showFem: boolean;
  femDisabledReason: string | null;
  isStartingFem: boolean;
  onStartFem: () => void;
  onOpenModelParams: () => void;
};

export function InputSendLine({
  value,
  placeholder,
  onChange,
  onAssistantSubmit,
  isAssistantDisabled,
  isInputDisabled,
  needsAssistantPrompt,
  canViewModelParams,
  canStartFem,
  showFem,
  femDisabledReason,
  isStartingFem,
  onStartFem,
  onOpenModelParams,
}: InputSendLineProps) {
  const chip = "flex shrink-0 items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed";
  return (
    <div className="w-full shrink-0 space-y-2.5">
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
        <button
          type="button"
          onClick={onAssistantSubmit}
          disabled={isAssistantDisabled}
          className={`${chip} bg-white text-ink ring-1 ring-line-strong hover:bg-panel disabled:bg-panel-2 disabled:text-subtle disabled:ring-transparent ${needsAssistantPrompt ? "animate-assistant-prompt motion-reduce:animate-none" : ""}`}
          title="Уточнить параметры"
        >
          <WandSparkles className="h-4 w-4 shrink-0" strokeWidth={1.7} />
          <span>Уточнить</span>
        </button>

        <button
          type="button"
          onClick={onOpenModelParams}
          disabled={!canViewModelParams || isInputDisabled}
          className={`${chip} bg-panel-2 text-ink-2 hover:bg-panel-3 disabled:text-subtle disabled:hover:bg-panel-2`}
          title="Открыть параметры текущей CAD-версии"
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.7} />
          <span>Параметры</span>
        </button>

        {showFem && <button
          type="button"
          onClick={onStartFem}
          disabled={!canStartFem}
          className={`${chip} bg-panel-2 text-ink-2 hover:bg-panel-3 disabled:text-subtle disabled:hover:bg-panel-2`}
          title={femDisabledReason ?? "Запустить FEM текущей CAD-версии"}
        >
          <RefreshCcw className="h-4 w-4 shrink-0" strokeWidth={1.7} />
          <span>{isStartingFem ? "Запуск FEM…" : "Запустить FEM"}</span>
        </button>}
      </div>

      <div className="flex items-center gap-2 rounded-[22px] bg-white py-1.5 pl-4 pr-1.5 ring-1 ring-line shadow-[0_1px_2px_rgb(0_0_0/0.03)] transition-shadow focus-within:ring-accent/60 focus-within:shadow-[0_0_0_4px_rgb(20_147_255/0.10)] has-[input:disabled]:bg-panel">
        <input
          type="text"
          maxLength={12000}
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
          aria-label="Описание детали"
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink placeholder:text-subtle focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onAssistantSubmit}
          disabled={isAssistantDisabled}
          aria-label="Отправить"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line-strong"
        >
          <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
