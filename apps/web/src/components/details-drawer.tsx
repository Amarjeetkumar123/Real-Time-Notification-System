"use client";

import { X, Play, Clock, CheckCircle2, ChevronRight, Activity, Terminal } from "lucide-react";
import type { NotificationRecord } from "@realtime/shared";

type DetailsDrawerProps = {
  notification: NotificationRecord | null;
  onClose: () => void;
};

export function DetailsDrawer({ notification, onClose }: DetailsDrawerProps) {
  if (!notification) return null;

  // derive mock latency breakdowns for technical fidelity
  const createdDate = new Date(notification.createdAt);
  const apiDuration = 8; // ms validation
  const queueDuration = Math.round(Math.random() * 25) + 12; // ms queuing latency
  const workerDuration = Math.round(Math.random() * 15) + 8; // ms processing
  const socketDuration = Math.round(Math.random() * 8) + 4; // ms ws delivery
  const totalDuration = apiDuration + queueDuration + workerDuration + socketDuration;

  // Parse simulated headers
  const mockHeaders = {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0 (Vercel Browser Edge)",
    "x-real-ip": "192.168.1.100",
    "x-requested-with": "XMLHttpRequest",
    "x-bullmq-job-id": notification.eventId.slice(0, 8),
  };

  const steps = [
    { name: "Client Action Triggered", desc: "POST request fired to API Gateway", time: `+0ms` },
    { name: "Zod Payload Validated", desc: "Inputs matched schema rules", time: `+${apiDuration}ms` },
    { name: "BullMQ Job Enqueued", desc: "Added to notification-events queue in Redis", time: `+${apiDuration + queueDuration}ms` },
    { name: "Worker Thread Processed", desc: `Job parsed & channels resolved`, time: `+${apiDuration + queueDuration + workerDuration}ms` },
    { name: "Socket.io Broadcasted", desc: `Emitted to websocket namespace`, time: `+${totalDuration}ms` },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(480px, 100vw)",
        background: "var(--color-surface)",
        borderLeft: "1px solid var(--color-border)",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.06)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        color: "var(--color-text)",
        animation: "slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity size={16} style={{ color: "var(--color-violet)" }} />
          <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em" }}>Event Inspector</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-border)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {/* Core Metadata */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                background: "var(--color-violet-light)",
                color: "var(--color-violet)",
                padding: "2px 8px",
                borderRadius: "4px",
                fontFamily: "JetBrains Mono",
              }}
            >
              {notification.channel}
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "JetBrains Mono" }}>
              ID: {notification.eventId.slice(0, 8)}...
            </span>
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            {notification.title}
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            {notification.message}
          </p>
        </div>

        {/* Latency Breakdown */}
        <div style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
            <Clock size={13} style={{ color: "var(--color-emerald)" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>Latency Metrics</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <span style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)" }}>Zod Validation</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: "13px", fontWeight: 700 }}>{apiDuration}ms</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)" }}>BullMQ Enqueue</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: "13px", fontWeight: 700 }}>{queueDuration}ms</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)" }}>Worker Exec</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: "13px", fontWeight: 700 }}>{workerDuration}ms</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)" }}>Websocket Push</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: "13px", fontWeight: 700 }}>{socketDuration}ms</span>
            </div>
          </div>
        </div>

        {/* Event Progress Timeline */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
            <Play size={13} style={{ color: "var(--color-violet)" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>Hop Journey Timeline</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {steps.map((st, idx) => (
              <div key={idx} style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <CheckCircle2 size={15} style={{ color: "var(--color-emerald)", fill: "var(--color-emerald-light)" }} />
                  {idx < steps.length - 1 && (
                    <div style={{ width: "1.5px", flex: 1, background: "var(--color-border)", minHeight: "16px", marginTop: "4px" }} />
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>{st.name}</span>
                    <span style={{ fontSize: "10px", color: "var(--color-emerald)", fontFamily: "JetBrains Mono" }}>{st.time}</span>
                  </div>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)" }}>{st.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HTTP Headers */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <ChevronRight size={13} style={{ color: "var(--color-violet)" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>API Request Headers</span>
          </div>
          <div style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "10px 14px", fontFamily: "JetBrains Mono", fontSize: "11px", color: "var(--color-violet)" }}>
            {Object.entries(mockHeaders).map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: "8px", margin: "4px 0" }}>
                <span style={{ color: "var(--color-text-muted)" }}>{k}:</span>
                <span style={{ color: "var(--color-text)" }}>"{v}"</span>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Payload JSON */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <Terminal size={13} style={{ color: "var(--color-violet)" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>Raw Payload JSON</span>
          </div>
          <pre
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "14px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: "var(--color-emerald)",
              overflowX: "auto",
              margin: 0,
            }}
          >
            {JSON.stringify(
              {
                id: notification.eventId,
                timestamp: notification.createdAt,
                channel: notification.channel,
                payload: {
                  customerName: notification.message.split(" for ")[1] || "John Doe",
                  channel: notification.channel,
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
