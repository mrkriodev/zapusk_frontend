import { Download, Trash2 } from "lucide-react";
import type { ChatItemProps } from "../../../../../types/UITypes/creatingTypes";
import { t, getLocale } from "../../../../../i18n/i18n";

export default function ChatItem({ item, activeChat, setActiveChat, onDeleteClick, onModelsClick} : ChatItemProps){

  const dateNorm = new Date(item.created_at).toLocaleDateString(getLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const isActive = activeChat === item.id;

    return (
      <li
        key={item.id}
        onClick={() => setActiveChat(item.id)}
        title={`${item.title ?? ""} · ${dateNorm}`}
        className={`group flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-2 transition-colors ${
          isActive ? "bg-sidebar-active text-ink" : "text-ink-2 hover:bg-panel-3"
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] leading-5">{item.title}</div>
          <div className="text-[11px] leading-4 text-muted">{dateNorm}</div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 lg:hidden lg:group-hover:flex lg:group-focus-within:flex">
          <button
            onClick={(e) => {
                e.stopPropagation();
                onModelsClick()
              }
            }
            className="rounded-lg p-1 text-muted transition-colors hover:bg-white hover:text-accent"
            aria-label={t("Показать сгенерированные модели")}
          >
            <Download className="h-4 w-4" strokeWidth={1.7}/>
          </button>

          <button
            onClick={(e) => {
                e.stopPropagation();
                onDeleteClick()
              }
            }
            className="rounded-lg p-1 text-muted transition-colors hover:bg-white hover:text-danger"
            aria-label={t("Удалить чат")}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.7}/>
          </button>
        </div>
      </li>
    );
}
