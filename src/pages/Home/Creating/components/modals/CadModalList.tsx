import { Download, FileJson, Package, X } from "lucide-react";
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

export default function CadModalList({ models, isLoading, isDownloadingId, onDownload, onEditModelParams, onClose, popoverRef }: CadModalListProps) {
  return (
    <div ref={popoverRef} className="fixed left-3 right-3 top-28 z-60 lg:left-[calc(20vw+24px)] lg:right-auto lg:top-36 lg:w-80">
      <div className="overflow-hidden rounded-xl border border-blue-400/30 bg-blue-950/98 shadow-2xl shadow-blue-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-blue-400/20 px-4 py-3">
          <Package className="h-4 w-4 shrink-0 text-purple-400" />
          <span className="truncate text-sm font-semibold text-white">Сгенерированные модели</span>
          <button onClick={onClose} className="ml-auto text-blue-400 hover:text-white" aria-label="Закрыть список моделей"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-80 space-y-2 overflow-y-auto p-2">
          {isLoading && <div className="px-2 py-3 text-sm text-blue-300">Загрузка моделей...</div>}
          {!isLoading && models.length === 0 && <div className="px-2 py-3 text-sm text-blue-300">У этого чата пока нет CAD-файлов</div>}
          {!isLoading && models.map((model) => (
            <section key={model.id} className="rounded-lg border border-blue-400/20 bg-blue-900/20 p-3">
              <div className="mb-2 flex items-baseline justify-between gap-2"><span className="font-medium text-white">Версия {model.version}</span><span className="text-xs text-blue-400">{new Date(model.createdAt).toLocaleString("ru-RU")}</span></div>
              <div className="flex flex-wrap gap-2">
                {model.hasStl && <button type="button" onClick={() => onDownload(downloadModel(model, "stl"))} disabled={isDownloadingId === `${model.id}-stl`} className="rounded-md border border-blue-400/30 px-2 py-1 text-xs text-blue-200 hover:bg-blue-800/50 disabled:opacity-50"><Download className="mr-1 inline h-3 w-3" />STL</button>}
                {model.hasStep && <button type="button" onClick={() => onDownload(downloadModel(model, "step"))} disabled={isDownloadingId === `${model.id}-step`} className="rounded-md border border-blue-400/30 px-2 py-1 text-xs text-blue-200 hover:bg-blue-800/50 disabled:opacity-50"><Download className="mr-1 inline h-3 w-3" />STEP</button>}
                {model.hasModelParams && <><button type="button" onClick={() => onDownload(downloadModel(model, "model_params"))} disabled={isDownloadingId === `${model.id}-model_params`} className="rounded-md border border-emerald-400/30 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900/40 disabled:opacity-50"><Download className="mr-1 inline h-3 w-3" />JSON</button><button type="button" onClick={() => onEditModelParams(model)} className="rounded-md border border-emerald-400/30 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900/40"><FileJson className="mr-1 inline h-3 w-3" />Править</button></>}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
