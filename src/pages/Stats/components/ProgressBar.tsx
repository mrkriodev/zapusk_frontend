import { collectionColors, type CollectionName } from '../statsConfig';

export function ProgressBar({ name, percentage }: { name: CollectionName; percentage: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-950/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${collectionColors[name]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-blue-400/50">{percentage}%</span>
    </div>
  );
}
