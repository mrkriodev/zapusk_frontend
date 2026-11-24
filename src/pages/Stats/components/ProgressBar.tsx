import type { CollectionName } from '../statsConfig';

export function ProgressBar({ percentage }: { name: CollectionName; percentage: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-ink-2">{percentage}%</span>
    </div>
  );
}
