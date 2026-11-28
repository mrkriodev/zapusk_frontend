import type { ReactNode } from "react";
import { useState } from "react";
import { PanelLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import { t } from "../i18n/i18n";

type LayoutProps = {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  onNewChat?: () => void;
  chatsSection?: ReactNode;
  /** Управляемое состояние мобильной панели (необязательно) */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

export default function Layout({ title, actions, children, onNewChat, chatsSection, mobileOpen, onMobileOpenChange }: LayoutProps) {
  const [innerOpen, setInnerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isMobileOpen = mobileOpen ?? innerOpen;
  const setMobileOpen = (open: boolean) => (onMobileOpenChange ?? setInnerOpen)(open);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-surface text-ink">
      {!collapsed && (
        <aside className="hidden w-60 shrink-0 border-r border-line/60 lg:block">
          <Sidebar onNewChat={onNewChat} chatsSection={chatsSection} onCollapse={() => setCollapsed(true)} />
        </aside>
      )}

      {isMobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[78%] max-w-72 shadow-2xl transition-transform duration-300 lg:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!isMobileOpen}>
        <Sidebar
          onNewChat={onNewChat ? () => { onNewChat(); } : undefined}
          chatsSection={chatsSection}
          onClose={() => setMobileOpen(false)}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 px-4 lg:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label={t("Открыть панель")} className="rounded-lg p-1.5 text-ink-2 hover:bg-panel-2 lg:hidden">
            <PanelLeft className="h-5 w-5" strokeWidth={1.6} />
          </button>
          {collapsed && (
            <button type="button" onClick={() => setCollapsed(false)} aria-label={t("Развернуть панель")} className="hidden rounded-lg p-1.5 text-ink-2 hover:bg-panel-2 lg:block">
              <PanelLeft className="h-5 w-5" strokeWidth={1.6} />
            </button>
          )}
          <div className="min-w-0 flex-1 truncate text-lg font-medium tracking-tight lg:text-[22px]">{title}</div>
          {actions}
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
