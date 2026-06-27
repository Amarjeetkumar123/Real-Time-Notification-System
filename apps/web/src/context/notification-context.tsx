"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

import type { NotificationRecord } from "@realtime/shared";
import type { Toast } from "../components/toast-container";

const storageKey = "notifyhub-notifications";
const socketPath = "/socket.io";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
  clearNotifications: () => void;
  pushNotification: (notification: NotificationRecord) => void;
  triggerDemo: (endpoint: string, payload: Record<string, unknown>, label?: string) => Promise<void>;
  dismissToast: (id: string) => void;
  addTerminalLog: (message: string, type?: TerminalLog["type"]) => void;
  clearTerminalLogs: () => void;
  /** fires true for one render whenever a new notification arrives */
  lastEventTick: number;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as NotificationRecord[];
    } catch {
      return [];
    }
  });
  const [connectionState, setConnectionState] = useState<NotificationContextValue["connectionState"]>("connecting");
  const [lastUpdatedAt, setLastUpdatedAt]     = useState<string | null>(null);
  const [pendingTrigger, setPendingTrigger]   = useState<string | null>(null);
  const [toasts, setToasts]                   = useState<Toast[]>([]);
  const [lastEventTick, setLastEventTick]     = useState(0);
  const [terminalLogs, setTerminalLogs]       = useState<TerminalLog[]>([
    { timestamp: new Date().toLocaleTimeString(), message: "[System] Observing NotifyHub real-time event streams...", type: "info" }
  ]);

  const addTerminalLog = useCallback((message: string, type: TerminalLog["type"] = "info") => {
    setTerminalLogs((current) => [
      ...current,
      { timestamp: new Date().toLocaleTimeString(), message, type }
    ].slice(-100)); // cap logs at last 100 rows
  }, []);

  const clearTerminalLogs = useCallback(() => {
    setTerminalLogs([{ timestamp: new Date().toLocaleTimeString(), message: "[System] Logs cleared. Monospace connection listening...", type: "info" }]);
  }, []);

  useEffect(() => {
    addTerminalLog(`[Socket.io] Connecting to event gateway at ${apiBaseUrl}...`, "info");
    const socket: Socket = io(apiBaseUrl, {
      path: socketPath,
      transports: ["websocket"],
    });

    socket.on("ready", () => {
      setConnectionState("connected");
      addTerminalLog("[Socket.io] Gateway connection established. WebSocket ready.", "success");
    });

    socket.on("notification", (notification: NotificationRecord) => {
      setNotifications((current) => {
        const next = [notification, ...current].slice(0, 20);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
      setLastUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setLastEventTick((t) => t + 1);

      const latency = Date.now() - new Date(notification.createdAt).getTime();
      const isError = notification.title.toLowerCase().includes("fail") || notification.title.toLowerCase().includes("error");
      const isWarn = notification.title.toLowerCase().includes("warn") || notification.title.toLowerCase().includes("retry") || notification.title.toLowerCase().includes("attempt");
      const logType = isError ? "error" : isWarn ? "warn" : "success";

      addTerminalLog(
        `[Socket.io] Broadcast received: ${notification.title} on channel ${notification.channel.toUpperCase()} (Transit latency: ${latency}ms)`,
        logType as any
      );

      // add toast
      setToasts((prev) => [
        ...prev,
        {
          id: `${notification.eventId}-${notification.channel}-${Date.now()}`,
          title: notification.title,
          message: notification.message,
          channel: notification.channel,
          createdAt: Date.now(),
        },
      ].slice(-5)); // max 5 toasts at once
    });

    socket.on("disconnect", () => {
      setConnectionState("disconnected");
      addTerminalLog("[Socket.io] Connection aborted. Retrying connection...", "error");
    });

    return () => { socket.disconnect(); };
  }, [addTerminalLog]);

  const pushNotification = useCallback((notification: NotificationRecord) => {
    setNotifications((current) => {
      const next = [notification, ...current].slice(0, 20);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setLastUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    window.localStorage.removeItem(storageKey);
    addTerminalLog("[Dashboard] Cleaned notification cache storage.", "warn");
  }, [addTerminalLog]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerDemo = useCallback(async (endpoint: string, payload: Record<string, unknown>, label = "event") => {
    setPendingTrigger(label);
    addTerminalLog(`[API] POST ${endpoint} payload: ${JSON.stringify(payload)}`, "info");
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        addTerminalLog(`[API] 201 Created: Event enqueued successfully to BullMQ queue`, "success");
      } else {
        const text = await response.text();
        addTerminalLog(`[API] ${response.status} Error: ${text || "Request rejected by validation rules"}`, "error");
      }
    } catch (err) {
      addTerminalLog(`[API] Network failure: ${err instanceof Error ? err.message : String(err)}`, "error");
    } finally {
      // keep spinner visible for at least 600ms so it's visible
      setTimeout(() => setPendingTrigger(null), 600);
    }
  }, [addTerminalLog]);

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
