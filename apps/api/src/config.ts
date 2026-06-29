import "dotenv/config";

// ─── Unified Config ───────────────────────────────────────────────────────────
// Single source of truth for all environment variables used by both the
// HTTP/Socket layer (formerly "api") and the worker/notification layer
// (formerly "worker"). Import `config` everywhere — no more split configs.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  // HTTP server
  port: Number(process.env.API_PORT ?? 4000),

  // Redis (shared by BullMQ queue, BullMQ worker, pub/sub, and store)
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",

  // Socket.IO
  socketPath: process.env.SOCKET_PATH ?? "/socket.io",
  notificationChannel: process.env.NOTIFICATION_CHANNEL ?? "notifications",

  // Email (nodemailer — optional; skipped if smtpHost is not set)
  emailFrom: process.env.EMAIL_FROM ?? "no-reply@realtime-notifications.dev",
  emailTo:   process.env.EMAIL_TO   ?? "demo@example.com",
  smtpHost:  process.env.SMTP_HOST,
  smtpPort:  Number(process.env.SMTP_PORT ?? 1025),
} as const;