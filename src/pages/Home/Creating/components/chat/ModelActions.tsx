import { Box, Factory, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { t } from "../../../../../i18n/i18n";

const base = "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent";

/** Кнопки из дизайна в шапке чата с готовой моделью. Ведут в разделы, для которых пока нет backend API. */
export default function ModelActions() {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Link to="/factory" title={t("Изготовить деталь")} className={`${base} bg-accent text-white hover:bg-accent-hover`}>
        <Factory className="h-4 w-4" strokeWidth={1.7} />
        <span className="hidden md:inline">{t("Изготовить деталь")}</span>
      </Link>
      <Link to="/modelplace" title={t("Опубликовать в маркетплейсе")} className={`${base} bg-panel-2 text-ink hover:bg-panel-3`}>
        <Store className="h-4 w-4" strokeWidth={1.7} />
        <span className="hidden xl:inline">{t("Опубликовать в маркетплейсе")}</span>
      </Link>
      <Link to="/studio" title={t("Открыть в студии")} className={`${base} bg-panel-2 text-ink hover:bg-panel-3`}>
        <Box className="h-4 w-4" strokeWidth={1.7} />
        <span className="hidden xl:inline">{t("Открыть в студии")}</span>
      </Link>
    </div>
  );
}
