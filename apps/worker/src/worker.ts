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
    const targetChannel = event.channel;

    // 1. Simulate Retry (Fails on first two attempts, then succeeds)
    if (event.payload && "simulateRetry" in event.payload && event.payload.simulateRetry) {
      if (job.attemptsMade < 2) {
        console.log(`[Worker] Job ${job.id} simulating temporary network failure (Attempt ${job.attemptsMade + 1}/3)`);
        throw new Error(`Temp network connection timeout (SendGrid is unresponsive)`);
      } else {
        console.log(`[Worker] Job ${job.id} temporary issue resolved, proceeding on Attempt 3`);
      }
    }

    // 2. Simulate Fatal Failure (Fails all attempts)
    if (event.payload && "simulateFailure" in event.payload && event.payload.simulateFailure) {
      console.log(`[Worker] Job ${job.id} simulating fatal connection error`);
      throw new Error(`Fatal socket error (Twilio credentials rejected)`);
    }

    // 3. Simulate Worker Latency/Delay
    if (event.payload && "simulateDelay" in event.payload && event.payload.simulateDelay) {
      console.log(`[Worker] Job ${job.id} simulating high resource latency (3000ms delay)`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    const summary = {
      eventId: event.id,
      type: event.type,
      customerName,
      delivered: [] as string[],
    };

    if (!targetChannel || targetChannel === "socket") {
      const notification = {
        title: description,
        message: `${description} for ${customerName}`,
        channel: "socket" as const,
        eventId: event.id,
        createdAt: new Date().toISOString(),
      };
      await publishRealtimeNotification(notification);
      summary.delivered.push("socket");
    }

    if (!targetChannel || targetChannel === "email") {
      await sendFakeEmail({
        title: `${description} via Email`,
        message: `Email alert: ${description} for ${customerName}`,
        eventId: event.id,
        createdAt: new Date().toISOString(),
      });
      summary.delivered.push("email");
    }

    if (!targetChannel || targetChannel === "sms") {
      await sendFakeSms({
        title: `${description} via SMS`,
        message: `SMS alert: ${description} for ${customerName}`,
        eventId: event.id,
        createdAt: new Date().toISOString(),
      });
      summary.delivered.push("sms");
    }

    return summary;
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

worker.on("failed", async (job, error) => {
  console.error(`Job ${job?.id ?? "unknown"} failed`, error);
  if (job) {
    const event = job.data;
    const isPermanent = job.attemptsMade >= 2;
    const customerName = "customerName" in event.payload ? String(event.payload.customerName) : "a customer";

    const title = isPermanent 
      ? `Job Error: Permanent Outage`
      : `Job Warning: Temporary Outage`;

    const message = isPermanent
      ? `Job #${job.id} for ${customerName} failed fatally after 3 attempts. Transferred to Dead Letter Queue (DLQ).`
      : `Job #${job.id} for ${customerName} failed on attempt ${job.attemptsMade + 1}/3. Scheduling exponential backoff retry...`;

    const notification = {
      title,
      message,
      channel: "socket" as const,
      eventId: event.id,
      createdAt: new Date().toISOString(),
    };

    try {
      await publishRealtimeNotification(notification);
    } catch (err) {
      console.error("Worker failed to broadcast error telemetry", err);
    }
  }
});

console.log("Worker is listening for notification jobs.");