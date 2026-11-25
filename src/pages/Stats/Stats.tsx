import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BookMarked, Brain, ChevronDown, FolderTree, Plus, ServerOff, Sigma, Waypoints } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import KnowledgeChat from './KnowledgeChat';

/* Актуальные данные векторной базы (статичные, отдельного API статистики нет) */
const collections = [
  { name: 'Общая инженерия', points: 269227, latex: 108274, pdfs: 170 },
  { name: 'Прочность и конструкции', points: 170957, latex: 57283, pdfs: 212 },
  { name: 'Термодинамика', points: 146733, latex: 64111, pdfs: 229 },
  { name: 'Гидравлика', points: 86244, latex: 48428, pdfs: 222 },
  { name: 'Геометрия', points: 12152, latex: 6318, pdfs: 208 },
];
const TOTAL_POINTS = collections.reduce((sum, collection) => sum + collection.points, 0);

type Metric = {
  icon: LucideIcon;
  label: string;
  value: number;
  sub: string;
  info: { what: string; how: string; read: string };
};

const metrics: Metric[] = [
  {
    icon: BookMarked, label: 'Уникальных PDF', value: 279, sub: 'документов-источников в базе',
    info: {
      what: 'Сколько разных PDF-документов загружено в базу знаний.',
      how: 'Количество уникальных файлов по всем коллекциям, без повторов.',
      read: 'Больше источников — шире охват тем. Это количество, а не оценка качества.',
    },
  },
  {
    icon: Waypoints, label: 'Чанков в индексе', value: 685313, sub: 'фрагментов для поиска',
    info: {
      what: 'Фрагменты текста, на которые разбиты документы для поиска.',
      how: 'Сумма чанков (points) во всех коллекциях векторной базы.',
      read: 'Чем больше фрагментов, тем точнее поиск находит нужное место в документе.',
    },
  },
  {
    icon: FolderTree, label: 'Коллекций', value: 5, sub: 'инженерных разделов',
    info: {
      what: 'Тематические разделы, по которым разложены документы.',
      how: 'Количество коллекций в векторной базе.',
      read: 'Коллекции помогают искать в нужной инженерной области.',
    },
  },
  {
    icon: Sigma, label: 'Чанков с LaTeX', value: 284414, sub: 'фрагментов с формулами',
    info: {
      what: 'Фрагменты, в которых есть математические формулы в LaTeX.',
      how: 'Количество чанков с LaTeX-разметкой по всем коллекциям.',
      read: 'Показывает, сколько расчётного материала доступно ИИ-инженеру.',
    },
  },
];

const fmt = (value: number) => value.toLocaleString('ru-RU');

function NoBackend({ text, className = '' }: { text: string; className?: string }) {
  return (
    <p role="status" className={`flex items-start gap-2 text-sm text-ink-2 ${className}`}>
      <ServerOff className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} />
      <span>{text}</span>
    </p>
  );
}

function InfoTip({ info }: { info: Metric['info'] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={ref} className="absolute right-3 top-3" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label="Что означает показатель"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-white transition-colors hover:bg-ink-2"
      >
        ?
      </button>
      {open && (
        <div role="tooltip" className="absolute right-0 top-7 z-30 w-72 rounded-2xl bg-white p-4 text-[13px] leading-snug shadow-[0_12px_40px_rgb(0_0_0/0.14)] ring-1 ring-line">
          <p className="text-ink">{info.what}</p>
          <p className="mt-3 font-medium text-ink">Как считается</p>
          <p className="text-muted">{info.how}</p>
          <p className="mt-3 font-medium text-ink">Как читать</p>
          <p className="text-muted">{info.read}</p>
        </div>
      )}
    </div>
  );
}

/* Пустой каркас графа концептов: та же раскладка, что в дизайне, без данных */
function GraphSkeleton() {
  const node = 'absolute h-11 rounded-xl bg-panel-3/80';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 340" preserveAspectRatio="none" fill="none" stroke="#d4d4d4" strokeWidth="1.2">
        <path d="M95 75 V230" />
        <path d="M140 250 H370" />
        <path d="M420 85 V125 Q420 135 430 135 H660 Q670 135 670 125 V85" />
        <path d="M545 135 V160" />
        <path d="M545 205 V250 H400" />
      </svg>
      <div className={`${node} left-[5%] top-[16%] w-[13%]`} />
      <div className={`${node} left-[5%] top-[66%] w-[14%]`} />
      <div className={`${node} left-[53%] top-[12%] w-[13%]`} />
      <div className={`${node} left-[85%] top-[12%] w-[10%]`} />
      <div className={`${node} left-[69%] top-[46%] w-[13%]`} />
      <div className={`${node} left-[46%] top-[76%] w-[13%]`} />
    </div>
  );
}

