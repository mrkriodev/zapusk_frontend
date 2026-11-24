import { Download, FileText, Package, X } from "lucide-react";
import type { CadModel, CadModalListProps } from "../../../../../types/UITypes/creatingTypes";

const downloadModel = (model: CadModalListProps["models"][number], format: "stl" | "step" | "model_params"): CadModel => ({
  id: `${model.id}-${format}`,
  conversationId: model.conversationId,
  version: model.version,
  format,
  fileName: format === "model_params" ? `model_v${model.version}_params.json` : `model_v${model.version}.${format}`,
  name: `Версия ${model.version}`,
  time: format.toUpperCase(),
});

export default function CadModalList({ models, isLoading, isDownloadingId, onDownload, onReport, onClose, popoverRef }: CadModalListProps) {
  const btn = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50";
  return (
    <div ref={popoverRef} className="fixed left-3 right-3 top-20 z-[60] lg:left-[252px] lg:right-auto lg:top-28 lg:w-80">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_16px_48px_rgb(0_0_0/0.16)] ring-1 ring-line">
        <div className="flex items-center gap-2 px-4 py-3">
          <Package className="h-4 w-4 shrink-0 text-ink-2" strokeWidth={1.7} />
          <span className="truncate text-sm font-medium text-ink">Сгенерированные модели</span>
          <button onClick={onClose} className="ml-auto rounded-full p-1 text-muted hover:bg-panel-2 hover:text-ink" aria-label="Закрыть список моделей"><X className="h-4 w-4" /></button>
        </div>
        <div className="thin-scroll max-h-80 space-y-1.5 overflow-y-auto px-2 pb-2">
          {isLoading && <div className="px-2 py-3 text-sm text-muted">Загрузка моделей...</div>}
          {!isLoading && models.length === 0 && <div className="px-2 py-3 text-sm text-muted">У этого чата пока нет CAD-файлов</div>}
          {!isLoading && models.map((model) => (
            <section key={model.id} className="rounded-xl bg-panel p-3">
              <div className="mb-2 flex items-baseline justify-between gap-2"><span className="text-sm font-medium text-ink">Версия {model.version}</span><span className="text-xs text-muted">{new Date(model.createdAt).toLocaleString("ru-RU")}</span></div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => onReport(model)} className={`${btn} bg-white text-ink ring-1 ring-line hover:bg-panel-2`}><FileText className="h-3 w-3" />Отчёт</button>
                {model.hasStl && <button type="button" onClick={() => onDownload(downloadModel(model, "stl"))} disabled={isDownloadingId === `${model.id}-stl`} className={`${btn} bg-accent text-white hover:bg-accent-hover`}><Download className="h-3 w-3" />STL</button>}
                {model.hasStep && <button type="button" onClick={() => onDownload(downloadModel(model, "step"))} disabled={isDownloadingId === `${model.id}-step`} className={`${btn} bg-accent text-white hover:bg-accent-hover`}><Download className="h-3 w-3" />STEP</button>}
                {model.hasModelParams && <button type="button" onClick={() => onDownload(downloadModel(model, "model_params"))} disabled={isDownloadingId === `${model.id}-model_params`} className={`${btn} bg-panel-3 text-ink hover:bg-line-strong`}><Download className="h-3 w-3" />JSON</button>}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
