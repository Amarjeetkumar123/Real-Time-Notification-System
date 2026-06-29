import nodemailer from "nodemailer";

import type { Job } from "bullmq";
import type { NotificationEvent, NotificationRecord } from "@realtime/shared";

import { config } from "../../config.js";
import { getSocketInstance } from "../../socket.js";
import { notificationStoreService } from "../notification-store.service.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JobSummary {
  eventId: string;
  type: NotificationEvent["type"];
  customerName: string;
  delivered: string[];
}

// ─── Descriptions ─────────────────────────────────────────────────────────────

const EVENT_DESCRIPTIONS: Record<NotificationEvent["type"], string> = {
  "user.signup":   "New customer signup",
  "order.placed":  "New order placed",
  "payment.done":  "Payment completed",
};

// ─── NotificationJob ──────────────────────────────────────────────────────────
// Pure job processor — instantiated by NotifyService and passed as the
// BullMQ processor function. Handles ALL notification delivery logic:
//   • Simulation flags (retry / failure / delay)
//   • Channel dispatch (socket / email / sms)
//   • Redis persistence via NotificationStoreService
//   • BullMQ lifecycle events (completed / failed)
// ─────────────────────────────────────────────────────────────────────────────

export class NotificationJob {

  // ── Main Processor ──────────────────────────────────────────────────────────

  /** BullMQ processor — called by NotifyService for every dequeued job. */
  async process(job: Job<NotificationEvent>): Promise<JobSummary> {
    const event = job.data;
    const description = EVENT_DESCRIPTIONS[event.type];
    const customerName = "customerName" in event.payload
      ? String(event.payload.customerName)
      : "a customer";

    // Run simulation hooks before real delivery
    await this.handleSimulations(job);

    // Dispatch to channels and collect delivery receipts
    const delivered = await this.dispatch(event, description, customerName);

    return { eventId: event.id, type: event.type, customerName, delivered };
  }

  // ── Simulation Handlers ─────────────────────────────────────────────────────

  /**
   * Inspect simulation flags on the payload and apply artificial behaviour.
   * Flags are only present in demo/testing scenarios.
   */
  private async handleSimulations(job: Job<NotificationEvent>): Promise<void> {
    const payload = job.data.payload;

    // simulateRetry — fails first two attempts, succeeds on the third
    if ("simulateRetry" in payload && payload.simulateRetry) {
      if (job.attemptsMade < 2) {
        console.log(`[NotificationJob] Job ${job.id} — simulating network timeout (attempt ${job.attemptsMade + 1}/3)`);
        throw new Error("Temporary network timeout (SendGrid unresponsive)");
      }
      console.log(`[NotificationJob] Job ${job.id} — temporary issue resolved, proceeding on attempt 3`);
    }

    // simulateFailure — always throws (ends up in DLQ after all retries)
    if ("simulateFailure" in payload && payload.simulateFailure) {
      console.log(`[NotificationJob] Job ${job.id} — simulating fatal error`);
      throw new Error("Fatal socket error (Twilio credentials rejected)");
    }

    // simulateDelay — adds artificial processing latency
    if ("simulateDelay" in payload && payload.simulateDelay) {
      console.log(`[NotificationJob] Job ${job.id} — simulating high latency (3 000 ms)`);
      await new Promise<void>((resolve) => setTimeout(resolve, 3000));
    }
  }

  // ── Channel Dispatch ────────────────────────────────────────────────────────

  /**
   * Route the event to the correct channel(s).
   * If event.channel is undefined, ALL channels are used.
   */
  private async dispatch(event: NotificationEvent, description: string, customerName: string): Promise<string[]> {
    const target = event.channel;
    const delivered: string[] = [];

    if (!target || target === "socket") {
      await this.sendSocket({ title: description, message: `${description} for ${customerName}`, channel: "socket", eventId: event.id, createdAt: new Date().toISOString() });
      delivered.push("socket");
    }

    if (!target || target === "email") {
      await this.sendEmail({ title: `${description} via Email`, message: `Email alert: ${description} for ${customerName}`, channel: "email", eventId: event.id, createdAt: new Date().toISOString() });
      delivered.push("email");
    }

    if (!target || target === "sms") {
      await this.sendSms({ title: `${description} via SMS`, message: `SMS alert: ${description} for ${customerName}`, channel: "sms", eventId: event.id, createdAt: new Date().toISOString() });
      delivered.push("sms");
    }

    return delivered;
  }

  // ── Channel Senders ─────────────────────────────────────────────────────────

  /**
   * Deliver via Socket.IO — emits directly to all connected clients and
   * persists the notification in Redis for history replay.
   */
  private async sendSocket(notification: NotificationRecord): Promise<void> {
    getSocketInstance().emit("notification", notification);
    await notificationStoreService.push(notification);
    console.log(`[NotificationJob] Socket → ${notification.message}`);
  }

  /**
   * Simulated email delivery — logs the payload, optionally sends via SMTP
   * if configured, then persists in Redis and notifies connected clients.
   */
  private async sendEmail(notification: NotificationRecord): Promise<void> {
    console.log("[NotificationJob] Email →", { from: config.emailFrom, to: config.emailTo, title: notification.title });

    // Real SMTP send (optional — skipped if SMTP_HOST is not configured)
    if (config.smtpHost) {
      const transporter = nodemailer.createTransport({ host: config.smtpHost, port: config.smtpPort, secure: false });
      await transporter.sendMail({ from: config.emailFrom, to: config.emailTo, subject: notification.title, text: notification.message });
    }

    getSocketInstance().emit("notification", notification);
    await notificationStoreService.push(notification);
  }

  /**
   * Simulated SMS delivery — logs the payload, then persists in Redis
   * and notifies connected clients.
   */
  private async sendSms(notification: NotificationRecord): Promise<void> {
    console.log("[NotificationJob] SMS →", { to: "+91 90000 00000", title: notification.title, message: notification.message });
    getSocketInstance().emit("notification", notification);
    await notificationStoreService.push(notification);
  }

  // ── BullMQ Lifecycle ────────────────────────────────────────────────────────

  /** Called by NotifyService when a job completes successfully. */
  async onCompleted(job: Job<NotificationEvent>): Promise<void> {
    console.log(`[NotificationJob] ✓ Job ${job.id} completed (${job.data.type})`);
  }

  /**
   * Called by NotifyService when a job fails.
   * Pushes an error notification to connected clients so the dashboard
   * reflects retry / permanent failure status in real time.
   */
  async onFailed(job: Job<NotificationEvent> | undefined, err: Error): Promise<void> {
    console.error(`[NotificationJob] ✗ Job ${job?.id ?? "unknown"} failed`, err.message);

    if (!job) return;

    const event = job.data;
    const customerName = "customerName" in event.payload ? String(event.payload.customerName) : "a customer";
    const isPermanent = job.attemptsMade >= 3;

    const notification: NotificationRecord = {
      title:     isPermanent ? "Job Error: Permanent Outage" : "Job Warning: Temporary Outage",
      message:   isPermanent
        ? `Job #${job.id} for ${customerName} failed fatally after 3 attempts — moved to Dead Letter Queue.`
        : `Job #${job.id} for ${customerName} failed on attempt ${job.attemptsMade}/3 — retrying with backoff.`,
      channel:   "socket",
      eventId:   event.id,
      createdAt: new Date().toISOString(),
    };

    try {
      getSocketInstance().emit("notification", notification);
      await notificationStoreService.push(notification);
    } catch (broadcastErr) {
      console.error("[NotificationJob] Failed to broadcast error telemetry", broadcastErr);
    }
  }
}
