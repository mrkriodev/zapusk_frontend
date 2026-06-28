import { AlertTriangle } from "lucide-react";
import type { DeleteModalProps } from "../../../../../types/UITypes/creatingTypes";

export default function DeleteModal({chat, onCancel, onConfirm}: DeleteModalProps){
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="relative bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-md border border-red-400/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-red-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-white text-xl font-semibold">Удалить чат?</h2>
            </div>

            <p className="text-blue-300 mb-6 leading-relaxed">
              Чат «{chat?.title}» будет удалён безвозвратно.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 bg-blue-800/40 hover:bg-blue-800/60 border border-blue-400/20 text-blue-300 py-3 rounded-xl transition-all"
              >
                Отмена
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl transition-all font-medium"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
    )
}