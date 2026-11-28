import type { Lang } from "../i18n";
import core from "./core";
import shell from "./shell";
import lab from "./lab";
import cad from "./cad";
import ideas from "./ideas";

type Dict = Record<string, string>;
export type DictPart = { en: Dict; zh: Dict };

const parts: DictPart[] = [core, shell, lab, cad, ideas];

export const dictionaries: Record<Exclude<Lang, "ru">, Dict> = {
  en: Object.assign({}, ...parts.map((p) => p.en)),
  zh: Object.assign({}, ...parts.map((p) => p.zh)),
};
