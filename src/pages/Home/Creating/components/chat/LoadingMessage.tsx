import { LoaderCircle } from "lucide-react";

export default function LoadingMessage() {
    return (
        <li className="flex justify-start">
            <div className="mb-3 flex max-w-[85%] items-center gap-3 rounded-2xl border border-blue-400/30 bg-blue-800/50 px-4 py-3 text-blue-100 backdrop-blur-sm lg:max-w-2xl lg:px-6 lg:py-4">
                <LoaderCircle className="h-5 w-5 animate-spin text-blue-300" />
                <p className="text-sm leading-relaxed lg:text-md">Генерируем ответ...</p>
            </div>
        </li>
    );
}
