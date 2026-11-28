import { Box, Download, Trash2 } from "lucide-react";
import type { ModelItemProps } from "../../../types/UITypes/profileTypes";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function ModelItem({ model, isDownloading, onOpen, onDownload, onDelete }: ModelItemProps) {
  const title = model.title?.trim() || "Без названия";
  const hasModel = model.current_version != null;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-panel p-3 ring-1 ring-line/70 transition-shadow hover:shadow-[0_8px_24px_rgb(0_0_0/0.06)]">
      <button
        type="button"
        onClick={() => onDelete(model)}
        aria-label={`Удалить объект «${title}»`}
        title="Удалить объект"
        className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted shadow-sm ring-1 ring-line/70 transition-colors hover:bg-red-50 hover:text-danger"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.8} />
      </button>

      <button
        type="button"
        onClick={() => onOpen(model)}
        aria-label={`Открыть объект «${title}» в Лаборатории`}
        className="mb-3 flex h-40 w-full items-center justify-center rounded-xl bg-[radial-gradient(circle_at_50%_40%,#ffffff,#ececec)]"
      >
        <Box className="h-16 w-16 text-[#9a9a9a] transition-transform group-hover:scale-110" strokeWidth={1.2} />
      </button>

      <div className="px-1">
        <h3 className="mb-3 truncate text-[15px] font-medium text-ink" title={title}>{title}</h3>

        <dl className="mb-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-muted">Дата</dt>
            <dd className="mt-0.5 font-medium text-ink">{formatDate(model.updated_at)}</dd>
          </div>
          <div>
            <dt className="text-muted">Версия модели</dt>
            <dd className="mt-0.5 font-medium text-ink">{hasModel ? `v${model.current_version}` : "—"}</dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        onClick={() => onDownload(model)}
        disabled={!hasModel || isDownloading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-panel-3 disabled:text-muted"
      >
        <Download className="h-4 w-4" />
        {isDownloading ? "Скачивание…" : hasModel ? "Скачать STL" : "Модели ещё нет"}
      </button>
    </div>
  );
}
