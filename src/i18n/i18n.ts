import { dictionaries } from "./dict";

export type Lang = "ru" | "en" | "zh";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
];

const STORAGE_KEY = "zapusk.lang";
const LOCALES: Record<Lang, string> = { ru: "ru-RU", en: "en-US", zh: "zh-CN" };

function readStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "ru" || v === "en" || v === "zh") return v;
  } catch {
    /* localStorage недоступен */
  }
  return "ru";
}

let current: Lang = readStored();
const listeners = new Set<() => void>();

export const getLang = (): Lang => current;
/** Локаль для toLocaleString / Intl */
export const getLocale = (): string => LOCALES[current];

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang;
  listeners.forEach((l) => l());
}

export function subscribeLang(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Перевод интерфейса. Ключ — исходная русская строка.
 * Подстановки: t("Шаг {step} / {total}", { step: 1, total: 5 }).
 * Если перевода нет — возвращается русская строка.
 */
export function t(ru: string, vars?: Record<string, string | number>): string {
  let s = current === "ru" ? ru : dictionaries[current][ru] ?? ru;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

document.documentElement.lang = current;
