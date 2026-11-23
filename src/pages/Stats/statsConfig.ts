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
  general: 'bg-violet-500/10 border-violet-400/25',
  thermodynamics: 'bg-orange-500/10 border-orange-400/25',
  hydraulics: 'bg-cyan-500/10 border-cyan-400/25',
  structural: 'bg-emerald-500/10 border-emerald-400/25',
  geometry: 'bg-pink-500/10 border-pink-400/25',
};

export const collectionTextColors: Record<CollectionName, string> = {
  general: 'text-violet-300',
  thermodynamics: 'text-orange-300',
  hydraulics: 'text-cyan-300',
  structural: 'text-emerald-300',
  geometry: 'text-pink-300',
};
