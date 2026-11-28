import { useEffect, useState } from "react";
import { t } from "../../i18n/i18n";
import { useGetMyIdeasQuery } from "../../api/repository/IdeasApi";
import { ideasUi, useIdeasUi } from "./ideasUi";

const PENDING = new Set(["submitted", "in_review"]);
const IGNITE_MS = 1400;

/** Значок «Лампочка» (ТЗ 12.7): контурный — не горит; жёлтый с лучами — идея отправлена. */
function LampIcon({ lit, ignite }: { lit: boolean; ignite: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={`h-6 w-6 ${ignite ? "lamp-ignite" : ""}`} aria-hidden="true">
      {lit && (
        <>
          <defs>
            <radialGradient id="lamp-glow" cx="50%" cy="42%" r="50%">
              <stop offset="0" stopColor="#FFE27A" stopOpacity=".9" />
              <stop offset="1" stopColor="#FFC83D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="lamp-glow" cx="24" cy="19" r="19" fill="url(#lamp-glow)" />
          <path className="lamp-rays" d="M24 1.5v3M8.5 6.5l2.2 2.2M39.5 6.5l-2.2 2.2M3 19h3M42 19h3" stroke="#F2A900" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      <path
        className="lamp-bulb"
        d="M24 8a11 11 0 0 0-6.6 19.8c1.3 1 2.1 2.4 2.1 4V34h9v-2.2c0-1.6.8-3 2.1-4A11 11 0 0 0 24 8z"
        fill={lit ? "#FFC83D" : "none"}
        stroke={lit ? "#C98A00" : "currentColor"}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {lit && <path d="M21 21l3 4 3-4" fill="none" stroke="#FFF6D6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
      <path d="M19.5 38h9M21 42h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function LampButton({ ignitedAt, lastNumber }: { ignitedAt: number | null; lastNumber: string | null }) {
  // Анимация только в момент подтверждения, не при каждом переходе между страницами
  const [ignite] = useState(() => ignitedAt != null && Date.now() - ignitedAt < IGNITE_MS);
  const { data } = useGetMyIdeasQuery();
  const hasPending = (data?.items ?? []).some((idea) => PENDING.has(idea.status));
  const lit = ignitedAt != null || hasPending;

  useEffect(() => {
    if (!lastNumber) return;
    const timer = setTimeout(() => ideasUi.dismissToast(), 5000);
    return () => clearTimeout(timer);
  }, [lastNumber]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={ideasUi.open}
        aria-label={lit ? t("Идеи и предложения: идея отправлена") : t("Идеи и предложения")}
        title={t("Предложить идею")}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-panel-2 ${lit ? "" : "text-ink-2"}`}
      >
        <LampIcon lit={lit} ignite={ignite} />
      </button>
      {lastNumber && (
        <div role="status" className="absolute right-0 top-11 z-30 w-max max-w-64 rounded-xl bg-ink px-3 py-2 text-sm text-white shadow-lg">
          {t("Идея отправлена. Спасибо")}
          <span className="ml-1 text-white/70">· №{lastNumber}</span>
        </div>
      )}
    </div>
  );
}

export default function IdeaLamp() {
  const { ignitedAt, lastNumber } = useIdeasUi();
  return <LampButton key={ignitedAt ?? 0} ignitedAt={ignitedAt} lastNumber={lastNumber} />;
}
