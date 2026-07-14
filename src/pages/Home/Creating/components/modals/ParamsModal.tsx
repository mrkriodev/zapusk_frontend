import { SlidersHorizontal } from "lucide-react";

type ParamsModalProps = {
    value: string;
    isSubmitting: boolean;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
};

export default function ParamsModal({
    value,
    isSubmitting,
    onChange,
    onSubmit,
    onClose,
}: ParamsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-purple-400/30 bg-gradient-to-br from-blue-900/90 to-purple-900/90 p-6 shadow-2xl shadow-purple-900/50 backdrop-blur-md">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/20 p-2">
                        <SlidersHorizontal className="h-5 w-5 text-purple-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Параметры модели</h2>
                </div>

                <p className="mb-4 leading-relaxed text-blue-200">
                    Уточните параметры перед запуском генерации. Ответ ассистента будет использован при следующем запуске модели.
                </p>

                <input
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            onSubmit();
                        }
                    }}
                    disabled={isSubmitting}
                    placeholder="Например: сделай Pc 6 МПа и материал CuCrZr"
                    className="mb-4 w-full rounded-xl border border-blue-400/30 bg-blue-950/50 px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Закрыть
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting || !value.trim()}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Отправка..." : "Отправить"}
                    </button>
                </div>
            </div>
        </div>
    );
}
