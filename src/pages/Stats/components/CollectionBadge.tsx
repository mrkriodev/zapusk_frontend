import {
  collectionBackgrounds,
  collectionColors,
  collectionTextColors,
  type CollectionName,
} from '../statsConfig';

export function CollectionBadge({ name }: { name: CollectionName }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${collectionBackgrounds[name]} ${collectionTextColors[name]}`}
    >
      <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${collectionColors[name]}`} />
      {name}
    </span>
  );
}
