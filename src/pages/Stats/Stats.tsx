import { FileText, FunctionSquare, Layers } from 'lucide-react';
import { CollectionBadge } from './components/CollectionBadge';
import { ProgressBar } from './components/ProgressBar';
import type { CollectionName } from './statsConfig';
import Layout from '../../components/Layout';

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
    <Layout title="База знаний">
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="pb-10 pt-6 text-center sm:pt-10">
            <h1 className="text-[28px] font-medium leading-tight tracking-tight text-ink sm:text-[44px]">Сила ИИ-инженера</h1>
            <p className="mt-2 text-[15px] text-muted sm:text-lg">
              Состояние векторной базы проиндексированных PDF-документов
            </p>
          </div>

          <h2 className="mb-3 text-lg font-medium tracking-tight text-ink sm:text-xl">Показатели</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {kpis.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="flex flex-col rounded-2xl bg-panel p-4 ring-1 ring-line/70">
                <div className="flex items-center gap-2 text-sm text-ink">
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.7} />
                  {label}
                </div>
                <div className="mt-4 text-[28px] font-medium tracking-tight text-ink">{value}</div>
                <div className="mt-0.5 text-xs leading-snug text-muted">{sub}</div>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-lg font-medium tracking-tight text-ink sm:text-xl">Распределение по коллекциям</h2>
              <span className="text-xs text-muted">
                5 коллекций · {formatNumber(TOTAL_POINTS)} points всего
              </span>
            </div>

            <div className="hidden overflow-hidden rounded-2xl ring-1 ring-line/70 sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-panel-2">
                    <th className="px-5 py-3 text-left text-xs font-normal text-muted">Collection</th>
                    <th className="px-5 py-3 text-right text-xs font-normal text-muted">Points</th>
                    <th className="px-5 py-3 text-right text-xs font-normal text-muted">With LaTeX</th>
                    <th className="px-5 py-3 text-right text-xs font-normal text-muted">Unique PDFs</th>
                    <th className="w-48 px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection, index) => {
                    const percentage = Math.round((collection.points / TOTAL_POINTS) * 100);
                    return (
                      <tr
                        key={collection.name}
                        className={`bg-panel transition-colors hover:bg-panel-2 ${index < collections.length - 1 ? 'border-b border-line' : ''}`}
                      >
                        <td className="px-5 py-3.5"><CollectionBadge name={collection.name as CollectionName} /></td>
                        <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink">{formatNumber(collection.points)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-ink-2">{formatNumber(collection.latex)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-ink-2">{formatNumber(collection.pdfs)}</td>
                        <td className="px-5 py-3.5"><ProgressBar name={collection.name as CollectionName} percentage={percentage} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-line overflow-hidden rounded-2xl bg-panel ring-1 ring-line/70 sm:hidden">
              {collections.map((collection) => {
                const percentage = Math.round((collection.points / TOTAL_POINTS) * 100);
                return (
                  <div key={collection.name} className="space-y-3 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <CollectionBadge name={collection.name as CollectionName} />
                      <span className="text-sm font-medium tabular-nums text-ink">{formatNumber(collection.points)}</span>
                    </div>
                    <ProgressBar name={collection.name as CollectionName} percentage={percentage} />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div><div className="mb-0.5 text-[11px] text-muted">Points</div><div className="text-xs font-medium tabular-nums text-ink">{formatNumber(collection.points)}</div></div>
                      <div><div className="mb-0.5 text-[11px] text-muted">LaTeX</div><div className="text-xs font-medium tabular-nums text-ink">{formatNumber(collection.latex)}</div></div>
                      <div><div className="mb-0.5 text-[11px] text-muted">PDFs</div><div className="text-xs font-medium tabular-nums text-ink">{formatNumber(collection.pdfs)}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
