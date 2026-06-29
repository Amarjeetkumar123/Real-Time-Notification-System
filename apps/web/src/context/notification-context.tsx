"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

import type { NotificationRecord } from "@realtime/shared";
import type { Toast } from "../components/toast-container";

// ─── Constants ────────────────────────────────────────────────────────────────
const socketPath  = "/socket.io";
const apiBaseUrl  = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Types ────────────────────────────────────────────────────────────────────
type TerminalLog = {
  timestamp: string;
  message: string;
  type: "info" | "error" | "success" | "warn";
};

type NotificationContextValue = {
  notifications: NotificationRecord[];
  connectionState: "connecting" | "connected" | "disconnected";
  lastUpdatedAt: string | null;
  pendingTrigger: string | null;
  toasts: Toast[];
  terminalLogs: TerminalLog[];
  clearNotifications: () => Promise<void>;
  pushNotification: (notification: NotificationRecord) => void;
  triggerDemo: (endpoint: string, payload: Record<string, unknown>, label?: string) => Promise<void>;
  dismissToast: (id: string) => void;
  addTerminalLog: (message: string, type?: TerminalLog["type"]) => void;
  clearTerminalLogs: () => void;
  /** Increments by 1 on every new live notification — used to trigger animations */
  lastEventTick: number;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications]   = useState<NotificationRecord[]>([]);
  const [connectionState, setConnectionState] = useState<NotificationContextValue["connectionState"]>("connecting");
  const [lastUpdatedAt, setLastUpdatedAt]   = useState<string | null>(null);
  const [pendingTrigger, setPendingTrigger] = useState<string | null>(null);
  const [toasts, setToasts]                 = useState<Toast[]>([]);
  const [lastEventTick, setLastEventTick]   = useState(0);
  const [terminalLogs, setTerminalLogs]     = useState<TerminalLog[]>([
    { timestamp: new Date().toLocaleTimeString(), message: "[System] Observing NotifyHub real-time event streams...", type: "info" },
  ]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const addTerminalLog = useCallback((message: string, type: TerminalLog["type"] = "info") => {
    setTerminalLogs((current) =>
      [...current, { timestamp: new Date().toLocaleTimeString(), message, type }].slice(-100)
    );
  }, []);

  const clearTerminalLogs = useCallback(() => {
    setTerminalLogs([{ timestamp: new Date().toLocaleTimeString(), message: "[System] Logs cleared. Listening...", type: "info" }]);
  }, []);

  const applyNotification = useCallback((notification: NotificationRecord) => {
    setNotifications((current) => [notification, ...current].slice(0, 100));
    setLastUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  }, []);

  // ── Fetch history from Redis on mount (GET /notifications) ───────────────────
  useEffect(() => {
    async function loadHistory() {
      try {
        addTerminalLog("[API] GET /notifications — loading Redis notification history...", "info");
        const res = await fetch(`${apiBaseUrl}/notifications`);
        if (!res.ok) {
          addTerminalLog(`[API] ${res.status} — could not load history`, "warn");
          return;
        }
        const data = await res.json() as { notifications: NotificationRecord[]; count: number };
        if (data.notifications.length > 0) {
          setNotifications(data.notifications);
          addTerminalLog(`[API] Restored ${data.count} notification(s) from Redis history.`, "success");
        }
      } catch (err) {
        addTerminalLog(`[API] History fetch failed: ${err instanceof Error ? err.message : String(err)}`, "warn");
      }
    }
    loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // ── Socket.IO connection ─────────────────────────────────────────────────────
  useEffect(() => {
    addTerminalLog(`[Socket.io] Connecting to event gateway at ${apiBaseUrl}...`, "info");

    const socket: Socket = io(apiBaseUrl, {
      path: socketPath,
      transports: ["websocket"],
    });

    // Server acknowledged the connection
    socket.on("ready", () => {
      setConnectionState("connected");
      addTerminalLog("[Socket.io] Gateway connection established. WebSocket ready.", "success");
    });

    // ── notification:history — server replays Redis store on (re)connect ───────
    // Merges history into state without duplicating entries already in view.
    socket.on("notification:history", (history: NotificationRecord[]) => {
      if (!history.length) return;
      setNotifications((current) => {
        const existingIds = new Set(current.map((n) => `${n.eventId}-${n.channel}`));
        const fresh = history.filter((n) => !existingIds.has(`${n.eventId}-${n.channel}`));
        if (fresh.length === 0) return current;
        addTerminalLog(`[Socket.io] History replay: ${fresh.length} new notification(s) from Redis.`, "info");
        return [...current, ...fresh].slice(0, 100);
      });
    });

    // ── notification — live event from NotificationJob ────────────────────────
    socket.on("notification", (notification: NotificationRecord) => {
      applyNotification(notification);
      setLastEventTick((t) => t + 1);

      const latency  = Date.now() - new Date(notification.createdAt).getTime();
      const isError  = notification.title.toLowerCase().includes("fail") || notification.title.toLowerCase().includes("error");
      const isWarn   = notification.title.toLowerCase().includes("warn") || notification.title.toLowerCase().includes("retry");
      const logType  = isError ? "error" : isWarn ? "warn" : "success";

      addTerminalLog(
        `[Socket.io] Broadcast: ${notification.title} on channel ${notification.channel.toUpperCase()} (latency: ${latency}ms)`,
        logType as TerminalLog["type"],
      );

      // Show a toast (capped at 5 visible at once)
      setToasts((prev) =>
        [...prev, {
          id:        `${notification.eventId}-${notification.channel}-${Date.now()}`,
          title:     notification.title,
          message:   notification.message,
          channel:   notification.channel,
          createdAt: Date.now(),
        }].slice(-5)
      );
    });

    // ── notifications:cleared — server confirms Redis wipe ────────────────────
    socket.on("notifications:cleared", () => {
      setNotifications([]);
      setToasts([]);
      addTerminalLog("[Socket.io] notifications:cleared — all data wiped from Redis & client state.", "warn");
    });

    socket.on("disconnect", () => {
      setConnectionState("disconnected");
      addTerminalLog("[Socket.io] Connection lost. Attempting to reconnect...", "error");
    });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once

  // ── Actions ──────────────────────────────────────────────────────────────────

  const pushNotification = useCallback((notification: NotificationRecord) => {
    applyNotification(notification);
  }, [applyNotification]);

  const clearNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/notifications`, { method: "DELETE" });
      if (res.ok) {
        // Local state is cleared via the `notifications:cleared` socket event
        // broadcast by the server, so we don't need to update it manually here.
        addTerminalLog("[Dashboard] DELETE /notifications — Redis store cleared.", "warn");
      } else {
        // Fallback: clear locally if the DELETE fails
        setNotifications([]);
        setToasts([]);
        addTerminalLog("[Dashboard] Notification cache cleared (local only — API unavailable).", "warn");
      }
    } catch {
      // Offline fallback
      setNotifications([]);
      setToasts([]);
      addTerminalLog("[Dashboard] Notification cache cleared (local only — network error).", "warn");
    }
  }, [addTerminalLog]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerDemo = useCallback(async (endpoint: string, payload: Record<string, unknown>, label = "event") => {
    setPendingTrigger(label);
    addTerminalLog(`[API] POST ${endpoint} — payload: ${JSON.stringify(payload)}`, "info");
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (response.ok) {
        addTerminalLog(`[API] 201 Created: Event enqueued to BullMQ → Redis.`, "success");
      } else {
        const text = await response.text();
        addTerminalLog(`[API] ${response.status} Error: ${text || "Request rejected by validation rules"}`, "error");
      }
    } catch (err) {
      addTerminalLog(`[API] Network failure: ${err instanceof Error ? err.message : String(err)}`, "error");
    } finally {
      setTimeout(() => setPendingTrigger(null), 600);
    }
  }, [addTerminalLog]);

  // ── Context value ─────────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      notifications,
      connectionState,
      lastUpdatedAt,
      pendingTrigger,
      toasts,
      terminalLogs,
      lastEventTick,
      clearNotifications,
      pushNotification,
      triggerDemo,
      dismissToast,
      addTerminalLog,
      clearTerminalLogs,
    }),
    [connectionState, lastUpdatedAt, notifications, pendingTrigger, toasts, terminalLogs, lastEventTick, clearNotifications, pushNotification, triggerDemo, dismissToast, addTerminalLog, clearTerminalLogs],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
}
