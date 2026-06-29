import type { JobsOptions } from "bullmq";
import { Queue } from "bullmq";

import type { EventType, NotificationEvent } from "@realtime/shared";

import { config } from "../config.js";
import { BaseService } from "./base.service.js";

// ─── Constants ────────────────────────────────────────────────────────────────
/** Shared queue name — used by both QueueService (producer) and NotifyService (consumer). */
export const QUEUE_NAME = "notification-events";

/** Default BullMQ job options applied to every enqueued event. */
const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  removeOnComplete: true,
  removeOnFail: 50,
};

// ─── QueueService ─────────────────────────────────────────────────────────────
// Singleton producer service. Owns the BullMQ Queue instance and exposes a
// clean API for enqueuing notification events.
//
// Usage:
//   queueService.add("user.signup", event);
//   queueService.add("order.placed", event, { delay: 3000 });
// ─────────────────────────────────────────────────────────────────────────────

class QueueService extends BaseService {
  private static _instance: QueueService;
  private queue!: Queue<NotificationEvent>;

  private constructor() {
    super("QueueService");
  }

  /** Returns the single shared QueueService instance (creates it on first call). */
  static getInstance(): QueueService {
    if (!QueueService._instance) {
      QueueService._instance = new QueueService();
    }
    return QueueService._instance;
  }

  /** Connect the BullMQ Queue to Redis. */
  async start(): Promise<void> {
    this.queue = new Queue<NotificationEvent>(QUEUE_NAME, {
      connection: { url: config.redisUrl },
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
    this.log(`Connected — queue: "${QUEUE_NAME}"`);
  }

  /** Drain and close the BullMQ Queue connection. */
  async stop(): Promise<void> {
    await this.queue.close();
    this.log("Stopped.");
  }

  /**
   * Enqueue a notification event as a BullMQ job.
   * @param type  - Job name (matches EventType).
   * @param event - Full NotificationEvent payload.
   * @param opts  - Optional BullMQ job overrides (e.g. { delay: 3000 }).
   */
  async add(type: EventType, event: NotificationEvent, opts?: JobsOptions): Promise<void> {
    await this.queue.add(type, event, opts);
    this.log(`Job enqueued — type: "${type}", id: ${event.id}`);
  }
}

export const queueService = QueueService.getInstance();
