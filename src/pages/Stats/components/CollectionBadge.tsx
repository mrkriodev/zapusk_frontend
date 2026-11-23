import {
  collectionBackgrounds,
  collectionColors,
  collectionTextColors,
  type CollectionName,
} from '../statsConfig';

export function CollectionBadge({ name }: { name: CollectionName }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${collectionBackgrounds[name]} ${collectionTextColors[name]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${collectionColors[name]}`} />
      {name}
    </span>
  );
}
