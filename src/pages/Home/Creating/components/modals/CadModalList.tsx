import { ChevronRight, Download, Package, X } from "lucide-react";
import type { CadModalListProps } from "../../../../../types/UITypes/creatingTypes";

export default function CadModalList({ models, onClose, popoverRef }: CadModalListProps) {
  return (
    <div
      ref={popoverRef}
      className="fixed left-3 right-3 top-28 z-60 lg:left-[calc(20vw+24px)] lg:right-auto lg:top-36 lg:w-64"
    >
      <div className="bg-blue-950/98 backdrop-blur-md border border-blue-400/30 rounded-xl shadow-2xl shadow-blue-950/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-400/20 flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-white text-sm font-semibold truncate">
            Сгенерированные модели
          </span>
          <button
            onClick={onClose}
            className="ml-auto text-blue-400 hover:text-white transition-colors shrink-0"
            aria-label="Закрыть список моделей"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2 max-h-64 overflow-y-auto">
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-800/40 transition-colors text-left group/item"
            >
              <div className="p-1.5 bg-purple-500/20 rounded-lg shrink-0">
                <Download className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm truncate">{model.name}</div>
                <div className="text-blue-400 text-xs">
                  {model.size} · {model.time}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover/item:text-blue-300 transition-colors shrink-0" />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
