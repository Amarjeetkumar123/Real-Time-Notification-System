import { createClient, type RedisClientType } from "redis";

import type { NotificationRecord } from "@realtime/shared";

import { config } from "../config.js";
import { BaseService } from "./base.service.js";

// ─── NotificationStoreService ─────────────────────────────────────────────────
// Persists delivered notifications in a Redis List so clients that connect
// (or reconnect) can receive the notification history without a database.
//
// Redis strategy:
//   LPUSH  → newest notification is always at index 0
//   LTRIM  → automatically caps the list at MAX_STORE_SIZE items
//   LRANGE → reads the full list (newest-first) for history replay
//
// On client connect (realtime.ts):
//   const history = await notificationStoreService.getAll();
//   socket.emit("notification:history", history);
// ─────────────────────────────────────────────────────────────────────────────

/** Redis key for the notifications list. */
const STORE_KEY = "notifications:recent";

/** Maximum notifications kept in Redis (older entries are auto-evicted). */
const MAX_STORE_SIZE = 100;

class NotificationStoreService extends BaseService {
  private client!: RedisClientType;

  constructor() {
    super("NotificationStoreService");
  }

  /** Connect the dedicated Redis client for the notification store. */
  async start(): Promise<void> {
    this.client = createClient({ url: config.redisUrl }) as RedisClientType;
    this.client.on("error", (err) => this.error("Redis client error", err));
    await this.client.connect();
    this.log("Connected to Redis.");
  }

  /** Quit the Redis client gracefully. */
  async stop(): Promise<void> {
    await this.client.quit();
    this.log("Stopped.");
  }

  /**
   * Persist a delivered notification.
   * LPUSH keeps the newest at index 0; LTRIM caps the list at MAX_STORE_SIZE.
   */
  async push(notification: NotificationRecord): Promise<void> {
    await this.client.lPush(STORE_KEY, JSON.stringify(notification));
    await this.client.lTrim(STORE_KEY, 0, MAX_STORE_SIZE - 1);
  }

  /**
   * Return all stored notifications, newest first.
   * Used to replay history to a freshly connected Socket.IO client.
   */
  async getAll(): Promise<NotificationRecord[]> {
    const items = await this.client.lRange(STORE_KEY, 0, -1);
    return items.map((item) => JSON.parse(item) as NotificationRecord);
  }

  /**
   * Delete all stored notifications from Redis.
   * Called by the DELETE /notifications endpoint.
   */
  async clear(): Promise<void> {
    await this.client.del(STORE_KEY);
  }
}

export const notificationStoreService = new NotificationStoreService();
