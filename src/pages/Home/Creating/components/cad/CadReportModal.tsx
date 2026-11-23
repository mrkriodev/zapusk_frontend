import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ProductCapability } from '../../../../../types/apiTypes/CapabilityTypes';
import type { CadPresentation } from './cadPresentation';
import CadResultCard from './CadResultCard';
export default function CadReportModal({ presentation, products, onClose }: { presentation: CadPresentation; products?: ProductCapability[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  return <dialog ref={dialog} aria-label={`Отчёт CAD v${presentation.cad.version}`} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto w-[calc(100%_-_24px)] max-w-3xl overflow-visible border-0 bg-transparent p-0 text-blue-100 backdrop:bg-black/50">
    <div className="max-h-[85dvh] overflow-y-auto rounded-xl border border-blue-400/30 bg-slate-950 p-3">
      <div className="mb-3 flex justify-between gap-3 px-1"><h2 className="font-semibold">Отчёт CAD v{presentation.cad.version}</h2><button type="button" autoFocus onClick={onClose} aria-label="Закрыть отчёт CAD"><X className="h-5 w-5" /></button></div>
      <CadResultCard presentation={presentation} products={products} detailsOpen />
    </div>
  </dialog>;
}
