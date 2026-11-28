import { useSyncExternalStore } from "react";
import type { IdeaSection, IdeaType } from "../../types/apiTypes/IdeaTypes";

// Состояние «Лампочки», общее для всех страниц (Layout перемонтируется при переходах).
type IdeasUiState = {
  panelOpen: boolean;
  /** Момент, когда сервер подтвердил сохранение идеи — запускает анимацию */
  ignitedAt: number | null;
  /** Номер последней отправленной идеи для подсказки */
  lastNumber: string | null;
};

let state: IdeasUiState = { panelOpen: false, ignitedAt: null, lastNumber: null };
const listeners = new Set<() => void>();
const emit = (next: Partial<IdeasUiState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

export const ideasUi = {
  open: () => emit({ panelOpen: true }),
  close: () => emit({ panelOpen: false }),
  /** Вызывать только после ответа сервера, что идея сохранена */
  ignite: (number: string) => emit({ panelOpen: false, ignitedAt: Date.now(), lastNumber: number }),
  dismissToast: () => emit({ lastNumber: null }),
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useIdeasUi = () => useSyncExternalStore(subscribe, () => state);

// Подписи — русские ключи, перевод через t() при выводе
export const IDEA_SECTIONS: { value: IdeaSection; label: string }[] = [
  { value: "home", label: "Главная" },
  { value: "core", label: "База знаний" },
  { value: "lab", label: "Лаборатория" },
  { value: "mplace", label: "Маркетплейс" },
  { value: "fab", label: "Фабрика" },
  { value: "studio", label: "Студия" },
  { value: "cabinet", label: "Личный кабинет" },
];

export const IDEA_TYPES: { value: IdeaType; label: string }[] = [
  { value: "feature", label: "Новая функция" },
  { value: "improvement", label: "Улучшение" },
  { value: "product_class", label: "Класс изделий или материал" },
  { value: "knowledge_source", label: "Источник для ядра знаний" },
  { value: "other", label: "Другое" },
];

