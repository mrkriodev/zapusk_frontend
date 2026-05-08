import { MessageSquare } from "lucide-react";
import type { ChatItemProps } from "../../../types/creatingTypes";

export default function ChatItem({ item, activeChat, setActiveChat} : ChatItemProps){
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
        <div className="flex items-start gap-3">
          <MessageSquare className="w-4 h-4 text-blue-300 mt-1" />
          <div className="flex-1">
            <div className="text-white font-medium text-md mb-1">
              {item.name}
            </div>
            <div className="text-blue-300 text-sm">{item.date}</div>
          </div>
        </div>
      </li>
    );
}