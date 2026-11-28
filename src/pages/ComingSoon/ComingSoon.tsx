import type { LucideIcon } from "lucide-react";
import { ServerOff } from "lucide-react";
import Layout from "../../components/Layout";

export type ComingSoonProps = {
  /** Заголовок в шапке страницы */
  title: string;
  icon: LucideIcon;
  heading: string;
  subtitle: string;
  /** Что появится в разделе после подключения API */
  features: { title: string; text: string }[];
};

export default function ComingSoon({ title, icon: Icon, heading, subtitle, features }: ComingSoonProps) {
  return (
    <Layout title={title}>
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="pb-8 pt-6 text-center sm:pt-10">
            <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 text-ink">
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <h1 className="text-[28px] font-medium leading-tight tracking-tight text-ink sm:text-[44px]">{heading}</h1>
            <p className="mx-auto mt-2 max-w-xl text-[15px] text-muted sm:text-lg">{subtitle}</p>
          </div>

          <div role="status" className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl bg-accent-soft p-4 text-sm text-ink ring-1 ring-accent/20">
            <ServerOff className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.7} />
            <div>
              <p className="font-medium">Backend API для этого раздела пока нет</p>
              <p className="mt-1 text-ink-2">
                Интерфейс подготовлен по дизайну. Данные и действия появятся, когда сервер начнёт их поддерживать.
              </p>
            </div>
          </div>

          <h2 className="mb-3 mt-10 text-lg font-medium tracking-tight text-ink sm:text-xl">Что здесь будет</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.title} className="rounded-2xl bg-panel p-4 ring-1 ring-line/70">
                <p className="text-[15px] font-medium text-ink">{feature.title}</p>
                <p className="mt-1 text-sm leading-snug text-muted">{feature.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </Layout>
  );
}
