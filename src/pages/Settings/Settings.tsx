import { Check, Languages, ServerOff } from "lucide-react";
import Layout from "../../components/Layout";
import { getLang, LANGS, setLang, t } from "../../i18n/i18n";

export default function Settings() {
  const lang = getLang();
  return (
    <Layout title={t("Настройки")}>
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-2xl pt-6 sm:pt-10">
          <h1 className="text-[28px] font-medium leading-tight tracking-tight text-ink sm:text-[36px]">{t("Настройки")}</h1>

          <section className="mt-6 rounded-2xl bg-panel p-5 ring-1 ring-line/70">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-accent" strokeWidth={1.7} />
              <h2 className="text-lg font-medium tracking-tight text-ink">{t("Язык интерфейса")}</h2>
            </div>
            <p className="mt-1 text-sm text-muted">{t("Выберите язык, на котором показывается интерфейс платформы.")}</p>

            <div role="radiogroup" aria-label={t("Язык интерфейса")} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {LANGS.map((item) => {
                const active = item.code === lang;
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    lang={item.code}
                    onClick={() => setLang(item.code)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] transition-colors ${
                      active ? "bg-accent-soft text-ink ring-1 ring-accent/40" : "bg-panel-2 text-ink-2 hover:text-ink"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && <Check className="h-4 w-4 text-accent" strokeWidth={2} />}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted">{t("Ответы ИИ-инженера и база знаний остаются на языке, который возвращает сервер.")}</p>
          </section>

          <section className="mt-4 flex items-start gap-3 rounded-2xl bg-panel p-5 ring-1 ring-line/70">
            <ServerOff className="mt-0.5 h-5 w-5 shrink-0 text-muted" strokeWidth={1.7} />
            <div>
              <p className="text-[15px] font-medium text-ink">{t("Аккаунт, данные и оформление")}</p>
              <p className="mt-1 text-sm text-muted">{t("Почта, смена пароля, экспорт данных и тёмная тема появятся, когда сервер начнёт их поддерживать.")}</p>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
