"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Reels", href: "/reels", icon: Video },
  { label: "Lịch trình", href: "/schedule", icon: CalendarDays },
  { label: "Bài viết", href: "/posts", icon: FileText },
  { label: "Tổng quan", href: "/", icon: LayoutDashboard },
];

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const SIDEBAR_COLLAPSED_EVENT = "sidebar-collapsed-change";

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange);
  };
}

function getSidebarCollapsedSnapshot() {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

function getServerSidebarCollapsedSnapshot() {
  return false;
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getServerSidebarCollapsedSnapshot
  );

  function toggle() {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(!collapsed));
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT));
  }

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-4 gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          <FileText size={20} className="fill-primary/20" />
        </div>
        {!collapsed && (
          <span className="flex-1 text-sm font-bold tracking-tight text-foreground truncate">
            MKT <span className="text-primary">TOOLS</span>
          </span>
        )}
      </div>

      <div className="absolute -right-3 top-20 z-20">
        <button
          onClick={toggle}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-sm text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 h-5 w-1 rounded-r-full bg-primary" />
              )}
              <Icon 
                size={20} 
                className={cn(
                  "shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} 
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <form action={logout}>
          <button
            type="submit"
            title={collapsed ? "Đăng xuất" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200",
              collapsed && "justify-center"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
