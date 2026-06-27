"use client";

import { useEffect, useRef, useState } from "react";

export type Toast = {
  id: string;
  title: string;
  message: string;
  channel: "socket" | "email" | "sms";
  createdAt: number;
};

const CHANNEL_CONFIG = {
  socket: { label: "Web", color: "#059669", bg: "#d1fae5", icon: "🌐" },
  email:  { label: "Email", color: "#7c3aed", bg: "#ede9fe", icon: "✉️" },
  sms:    { label: "SMS", color: "#e11d48", bg: "#ffe4e6", icon: "📱" },
};

const DURATION = 4200;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const cfg = CHANNEL_CONFIG[toast.channel];

  useEffect(() => {
    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 320);
    }, DURATION);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={leaving ? "animate-toast-out" : "animate-toast-in"}
      style={{
        pointerEvents: "auto",
        marginBottom: "10px",
        borderRadius: "16px",
        background: "#ffffff",
        border: `1.5px solid ${cfg.color}30`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${cfg.color}15`,
        overflow: "hidden",
        width: "320px",
        maxWidth: "90vw",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}80)`,
          animation: `shrink ${DURATION}ms linear forwards`,
          transformOrigin: "left",
        }}
      />
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      <div style={{ padding: "12px 14px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
        {/* Channel icon */}
        <div
          style={{
            flexShrink: 0,
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: cfg.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
        >
          {cfg.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f0f0f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {toast.title}
            </p>
            <span
              style={{
                flexShrink: 0,
                fontSize: "10px",
                fontWeight: 600,
                color: cfg.color,
                background: cfg.bg,
                borderRadius: "999px",
                padding: "1px 7px",
              }}
            >
              {cfg.label}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", lineHeight: 1.4 }}>
            {toast.message}
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => { setLeaving(true); setTimeout(onDismiss, 320); }}
          style={{
            flexShrink: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            fontSize: "16px",
            lineHeight: 1,
            padding: "2px",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column-reverse",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}
