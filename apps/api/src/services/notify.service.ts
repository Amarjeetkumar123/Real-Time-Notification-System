import { Worker } from "bullmq";

import type { NotificationEvent } from "@realtime/shared";

import { config } from "../config.js";
import { BaseService } from "./base.service.js";
import { NotificationJob } from "./jobs/notification.job.js";
import { QUEUE_NAME } from "./queue.service.js";

// ─── NotifyService ────────────────────────────────────────────────────────────
// The BullMQ consumer service. Extends BaseService and IS the worker —
// it boots the BullMQ Worker in start(), wires it to NotificationJob,
// and registers job lifecycle listeners.
//
// Separation of concerns:
//   NotifyService  → owns Worker lifecycle (start / stop / event listeners)
//   NotificationJob → owns all delivery logic (socket / email / sms / simulate)
// ─────────────────────────────────────────────────────────────────────────────

export class NotifyService extends BaseService {
  private worker!: Worker<NotificationEvent>;

  /** NotificationJob instance — handles every dequeued BullMQ job. */
  private readonly job: NotificationJob;

  constructor() {
    super("NotifyService");
    this.job = new NotificationJob();
  }

  /** Start the BullMQ Worker and register completed/failed event listeners. */
  async start(): Promise<void> {
    this.worker = new Worker<NotificationEvent>(
      QUEUE_NAME,
      (bullJob) => this.job.process(bullJob),
      { connection: { url: config.redisUrl } },
    );

    // Wire BullMQ lifecycle events to NotificationJob handlers
    this.worker.on("completed", (bullJob) => this.job.onCompleted(bullJob));
    this.worker.on("failed",    (bullJob, err) => this.job.onFailed(bullJob, err));

    this.log(`Worker started — listening on queue "${QUEUE_NAME}"`);
  }

  /** Gracefully close the BullMQ Worker (waits for the active job to finish). */
  async stop(): Promise<void> {
    await this.worker.close();
    this.log("Worker stopped.");
  }
}

export const notifyService = new NotifyService();
