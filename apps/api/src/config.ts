import "dotenv/config";

export const apiConfig = {
  port: Number(process.env.API_PORT ?? 4000),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  socketPath: process.env.SOCKET_PATH ?? "/socket.io",
  notificationChannel: process.env.NOTIFICATION_CHANNEL ?? "notifications",
};