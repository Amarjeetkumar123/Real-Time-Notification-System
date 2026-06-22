import { createClient } from "redis";

import { workerConfig } from "./config.js";

export async function publishRealtimeNotification(message: Record<string, unknown>) {
  const client = createClient({ url: workerConfig.redisUrl });

  await client.connect();
  await client.publish(workerConfig.notificationChannel, JSON.stringify(message));
  await client.quit();
}