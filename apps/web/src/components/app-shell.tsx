"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutDashboard, MessageSquareMore, BarChart3, Settings, Activity } from "lucide-react";
import { useEffect, useState } from "react";

import { NotificationProvider, useNotifications } from "../context/notification-context";
import { ToastContainer } from "./toast-container";

const navItems = [
  { label: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { label: "Notifications", href: "/notifications",  icon: Bell },
  { label: "Event Log",     href: "/event-log",      icon: MessageSquareMore },
  { label: "Analytics",     href: "/analytics",      icon: BarChart3 },
  { label: "Settings",      href: "/settings",       icon: Settings },
] as const;

/* ── Sidebar ─────────────────────────────────────────────────── */
function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        background: "#0f0f13",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        minHeight: "100vh",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 8px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(124,58,237,0.5)",
            flexShrink: 0,
          }}
        >
          <Bell size={16} color="#fff" />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#ffffff", letterSpacing: "-0.01em" }}>
            NotifyHub
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "#6b7280", letterSpacing: "0.04em" }}>
            Real-time demo
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.15s",
                background: active ? "rgba(124,58,237,0.18)" : "transparent",
                color: active ? "#a78bfa" : "#71717a",
                borderLeft: active ? "2px solid #7c3aed" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={15} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom info card */}
      <div
        style={{
          marginTop: "20px",
          borderRadius: "12px",
          background: "rgba(124,58,237,0.12)",
          border: "1px solid rgba(124,58,237,0.25)",
          padding: "14px",
        }}
      >
        <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#7c3aed", marginBottom: "6px" }}>
          Live Feed
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "#a1a1aa", lineHeight: 1.5 }}>
          Events flow through BullMQ and push instantly via Socket.io.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "10px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#a78bfa",
            textDecoration: "none",
          }}
        >
          ← Back to intro
        </Link>
      </div>
    </aside>
  );
}

/* ── Top Bar ─────────────────────────────────────────────────── */
function TopBar() {
  const { notifications, connectionState } = useNotifications();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // Use 0 until mounted so SSR and client HTML match (fixes hydration mismatch)
  const notifCount = mounted ? notifications.length : 0;

  const dotColor =
    connectionState === "connected"    ? "#10b981" :
    connectionState === "connecting"   ? "#f59e0b" : "#f43f5e";

  const label =
    connectionState === "connected"    ? "Connected" :
    connectionState === "connecting"   ? "Connecting…" : "Disconnected";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 28px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              boxShadow: "0 0 16px rgba(124,58,237,0.2)",
            }}
          >
            🔔
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
              NotifyHub
            </h1>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--color-text-muted)", fontWeight: 500 }}>
              Live System
            </p>
          </div>
        </Link>

        {/* Header Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "10px" }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: "13px",
              fontWeight: pathname === "/dashboard" ? 700 : 500,
              color: pathname === "/dashboard" ? "#7c3aed" : "var(--color-text-muted)",
              textDecoration: "none",
              padding: "4px 8px",
              borderRadius: "6px",
              background: pathname === "/dashboard" ? "rgba(124,58,237,0.08)" : "transparent",
              transition: "all 0.15s",
            }}
          >
            Dashboard
          </Link>
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Connection badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: connectionState === "connected" ? "#d1fae5" : connectionState === "connecting" ? "#fef3c7" : "#ffe4e6",
            borderRadius: "999px",
            padding: "5px 12px",
            border: `1px solid ${dotColor}30`,
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: dotColor,
              boxShadow: connectionState === "connected" ? `0 0 6px ${dotColor}` : "none",
            }}
            className={connectionState === "connected" ? "animate-pulse-glow" : ""}
          />
          <span style={{ fontSize: "12px", fontWeight: 600, color: dotColor.replace("10b981", "065f46").replace("f59e0b", "92400e").replace("f43f5e", "9f1239") }}>
            {label}
          </span>
        </div>

        {/* Bell with badge */}
        <button
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text)",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
          }}
        >
          <Bell size={16} />
          {notifCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-3px",
                right: "-3px",
                minWidth: "18px",
                height: "18px",
                borderRadius: "999px",
                background: "#e11d48",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "2px solid #fff",
              }}
            >
              {Math.min(9, notifCount)}{notifCount >= 9 ? "+" : ""}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          A
        </div>

        {/* System status indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            color: "#6b7280",
          }}
        >
          <Activity size={12} />
          <span className="font-mono">{notifCount} events</span>
        </div>
      </div>
    </header>
  );
}

/* ── App Shell ───────────────────────────────────────────────── */
function ShellInner({ children }: { children: React.ReactNode }) {
  const { toasts, dismissToast } = useNotifications();

  return (
    <>
      <main style={{ minHeight: "100vh", width: "100%", background: "var(--color-bg)", color: "var(--color-text)" }}>
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            background: "var(--color-bg)",
          }}
        >
          <TopBar />
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {children}
          </div>
        </section>
      </main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <ShellInner>{children}</ShellInner>
    </NotificationProvider>
  );
}
