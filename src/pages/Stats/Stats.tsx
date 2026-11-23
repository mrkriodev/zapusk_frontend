import { FileText, FunctionSquare, Layers } from 'lucide-react';
import { CollectionBadge } from './components/CollectionBadge';
import { ProgressBar } from './components/ProgressBar';
import { collectionColors, type CollectionName } from './statsConfig';

const TOTAL_POINTS = 528494;

const collections = [
  { name: 'general', points: 307435, latex: 3404, pdfs: 326 },
  { name: 'thermodynamics', points: 83320, latex: 204, pdfs: 296 },
  { name: 'hydraulics', points: 63103, latex: 144, pdfs: 310 },
  { name: 'structural', points: 46061, latex: 189, pdfs: 278 },
  { name: 'geometry', points: 28575, latex: 107, pdfs: 303 },
];

const kpis = [
  {
    icon: FileText,
    label: 'Уникальных PDF',
    value: '328',
    sub: 'документов-источников',
    color: 'text-blue-300',
    background: 'bg-blue-500/10 border-blue-400/25',
  },
  {
    icon: Layers,
    label: 'Коллекций',
    value: '5',
    sub: 'тематических разделов',
    color: 'text-cyan-300',
    background: 'bg-cyan-500/10 border-cyan-400/25',
  },
  {
    icon: FunctionSquare,
    label: 'Математических формул',
    value: '4 048',
    sub: 'в документах коллекции',
    color: 'text-emerald-300',
    background: 'bg-emerald-500/10 border-emerald-400/25',
  },
];


function formatNumber(value: number) {
  return value.toLocaleString('ru-RU');
}

export default function Stats() {
  return (
    <main className="min-h-dvh bg-[linear-gradient(160deg,_#020617_0%,_#06111f_45%,_#0b1f3a_75%,_#0f2a5f_100%)] px-4 pb-10 pt-24 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Сила ИИ-инженера</h1>
          <p className="mt-1 text-sm text-blue-300/70">
            Состояние векторной базы проиндексированных PDF-документов
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {kpis.map(({ icon: Icon, label, value, sub, color, background }) => (
            <div key={label} className={`flex flex-col gap-2 rounded-2xl border p-4 ${background}`}>
              <div className={`${color} flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide opacity-80`}>
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </div>
              <div className={`text-2xl font-bold sm:text-3xl ${color}`}>{value}</div>
              <div className="text-xs leading-snug text-blue-300/50">{sub}</div>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-blue-400/20 bg-blue-900/15 backdrop-blur-sm">
          <div className="flex flex-col gap-1 border-b border-blue-400/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-white">Распределение по коллекциям</h2>
            <span className="text-xs text-blue-400/60">
              5 коллекций · {formatNumber(TOTAL_POINTS)} points всего
            </span>
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-400/10">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-blue-400/60">Collection</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-blue-400/60">Points</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-blue-400/60">With LaTeX</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-blue-400/60">Unique PDFs</th>
                  <th className="w-40 px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {collections.map((collection, index) => {
                  const percentage = Math.round((collection.points / TOTAL_POINTS) * 100);
                  return (
                    <tr
                      key={collection.name}
                      className={`transition-colors hover:bg-blue-800/15 ${index < collections.length - 1 ? 'border-b border-blue-400/10' : ''}`}
                    >
                      <td className="px-5 py-4"><CollectionBadge name={collection.name as CollectionName} /></td>
                      <td className="px-5 py-4 text-right font-mono font-medium tabular-nums text-white">{formatNumber(collection.points)}</td>
                      <td className="px-5 py-4 text-right font-mono tabular-nums text-emerald-300/80">{formatNumber(collection.latex)}</td>
                      <td className="px-5 py-4 text-right font-mono tabular-nums text-blue-300/80">{formatNumber(collection.pdfs)}</td>
                      <td className="px-5 py-4"><ProgressBar name={collection.name as CollectionName} percentage={percentage} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-blue-400/10 sm:hidden">
            {collections.map((collection) => {
              const percentage = Math.round((collection.points / TOTAL_POINTS) * 100);
              return (
                <div key={collection.name} className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <CollectionBadge name={collection.name as CollectionName} />
                    <span className="font-mono text-sm font-semibold text-white">{formatNumber(collection.points)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-blue-950/60">
                    <div className={`h-full rounded-full bg-gradient-to-r ${collectionColors[collection.name as CollectionName]}`} style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><div className="mb-0.5 text-[10px] uppercase tracking-wide text-blue-300/50">Points</div><div className="font-mono text-xs text-white">{formatNumber(collection.points)}</div></div>
                    <div><div className="mb-0.5 text-[10px] uppercase tracking-wide text-blue-300/50">LaTeX</div><div className="font-mono text-xs text-emerald-300/80">{formatNumber(collection.latex)}</div></div>
                    <div><div className="mb-0.5 text-[10px] uppercase tracking-wide text-blue-300/50">PDFs</div><div className="font-mono text-xs text-blue-300/80">{formatNumber(collection.pdfs)}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* <section className="space-y-3 rounded-2xl border border-blue-400/15 bg-blue-900/10 px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-300/70">
            <Info className="h-3.5 w-3.5" />
            Что означают показатели
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {notes.map(({ term, definition }) => (
              <div key={term} className="space-y-1">
                <div className="text-xs font-semibold text-white">{term}</div>
                <div className="text-xs leading-relaxed text-blue-300/55">{definition}</div>
              </div>
            ))}
          </div>
        </section> */}
      </div>
    </main>
  );
}
