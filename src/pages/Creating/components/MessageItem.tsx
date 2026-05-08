import { Download } from "lucide-react";
import type { Message } from "../../../types/creatingTypes";

type MessageItemProps = {
  message: Message;
};

export default function MessageItem({message} : MessageItemProps){
    
    return(
    <li 
    key={message.id}
    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
     >
        <div
        className={`max-w-2xl rounded-2xl px-6 py-4 ${
            message.isUser
            ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white'
            : 'bg-blue-800/50 backdrop-blur-sm text-blue-100 border border-blue-400/30'
            }`}
        >
        <p className="leading-relaxed">{message.text}</p>
        {message.hasFile && (
            <button className="mt-4 flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 
            text-green-300 px-4 py-2 rounded-lg border border-green-400/30 transition-all">
                <Download className="w-4 h-4" />
                Скачать модель.stl
            </button>
        )}
        </div>
    </li>
    )
}