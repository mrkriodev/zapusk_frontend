import { Fragment, useSyncExternalStore, type ReactNode } from "react";
import { getLang, subscribeLang } from "./i18n";

/** При смене языка перемонтирует дерево, чтобы все вызовы t() пересчитались. */
export default function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getLang);
  return <Fragment key={lang}>{children}</Fragment>;
}
