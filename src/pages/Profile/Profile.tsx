import { UserRound } from "lucide-react";
import Layout from "../../components/Layout";
import ModelItem from "./components/ModelItem";

const mockModels = [
  { id: 1, name: 'Шестеренка 50мм', date: '2026-04-20', size: '2.4 MB' },
  { id: 2, name: 'Крепежный кронштейн', date: '2026-04-18', size: '1.8 MB' },
  { id: 3, name: 'Корпус датчика', date: '2026-04-15', size: '3.2 MB' },
  { id: 4, name: 'Колесо робота', date: '2026-04-12', size: '4.1 MB' },
  { id: 5, name: 'Держатель кабеля', date: '2026-04-10', size: '1.2 MB' }
];

export default function Profile(){
    return(
    <Layout title="Профиль">
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-8 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <section className="flex items-center gap-4 rounded-2xl bg-panel p-4 ring-1 ring-line/70 sm:gap-5 sm:p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-white sm:h-16 sm:w-16">
              <UserRound className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-medium tracking-tight text-ink sm:text-2xl">Username</h1>
              <p className="truncate text-sm text-muted">email@gmail.com</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-medium tracking-tight text-ink sm:text-[32px]">{mockModels.length}</div>
              <div className="text-xs text-muted sm:text-sm">Созданных объектов</div>
            </div>
          </section>

          <h2 className="mb-4 mt-8 text-lg font-medium tracking-tight text-ink sm:text-xl">
            Ваши объекты
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockModels.map((model) => (
              <ModelItem key={model.id} model={model} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
    )
}
