import { Router } from "express";
import { z } from "zod";

import {
  createOrderPlacedEvent,
  createPaymentDoneEvent,
  createSignupEvent,
  sampleOrder,
  samplePayment,
  sampleSignup,
} from "../events.js";
import { queueService } from "../services/queue.service.js";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const signupSchema = z.object({
  customerName: z.string().min(2),
  email:        z.string().email(),
  city:         z.string().min(2),
});

const orderSchema = z.object({
  orderId:        z.string().min(3),
  customerName:   z.string().min(2),
  restaurantName: z.string().min(2),
  itemCount:      z.number().int().positive(),
  totalAmount:    z.number().positive(),
});

const paymentSchema = z.object({
  orderId:       z.string().min(3),
  customerName:  z.string().min(2),
  paymentMethod: z.enum(["card", "upi", "wallet"]),
  amount:        z.number().positive(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Validate body against schema; fall back to a default payload if invalid. */
function pickPayload<T extends z.ZodTypeAny>(schema: T, body: unknown, fallback: z.infer<T>): z.infer<T> {
  const result = schema.safeParse(body);
  return result.success ? result.data : fallback;
}

/** Extract a valid channel string from the request body or return undefined. */
function pickChannel(body: unknown): "socket" | "email" | "sms" | undefined {
  if (!body || typeof body !== "object") return undefined;
  const ch = (body as Record<string, unknown>)["channel"];
  return ch === "socket" || ch === "email" || ch === "sms" ? ch : undefined;
}

// ─── Events Router ────────────────────────────────────────────────────────────
// Responsibility: validate → build event → enqueue via QueueService → 201.
// No delivery logic here; that lives in NotificationJob.
// ─────────────────────────────────────────────────────────────────────────────

export const eventsRouter = Router();

/** Enqueue a customer signup notification event. */
eventsRouter.post("/events/signup", async (req, res) => {
  const payload = pickPayload(signupSchema, req.body, sampleSignup);
  const event   = createSignupEvent(payload, pickChannel(req.body));
  await queueService.add(event.type, event);
  res.status(201).json({ event });
});

/** Enqueue an order-placed notification event. */
eventsRouter.post("/events/order", async (req, res) => {
  const payload = pickPayload(orderSchema, req.body, sampleOrder);
  const event   = createOrderPlacedEvent(payload, pickChannel(req.body));
  await queueService.add(event.type, event);
  res.status(201).json({ event });
});

/** Enqueue a payment-done notification event. */
eventsRouter.post("/events/payment", async (req, res) => {
  const payload = pickPayload(paymentSchema, req.body, samplePayment);
  const event   = createPaymentDoneEvent(payload, pickChannel(req.body));
  await queueService.add(event.type, event);
  res.status(201).json({ event });
});

// ─── Simulation Endpoints ─────────────────────────────────────────────────────
// These endpoints trigger artificial behaviour for demo / stress testing.

/** Simulate a transient failure that resolves after 2 retries. */
eventsRouter.post("/events/simulate-retry", async (req, res) => {
  const event = createSignupEvent({ customerName: "Simulated Retry User", email: "retry.demo@realtime.dev", city: "San Francisco" }, pickChannel(req.body));
  event.payload = { ...event.payload, simulateRetry: true };
  await queueService.add(event.type, event);
  res.status(201).json({ event });
});

/** Simulate a permanent fatal failure (job ends up in DLQ). */
eventsRouter.post("/events/simulate-fail", async (req, res) => {
  const event = createSignupEvent({ customerName: "Simulated Fatal User", email: "fatal.error@realtime.dev", city: "Chicago" }, pickChannel(req.body));
  event.payload = { ...event.payload, simulateFailure: true };
  await queueService.add(event.type, event);
  res.status(201).json({ event });
});

/** Simulate a slow job with a 3-second in-worker delay (job is also delayed in queue). */
eventsRouter.post("/events/simulate-delay", async (req, res) => {
  const event = createSignupEvent({ customerName: "Delayed Job User", email: "delayed.job@realtime.dev", city: "Austin" }, pickChannel(req.body));
  event.payload = { ...event.payload, simulateDelay: true };
  await queueService.add(event.type, event, { delay: 3000 });
  res.status(201).json({ event });
});

/** Simulate queue overflow by bulk-enqueuing 15 events. */
eventsRouter.post("/events/simulate-overflow", async (req, res) => {
  const channel = pickChannel(req.body);
  const jobs = Array.from({ length: 15 }, (_, i) => {
    const event = createSignupEvent({ customerName: `Overflow User #${i + 1}`, email: `overflow.${i + 1}@realtime.dev`, city: "Seattle" }, channel);
    return queueService.add(event.type, event);
  });
  await Promise.all(jobs);
  res.status(201).json({ message: "Queue overflow triggered: 15 events enqueued." });
});