export default function Stats() {
  return (
    <Layout
      title="База знаний"
      actions={
        <Link to="/account/knowledge" className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover">
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          <span className="hidden sm:inline">Создать своё ядро</span>
        </Link>
      }
    >
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-[1136px]">
          {/* Заголовок и вопрос ИИ-инженеру */}
          <section className="pb-12 pt-6 text-center sm:pt-10">
            <h1 className="text-[28px] font-medium leading-tight tracking-tight text-ink sm:text-[40px]">Инженерия, основанная на знаниях</h1>
            <p className="mt-2 text-[15px] text-muted sm:text-lg">Связанное ядро законов, материалов и инженерных знаний</p>

            <KnowledgeChat />
          </section>

          {/* Показатели */}
          <section>
            <h2 className="mb-3 text-lg font-medium tracking-tight text-ink sm:text-xl">Зрелость платформы</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {metrics.map(({ icon: Icon, label, value, sub, info }) => (
                <div key={label} className="relative rounded-2xl bg-panel p-4">
                  <InfoTip info={info} />
                  <div className="flex min-h-10 items-center gap-2 pr-6 text-[13px] text-ink sm:gap-2.5 sm:text-sm">
                    <Icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" strokeWidth={1.7} />
                    <span className="min-w-0 leading-tight">{label}</span>
                  </div>
                  <p className="mt-4 text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]">{fmt(value)}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted">{sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Знания по дисциплинам */}
          <section className="mt-12">
            <h2 className="mb-3 text-lg font-medium tracking-tight text-ink sm:text-xl">Знания по дисциплинам</h2>
            <div className="hidden overflow-hidden rounded-2xl bg-panel sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-panel-2 text-left text-xs text-ink-2">
                    <th className="px-4 py-4 font-normal">Коллекция</th>
                    <th className="px-4 py-4 font-normal">Проиндексировано чанков</th>
                    <th className="px-4 py-4 font-normal">С LaTeX</th>
                    <th className="px-4 py-4 font-normal">PDF-источников</th>
                    <th className="w-[30%] px-4 py-4"><span className="sr-only">Доля</span></th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => {
                    const share = Math.round((collection.points / TOTAL_POINTS) * 100);
                    return (
                      <tr key={collection.name} className="border-t border-line first:border-t-0">
                        <td className="px-4 py-4 font-medium text-ink">{collection.name}</td>
                        <td className="px-4 py-4 tabular-nums text-ink">{fmt(collection.points)}</td>
                        <td className="px-4 py-4 tabular-nums text-ink">{fmt(collection.latex)}</td>
                        <td className="px-4 py-4 tabular-nums text-ink">{fmt(collection.pdfs)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                              <div className="h-full rounded-full bg-accent" style={{ width: `${share}%` }} />
                            </div>
                            <span className="w-9 text-right tabular-nums text-ink">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-line overflow-hidden rounded-2xl bg-panel sm:hidden">
              {collections.map((collection) => {
                const share = Math.round((collection.points / TOTAL_POINTS) * 100);
                return (
                  <div key={collection.name} className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-ink">{collection.name}</span>
                      <span className="text-sm tabular-nums text-ink">{share}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${share}%` }} /></div>
                    <dl className="grid grid-cols-3 gap-2 text-xs">
                      <div><dt className="text-muted">Чанков</dt><dd className="tabular-nums text-ink">{fmt(collection.points)}</dd></div>
                      <div><dt className="text-muted">С LaTeX</dt><dd className="tabular-nums text-ink">{fmt(collection.latex)}</dd></div>
                      <div><dt className="text-muted">PDF</dt><dd className="tabular-nums text-ink">{fmt(collection.pdfs)}</dd></div>
                    </dl>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Граф концептов */}
          <section className="mt-12">
            <div className="mb-3 flex flex-wrap items-center gap-3 sm:gap-4">
              <h2 className="text-lg font-medium tracking-tight text-ink sm:text-xl">Выберите концепт, чтобы изучить его роль</h2>
              <button type="button" disabled title="Backend API графа знаний пока нет" className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-muted ring-1 ring-line">
                <Brain className="h-4 w-4" strokeWidth={1.7} />
                Изделие не выбрано
                <ChevronDown className="ml-4 h-4 w-4" strokeWidth={1.7} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_365px]">
              <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-panel sm:min-h-[380px]">
                <GraphSkeleton />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="max-w-sm rounded-2xl bg-white/90 p-4 text-center shadow-sm ring-1 ring-line backdrop-blur-sm">
                    <p className="font-medium text-ink">Граф знаний недоступен</p>
                    <NoBackend className="mt-1 justify-center text-left" text="Backend API графа концептов пока нет. Связи между законами, материалами и расчётами появятся здесь." />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-line-strong" />Инженерные знания</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Выбранные связи</span>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex-1 rounded-2xl bg-panel p-4">
                  <p className="text-2xl font-semibold tracking-tight text-subtle">Концепт</p>
                  <p className="mt-1 text-sm text-muted">Роль в расчёте</p>
                  <NoBackend className="mt-4" text="Нет данных: backend API графа концептов пока нет." />
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="text-sm text-muted">Используется для</p>
                    <p className="mt-1 text-sm text-subtle">—</p>
                  </div>
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="text-sm text-muted">Связанные концепты</p>
                    <div className="mt-2 flex gap-2">
                      {[0, 1, 2].map((item) => <span key={item} className="h-8 w-20 rounded-lg bg-panel-3/80" />)}
                    </div>
                  </div>
                </div>
                <Link to="/account/knowledge" className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-accent-hover">
                  <Plus className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  Создать своё ядро
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
