import { Trash2 } from "lucide-react";
import type { DeleteModalProps } from "../../../../../types/UITypes/creatingTypes";

export default function DeleteModal({chat, onCancel, onConfirm}: DeleteModalProps){
    return(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/35"
            onClick={onCancel}
          />
          <div role="alertdialog" aria-labelledby="delete-chat-title" className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_24px_64px_rgb(0_0_0/0.18)]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-danger" strokeWidth={1.8} />
            </div>
            <h2 id="delete-chat-title" className="mb-2 text-xl font-medium tracking-tight text-ink">Удалить чат?</h2>

            <p className="mb-6 text-sm leading-relaxed text-muted">
              Чат «{chat?.title}» будет удалён безвозвратно.
            </p>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 rounded-full bg-panel-2 py-3 text-sm font-medium text-ink transition-colors hover:bg-panel-3"
              >
                Отмена
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-full bg-danger py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
    )
}
