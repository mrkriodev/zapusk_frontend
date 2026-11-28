import { Trash2 } from "lucide-react";
import { t } from "../../../i18n/i18n";

type DeleteObjectModalProps = {
  title: string;
  isDeleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteObjectModal({ title, isDeleting, error, onCancel, onConfirm }: DeleteObjectModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/35" onClick={isDeleting ? undefined : onCancel} />
      <div role="alertdialog" aria-labelledby="delete-object-title" className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_24px_64px_rgb(0_0_0/0.18)]">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="h-5 w-5 text-danger" strokeWidth={1.8} />
        </div>
        <h2 id="delete-object-title" className="mb-2 text-xl font-medium tracking-tight text-ink">{t("Удалить объект?")}</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted">
          {t("Объект «{title}» будет удалён безвозвратно вместе с моделями и историей чата.", { title })}
        </p>
        {error && <p role="alert" className="-mt-3 mb-4 text-sm text-danger">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} disabled={isDeleting} className="flex-1 rounded-full bg-panel-2 py-3 text-sm font-medium text-ink transition-colors hover:bg-panel-3 disabled:opacity-60">
            {t("Отмена")}
          </button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="flex-1 rounded-full bg-danger py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60">
            {isDeleting ? t("Удаление…") : t("Удалить")}
          </button>
        </div>
      </div>
    </div>
  );
}
