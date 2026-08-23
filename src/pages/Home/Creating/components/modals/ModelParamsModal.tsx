import { X } from "lucide-react";

type ModelParamsModalProps = {
  version: number;
  value: string;
  error: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function ModelParamsModal({ version, value, error, isLoading, isSubmitting, onChange, onCancel, onSubmit }: ModelParamsModalProps) {
  return <div className="fixed inset-0 z-70 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} /><div className="relative flex max-h-[85dvh] w-full max-w-3xl flex-col rounded-2xl border border-emerald-400/30 bg-slate-950 p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Параметры модели v{version}</h2><p className="text-sm text-blue-300">Измените JSON и отправьте на перегенерацию.</p></div><button onClick={onCancel} className="text-blue-300 hover:text-white" aria-label="Закрыть редактор"><X /></button></div>{isLoading ? <p className="py-12 text-center text-blue-300">Загрузка параметров...</p> : <textarea value={value} onChange={(event) => onChange(event.target.value)} spellCheck={false} className="min-h-72 flex-1 resize-y rounded-xl border border-blue-400/30 bg-slate-900 p-3 font-mono text-sm text-blue-100 focus:border-blue-400/60 focus:outline-none" />}{error && <p className="mt-3 text-sm text-red-300">{error}</p>}<div className="mt-4 flex justify-end gap-3"><button onClick={onCancel} className="rounded-xl border border-blue-400/30 px-4 py-2 text-blue-200">Отмена</button><button onClick={onSubmit} disabled={isLoading || isSubmitting} className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-50">{isSubmitting ? "Запуск..." : "Перегенерировать"}</button></div></div></div>;
}
