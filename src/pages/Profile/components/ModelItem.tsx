import { Box, Download } from "lucide-react";
import type { ModelItemProps } from "../../../types/UITypes/profileTypes";


export default function ModelItem({ model } : ModelItemProps){

    return (
      <div
        key={model.id}
        className="group overflow-hidden rounded-2xl bg-panel p-3 ring-1 ring-line/70 transition-shadow hover:shadow-[0_8px_24px_rgb(0_0_0/0.06)]"
      >
        <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_50%_40%,#ffffff,#ececec)]">
          <Box className="h-16 w-16 text-[#9a9a9a] transition-transform group-hover:scale-110" strokeWidth={1.2} />
        </div>

        <div className="px-1">
          <h3 className="mb-3 text-[15px] font-medium text-ink">{model.name}</h3>

          <dl className="mb-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted">Дата</dt>
              <dd className="mt-0.5 font-medium text-ink">{model.date}</dd>
            </div>
            <div>
              <dt className="text-muted">Размер</dt>
              <dd className="mt-0.5 font-medium text-ink">{model.size}</dd>
            </div>
          </dl>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
          <Download className="h-4 w-4" />
          Скачать STL
        </button>
      </div>
    );
}
