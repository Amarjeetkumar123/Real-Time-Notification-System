import { Router } from "express";

import { notificationStoreService } from "../services/notification-store.service.js";
import { getSocketInstance } from "../socket.js";

// ─── Notifications Routes ─────────────────────────────────────────────────────
// Exposes the Redis-backed notification history so the web dashboard can
// fetch stored notifications on page load (without waiting for Socket.IO).
// ─────────────────────────────────────────────────────────────────────────────

export const notificationsRouter = Router();

/** Return all stored notifications from Redis (newest first, max 100). */
notificationsRouter.get("/notifications", async (_req, res) => {
  const notifications = await notificationStoreService.getAll();
  res.json({ notifications, count: notifications.length });
});

/** Clear all stored notifications from Redis and notify all connected clients. */
notificationsRouter.delete("/notifications", async (_req, res) => {
  await notificationStoreService.clear();
  // Tell all connected clients to wipe their local state
  getSocketInstance().emit("notifications:cleared");
  res.json({ ok: true, message: "All notifications cleared from Redis store." });
});

