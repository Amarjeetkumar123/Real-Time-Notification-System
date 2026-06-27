"use client";

import { useEffect, useRef, useState } from "react";
import type { NotificationRecord } from "@realtime/shared";

const CHANNEL_CONFIG = {
  socket: { label: "Web",   color: "#10b981", bg: "rgba(16,185,129,0.12)", dot: "#10b981" },
  email:  { label: "Email", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", dot: "#8b5cf6" },
  sms:    { label: "SMS",   color: "#ef4444", bg: "rgba(239,68,68,0.12)", dot: "#ef4444" },
};

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 5000)  return "just now";
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

function NotificationItem({ notification, isNew }: { notification: NotificationRecord; isNew: boolean }) {
  const cfg = CHANNEL_CONFIG[notification.channel] ?? CHANNEL_CONFIG.socket;
  const [timeLabel, setTimeLabel] = useState(() => timeAgo(notification.createdAt));
  const [showNew, setShowNew]     = useState(isNew);

  // Update relative time every 10s
  useEffect(() => {
    const id = setInterval(() => setTimeLabel(timeAgo(notification.createdAt)), 10_000);
    return () => clearInterval(id);
  }, [notification.createdAt]);

  // Hide "NEW" badge after 3s
  useEffect(() => {
    if (!isNew) return;
    setShowNew(true);
    const id = setTimeout(() => setShowNew(false), 3000);
    return () => clearTimeout(id);
  }, [isNew]);

  return (
    <article
      className="animate-slide-in"
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        padding: "14px 16px",
        borderBottom: "1px solid var(--color-border)",
        transition: "background 0.2s",
        background: isNew ? `${cfg.color}09` : "transparent",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isNew ? `${cfg.color}09` : "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
        {/* Colored dot */}
        <span
          style={{
            flexShrink: 0,
            marginTop: "5px",
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            background: cfg.dot,
            boxShadow: isNew ? `0 0 6px ${cfg.dot}` : "none",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
              {notification.title}
            </p>
            {showNew && (
              <span
                className="animate-fade-badge"
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: cfg.color,
                  background: cfg.bg,
                  borderRadius: "999px",
                  padding: "1px 6px",
                  textTransform: "uppercase",
                }}
              >
                NEW
              </span>
            )}
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#9ca3af", lineHeight: 1.4 }}>
            {notification.message}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#6b7280" }}>{timeLabel}</p>
        </div>
      </div>

      {/* Channel pill */}
      <span
        style={{
          flexShrink: 0,
          fontSize: "10px",
          fontWeight: 700,
          color: cfg.color,
          background: cfg.bg,
          borderRadius: "999px",
          padding: "2px 8px",
          border: `1px solid ${cfg.color}25`,
          fontFamily: "JetBrains Mono",
        }}
      >
        {cfg.label}
      </span>
    </article>
  );
}

export function NotificationList({
  notifications,
  maxItems,
}: {
  notifications: NotificationRecord[];
  maxItems?: number;
}) {
  const prevLengthRef = useRef(notifications.length);
  const [newIndices, setNewIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const added = notifications.length - prevLengthRef.current;
    if (added > 0) {
      const indices = new Set(Array.from({ length: added }, (_, i) => i));
      setNewIndices(indices);
      const id = setTimeout(() => setNewIndices(new Set()), 3100);
      prevLengthRef.current = notifications.length;
      return () => clearTimeout(id);
    }
    prevLengthRef.current = notifications.length;
  }, [notifications.length]);

  const displayed = maxItems ? notifications.slice(0, maxItems) : notifications;

  if (displayed.length === 0) {
    return (
      <div
        style={{
          borderRadius: "12px",
          border: "1.5px dashed var(--color-border)",
          background: "var(--color-surface)",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔔</div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "var(--color-text)" }}>
          No events captured yet
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--color-text-muted)", maxWidth: "280px", marginInline: "auto", lineHeight: 1.5 }}>
          Click one of the event simulation buttons to fire a real event and watch it appear here instantly.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        overflow: "hidden",
      }}
    >
      {displayed.map((n, i) => (
        <NotificationItem
          key={`${n.eventId}-${n.channel}`}
          notification={n}
          isNew={newIndices.has(i)}
        />
      ))}
    </div>
  );
}
