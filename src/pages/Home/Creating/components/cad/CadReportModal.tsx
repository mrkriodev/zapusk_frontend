import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ProductCapability } from '../../../../../types/apiTypes/CapabilityTypes';
import type { CadPresentation } from './cadPresentation';
import CadResultCard from './CadResultCard';
export default function CadReportModal({ presentation, products, onClose }: { presentation: CadPresentation; products?: ProductCapability[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  return <dialog ref={dialog} aria-label={`Отчёт CAD v${presentation.cad.version}`} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto w-[calc(100%_-_24px)] max-w-3xl overflow-visible border-0 bg-transparent p-0 text-ink backdrop:bg-black/35">
    <div className="max-h-[85dvh] overflow-y-auto thin-scroll rounded-3xl bg-white p-5 shadow-[0_24px_64px_rgb(0_0_0/0.18)]">
      <div className="mb-3 flex justify-between gap-3 px-1"><h2 className="text-lg font-medium tracking-tight">Отчёт CAD v{presentation.cad.version}</h2><button type="button" autoFocus onClick={onClose} aria-label="Закрыть отчёт CAD" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-2 text-white hover:bg-ink"><X className="h-4 w-4" /></button></div>
      <CadResultCard presentation={presentation} products={products} detailsOpen />
    </div>
  </dialog>;
}
