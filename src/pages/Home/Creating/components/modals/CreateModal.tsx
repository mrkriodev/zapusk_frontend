import { X } from "lucide-react";
import type { CreateModalProps } from "../../../../../types/UITypes/creatingTypes";
import { t } from "../../../../../i18n/i18n";

export default function CreateModal({value, onChange, onCancel, onConfirm}: CreateModalProps){
    return(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/35"
            onClick={onCancel}
          />
          <div role="dialog" aria-labelledby="create-chat-title" className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_64px_rgb(0_0_0/0.18)]">
            <button type="button" onClick={onCancel} aria-label={t("Закрыть")} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-ink-2 text-white transition-colors hover:bg-ink">
              <X className="h-4 w-4" />
            </button>
            <h2 id="create-chat-title" className="mb-5 text-xl font-medium tracking-tight text-ink">{t("Новый объект")}</h2>

            <label className="mb-2 block text-sm text-muted">
              {t("Название объекта")}
            </label>
            <input
              type="text"
              value={value}
              autoFocus
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
              placeholder={t("Введите название...")}
              className="mb-6 w-full rounded-2xl bg-white px-4 py-3 text-[15px] text-ink ring-1 ring-line placeholder:text-subtle focus:outline-none focus:ring-accent/60"
            />

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 rounded-full bg-panel-2 py-3 text-sm font-medium text-ink transition-colors hover:bg-panel-3"
              >
                {t("Отмена")}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-full bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                {t("Создать")}
              </button>
            </div>
          </div>
        </div>
    )
}
