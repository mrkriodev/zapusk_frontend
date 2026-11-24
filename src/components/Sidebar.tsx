import type { ReactNode } from "react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Atom, Brain, ChevronUp, PanelLeft, Plus, UserRound, X } from "lucide-react";
import logoMark from "../assets/logo-mark.png";

type SidebarProps = {
  onNewChat?: () => void;
  chatsSection?: ReactNode;
  onCollapse?: () => void;
  onClose?: () => void;
  onNavigate?: () => void;
};

const navItems = [
  { path: "/", label: "Лаборатория", icon: Atom },
  { path: "/statistics", label: "База знаний", icon: Brain },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[14px] transition-colors ${
    isActive ? "bg-sidebar-active font-medium text-ink" : "text-ink-2 hover:bg-panel-3"
  }`;

export function SectionTitle({ children, open, onToggle }: { children: ReactNode; open?: boolean; onToggle?: () => void }) {
  if (!onToggle) return <p className="px-2.5 pb-1.5 pt-1 text-[13px] text-muted">{children}</p>;
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between px-2.5 pb-1.5 pt-1 text-[13px] text-muted hover:text-ink-2">
      {children}
      <ChevronUp className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`} />
    </button>
  );
}

export default function Sidebar({ onNewChat, chatsSection, onCollapse, onClose, onNavigate }: SidebarProps) {
  const [chatsOpen, setChatsOpen] = useState(true);

  return (
    <div className="flex h-full w-full flex-col bg-sidebar">
      <div className="flex items-center justify-between px-3 pb-4 pt-3">
        <Link to="/" onClick={onNavigate} aria-label="ZAPUSK — на главную" className="flex items-center gap-2.5">
          <img src={logoMark} alt="" className="h-9 w-9 rounded-full" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">Zapusk</span>
        </Link>
        <div className="flex items-center gap-1 text-ink-2">
          {onCollapse && (
            <button type="button" onClick={onCollapse} aria-label="Свернуть панель" className="rounded-lg p-1.5 hover:bg-panel-3">
              <PanelLeft className="h-5 w-5" strokeWidth={1.6} />
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Закрыть панель" className="rounded-lg p-1.5 hover:bg-panel-3">
              <X className="h-5 w-5" strokeWidth={1.6} />
            </button>
          )}
        </div>
      </div>

      <nav className="space-y-0.5 px-2">
        <SectionTitle>Создание</SectionTitle>
        {onNewChat && (
          <button type="button" onClick={onNewChat} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[14px] text-ink-2 transition-colors hover:bg-panel-3">
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.6} />
            Новый чат
          </button>
        )}
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} end onClick={onNavigate} className={navClass}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-5 flex min-h-0 flex-1 flex-col px-2">
        {chatsSection && (
          <>
            <SectionTitle open={chatsOpen} onToggle={() => setChatsOpen((value) => !value)}>Недавние проекты</SectionTitle>
            {chatsOpen && <div className="thin-scroll fade-bottom min-h-0 flex-1 overflow-y-auto pb-6">{chatsSection}</div>}
          </>
        )}
      </div>

      <div className="px-2 pb-3 pt-2">
        <NavLink to="/profile" onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${isActive ? "bg-sidebar-active" : "hover:bg-panel-3"}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <UserRound className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium text-ink">Профиль</span>
            <span className="block truncate text-xs text-muted">Модели и аккаунт</span>
          </span>
        </NavLink>
      </div>
    </div>
  );
}
