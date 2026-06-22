"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, MoreHorizontal, UserCircle2 } from "lucide-react";

import { NotificationProvider, useNotifications } from "../context/notification-context";
import { navigationItems } from "../lib/navigation";

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col border-r border-slate-200 bg-[#fcfaf4] px-5 py-4">
      <div className="flex items-center gap-2.5 px-1 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <Bell className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">NotifyHub</span>
      </div>

      <nav className="mt-6 space-y-1.5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-[#f2ecdf] text-slate-900" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 shadow-sm">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-400">
          <span>Live feed</span>
          <span>Real-time</span>
        </div>
        <p className="mt-3 text-sm text-slate-700">Messages move through BullMQ and appear here instantly.</p>
      </div>
    </aside>
  );
}

function TopBar() {
  const { notifications, connectionState } = useNotifications();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sm:px-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">NotifyHub</h1>
        <p className="mt-1 text-sm text-slate-500">A friendly real-time notification workspace</p>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
            {Math.min(9, notifications.length)}
          </span>
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 shadow-sm">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
          <MoreHorizontal className="h-4.5 w-4.5" />
        </button>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
          {connectionState}
        </span>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <main className="min-h-screen w-full bg-[#f4f0e8] text-slate-900">
        <section className="grid min-h-screen w-full overflow-hidden bg-[#fffdfa] lg:grid-cols-[210px_1fr]">
          <Sidebar />
          <div className="flex min-h-0 flex-col">
            <TopBar />
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">{children}</div>
          </div>
        </section>
      </main>
    </NotificationProvider>
  );
}
