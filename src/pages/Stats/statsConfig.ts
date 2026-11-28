export type CollectionName =
  | 'general'
  | 'thermodynamics'
  | 'hydraulics'
  | 'structural'
  | 'geometry';

export const collectionColors: Record<CollectionName, string> = {
  general: 'from-violet-500 to-purple-600',
  thermodynamics: 'from-orange-400 to-amber-500',
  hydraulics: 'from-cyan-400 to-blue-500',
  structural: 'from-emerald-400 to-teal-500',
  geometry: 'from-pink-400 to-rose-500',
};

export const collectionBackgrounds: Record<CollectionName, string> = {
  general: 'bg-white ring-1 ring-line',
  thermodynamics: 'bg-white ring-1 ring-line',
  hydraulics: 'bg-white ring-1 ring-line',
  structural: 'bg-white ring-1 ring-line',
  geometry: 'bg-white ring-1 ring-line',
};

export const collectionTextColors: Record<CollectionName, string> = {
  general: 'text-ink',
  thermodynamics: 'text-ink',
  hydraulics: 'text-ink',
  structural: 'text-ink',
  geometry: 'text-ink',
};
