import { LoaderCircle } from "lucide-react";

export default function LoadingMessage() {
    return (
        <li className="flex justify-start">
            <div className="mb-4 flex items-center gap-2.5 py-1 text-[15px] text-muted">
                <LoaderCircle className="h-[18px] w-[18px] animate-spin text-ink-2" strokeWidth={1.7} />
                <p className="bg-[linear-gradient(90deg,#3a3a3a,#a3a3a3,#3a3a3a)] bg-[length:200%_100%] bg-clip-text text-transparent motion-safe:animate-pulse">Генерируем ответ...</p>
            </div>
        </li>
    );
}
