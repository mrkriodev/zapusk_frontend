import { CircleAlert } from "lucide-react";
import { t } from "../../../../../i18n/i18n";

type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <li className="flex justify-start">
      <div className="mb-4 flex w-full gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
        <CircleAlert className="mt-0.5 h-[18px] w-[18px] shrink-0 text-danger" strokeWidth={1.8} />
        <div>
          <p className="mb-0.5 text-sm font-medium text-danger">{t("Ошибка генерации")}</p>
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </li>
  );
}
