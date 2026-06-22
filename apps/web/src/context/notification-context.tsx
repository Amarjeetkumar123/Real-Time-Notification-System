"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

import type { NotificationRecord } from "@realtime/shared";

const storageKey = "notifyhub-notifications";
const socketPath = "/socket.io";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type NotificationContextValue = {
  notifications: NotificationRecord[];
  connectionState: "connecting" | "connected" | "disconnected";
  lastUpdatedAt: string | null;
  clearNotifications: () => void;
  pushNotification: (notification: NotificationRecord) => void;
  triggerDemo: (endpoint: string, payload: Record<string, unknown>) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      return JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as NotificationRecord[];
    } catch {
      return [];
    }
  });
  const [connectionState, setConnectionState] = useState<NotificationContextValue["connectionState"]>("connecting");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const socket: Socket = io(apiBaseUrl, {
      path: socketPath,
      transports: ["websocket"],
    });

    socket.on("ready", () => setConnectionState("connected"));
    socket.on("notification", (notification: NotificationRecord) => {
      setNotifications((current) => {
        const next = [notification, ...current].slice(0, 20);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
      setLastUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    });
    socket.on("disconnect", () => setConnectionState("disconnected"));

    return () => {
      socket.disconnect();
    };
  }, []);

  function pushNotification(notification: NotificationRecord) {
    setNotifications((current) => {
      const next = [notification, ...current].slice(0, 20);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setLastUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  function clearNotifications() {
    setNotifications([]);
    window.localStorage.removeItem(storageKey);
  }

  async function triggerDemo(endpoint: string, payload: Record<string, unknown>) {
    await fetch(`${apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  const value = useMemo(
    () => ({
      notifications,
      connectionState,
      lastUpdatedAt,
      clearNotifications,
      pushNotification,
      triggerDemo,
    }),
    [connectionState, lastUpdatedAt, notifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
}
