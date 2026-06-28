import { Plus } from "lucide-react";
import type { CreateModalProps } from "../../../../../types/UITypes/creatingTypes";

export default function CreateModal({value, onChange, onCancel, onConfirm}: CreateModalProps){
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="relative bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-md border border-blue-400/30 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-purple-900/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Plus className="w-5 h-5 text-blue-300" />
              </div>
              <h2 className="text-white text-xl font-semibold">Новый чат</h2>
            </div>

            <label className="block text-blue-300 text-sm font-medium mb-2">
              Название чата
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
              placeholder="Введите название..."
              className="w-full bg-blue-800/30 border border-blue-400/30 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 bg-blue-800/40 hover:bg-blue-800/60 border border-blue-400/20 text-blue-300 py-3 rounded-xl transition-all"
              >
                Отмена
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl transition-all font-medium"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
    )
}