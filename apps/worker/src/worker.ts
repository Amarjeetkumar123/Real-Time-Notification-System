import { Worker } from "bullmq";

import type { NotificationEvent } from "@realtime/shared";

import { workerConfig } from "./config.js";
import { EVENT_QUEUE_NAME } from "./queue.js";
import { publishRealtimeNotification } from "./realtime.js";
import { sendFakeEmail, sendFakeSms } from "./notifications.js";

const descriptions: Record<NotificationEvent["type"], string> = {
  "user.signup": "New customer signup",
  "order.placed": "New order placed",
  "payment.done": "Payment completed",
};

const worker = new Worker<NotificationEvent>(
  EVENT_QUEUE_NAME,
  async (job) => {
    const event = job.data;
    const description = descriptions[event.type];
    const customerName = "customerName" in event.payload ? String(event.payload.customerName) : "a customer";

    const notification = {
      title: description,
      message: `${description} for ${customerName}`,
      channel: "socket" as const,
      eventId: event.id,
      createdAt: new Date().toISOString(),
    };

    // This keeps the browser dashboard updated as soon as the worker handles a job.
    await publishRealtimeNotification(notification);

    // Email is simulated for the demo, but SMTP config stays available for later real delivery.
    await sendFakeEmail({
      title: `${description} via Email`,
      message: `Email alert: ${description} for ${customerName}`,
      eventId: event.id,
      createdAt: new Date().toISOString(),
    });

    // SMS is simulated for demo purposes and is still surfaced through the realtime stream.
    await sendFakeSms({
      title: `${description} via SMS`,
      message: `SMS alert: ${description} for ${customerName}`,
      eventId: event.id,
      createdAt: new Date().toISOString(),
    });

    return notification;
  },
  {
    connection: {
      url: workerConfig.redisUrl,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`Processed job ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id ?? "unknown"} failed`, error);
});

console.log("Worker is listening for notification jobs.");