import { useEffect, useRef } from "react";

type GenerateModalProps = {
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function GenerateModal({ isSubmitting, error, onCancel, onConfirm }: GenerateModalProps) {
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
      className="absolute bottom-[calc(100%_+_12px)] left-1/2 z-20 w-[calc(100%_-_24px)] max-w-[560px] -translate-x-1/2 rounded-xl border border-blue-400/30 bg-linear-to-br from-blue-950 to-purple-950 p-3 text-white shadow-lg shadow-black/20"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 id="generate-modal-title" className="min-w-0 flex-1 text-sm font-medium leading-snug">
          Вы точно хотите запустить генерацию модели?
        </h2>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-blue-400/20 bg-blue-800/40 px-3 py-2 text-sm text-blue-200 hover:bg-blue-800/60 focus-visible:outline-2 focus-visible:outline-blue-300 disabled:opacity-50 sm:flex-none"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-3 py-2 text-sm font-medium hover:from-blue-700 hover:to-purple-700 focus-visible:outline-2 focus-visible:outline-blue-300 disabled:cursor-wait disabled:opacity-50 sm:flex-none"
          >
            {isSubmitting ? "Запуск…" : "Сгенерировать"}
          </button>
        </div>
      </div>
      {error && <p id="generate-modal-error" role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
