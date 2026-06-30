import { MessageSquare, X } from "lucide-react";
import type { ChatItemProps } from "../../../../../types/UITypes/creatingTypes";

export default function ChatItem({ item, activeChat, setActiveChat, onDeleteClick} : ChatItemProps){

  const dateNorm = new Date(item.created_at).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

    return (
      <li
        key={item.id}
        onClick={() => setActiveChat(item.id)}
        className={`p-4 rounded-xl cursor-pointer transition-all ${
          activeChat === item.id
            ? "bg-blue-600/40 border border-blue-400/50"
            : "bg-blue-800/20 hover:bg-blue-800/30 border border-blue-400/20"
        }`}
      >
        <div className="group flex items-start justify-between gap-3">
          <div className="flex">
            <MessageSquare className="w-4 h-4 text-blue-300 mt-1 mr-2" />
            <div className="flex-1">
              <div className="text-white font-medium text-md mb-1">
                {item.title}
              </div>
              <div className="text-blue-300 text-sm">{dateNorm}</div>
            </div>
          </div>
          <button 
          onClick={(e) => {
              e.stopPropagation();
              onDeleteClick()
            }
          }
          className="shrink-0 text-blue-300 hover:text-red-400 group-hover:opacity-100 opacity-0">
            <X className="w-5 h-5"/>
          </button>
        </div>
      </li>
    );
}