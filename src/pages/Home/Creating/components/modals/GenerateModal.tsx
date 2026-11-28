import { useEffect, useRef } from "react";
import type { DialogDraft } from "../../../../../types/apiTypes/DialogTypes";

type GenerateModalProps = {
  isSubmitting: boolean;
  error: string | null;
  draft: DialogDraft;
  notice?: string;
  retryLabel: boolean;
  canConfirm: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function GenerateModal({ isSubmitting, error, draft, notice, retryLabel, canConfirm, onCancel, onConfirm }: GenerateModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSubmitting) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !cardRef.current?.contains(event.target)) {
        onCancel();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onCancel]);

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-labelledby="generate-modal-title"
      aria-describedby={error ? "generate-modal-error" : undefined}
      aria-busy={isSubmitting}
      className="absolute bottom-[calc(100%_+_6px)] left-1/2 z-20 w-[min(560px,calc(100%_-_2rem))] -translate-x-1/2 rounded-2xl bg-white p-4 text-ink shadow-[0_12px_40px_rgb(0_0_0/0.14)] ring-1 ring-line"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 id="generate-modal-title" className="min-w-0 flex-1 text-[15px] font-medium leading-snug">
          Вы точно хотите запустить генерацию модели?
        </h2>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-panel-2 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-panel-3 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 sm:flex-none"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || !canConfirm}
            className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-50 sm:flex-none"
          >
            {isSubmitting ? "Запуск…" : retryLabel ? "Повторить" : "Сгенерировать"}
          </button>
        </div>
      </div>
      <div className="thin-scroll mt-3 max-h-[min(32dvh,14rem)] overflow-y-auto rounded-xl bg-panel p-3 text-[13px]">
        <p className="mb-2 text-xs text-muted">Ревизия {draft.revision}</p>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {(draft.summary ?? []).map((item) => <div key={item.key} className="flex flex-wrap justify-between gap-x-2"><dt className="text-muted">{item.label}</dt><dd className="break-words font-medium">{typeof item.value === 'boolean' ? item.value ? 'Да' : 'Нет' : item.value}{item.unit ? ` ${item.unit}` : ''}</dd></div>)}
        </dl>
        {draft.missing_inputs.length > 0 && <p className="mt-2 text-warning">Нужно уточнить: {draft.missing_inputs.join(', ')}</p>}
      </div>
      {notice && <p role="status" className="mt-2 text-xs text-warning">{notice}</p>}
      {error && <p id="generate-modal-error" role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
