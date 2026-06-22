import "dotenv/config";

export const workerConfig = {
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  emailFrom: process.env.EMAIL_FROM ?? "no-reply@realtime-notifications.dev",
  emailTo: process.env.EMAIL_TO ?? "demo@example.com",
  notificationChannel: process.env.NOTIFICATION_CHANNEL ?? "notifications",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 1025),
};