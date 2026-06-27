import cors from "cors";
import express from "express";
import http from "node:http";
import { z } from "zod";

import { apiConfig } from "./config.js";
import {
  createOrderPlacedEvent,
  createPaymentDoneEvent,
  createSignupEvent,
  sampleOrder,
  samplePayment,
  sampleSignup,
} from "./events.js";
import { eventQueue } from "./queue.js";
import { attachRealtimeBridge } from "./realtime.js";

const signupSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  city: z.string().min(2),
});

const orderSchema = z.object({
  orderId: z.string().min(3),
  customerName: z.string().min(2),
  restaurantName: z.string().min(2),
  itemCount: z.number().int().positive(),
  totalAmount: z.number().positive(),
});

const paymentSchema = z.object({
  orderId: z.string().min(3),
  customerName: z.string().min(2),
  paymentMethod: z.enum(["card", "upi", "wallet"]),
  amount: z.number().positive(),
});

function pickPayload<T extends z.ZodTypeAny>(schema: T, body: unknown, fallback: z.infer<T>) {
  const result = schema.safeParse(body);
  return result.success ? result.data : fallback;
}

export async function createApiServer() {
  const app = express();
  const httpServer = http.createServer(app);

  await attachRealtimeBridge(httpServer);

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "api", timestamp: new Date().toISOString() });
  });

  app.get("/", (_request, response) => {
    response.json({
      message: "Real-time notification API is running.",
      examples: ["POST /events/signup", "POST /events/order", "POST /events/payment"],
    });
  });

  app.post("/events/signup", async (request, response) => {
    const payload = pickPayload(signupSchema, request.body, sampleSignup);
    const channel = (request.body.channel === "socket" || request.body.channel === "email" || request.body.channel === "sms") ? request.body.channel : undefined;
    const event = createSignupEvent(payload, channel);

    await eventQueue.add(event.type, event);
    response.status(201).json({ event });
  });

  app.post("/events/order", async (request, response) => {
    const payload = pickPayload(orderSchema, request.body, sampleOrder);
    const channel = (request.body.channel === "socket" || request.body.channel === "email" || request.body.channel === "sms") ? request.body.channel : undefined;
    const event = createOrderPlacedEvent(payload, channel);

    await eventQueue.add(event.type, event);
    response.status(201).json({ event });
  });

  app.post("/events/payment", async (request, response) => {
    const payload = pickPayload(paymentSchema, request.body, samplePayment);
    const channel = (request.body.channel === "socket" || request.body.channel === "email" || request.body.channel === "sms") ? request.body.channel : undefined;
    const event = createPaymentDoneEvent(payload, channel);

    await eventQueue.add(event.type, event);
    response.status(201).json({ event });
  });

  app.post("/events/simulate-retry", async (request, response) => {
    const event = createSignupEvent({
      customerName: "Simulated Retry User",
      email: "retry.demo@realtime.dev",
      city: "San Francisco",
    });
    event.payload = { ...event.payload, simulateRetry: true };
    await eventQueue.add(event.type, event);
    response.status(201).json({ event });
  });

  app.post("/events/simulate-fail", async (request, response) => {
    const event = createSignupEvent({
      customerName: "Simulated Fatal User",
      email: "fatal.error@realtime.dev",
      city: "Chicago",
    });
    event.payload = { ...event.payload, simulateFailure: true };
    await eventQueue.add(event.type, event);
    response.status(201).json({ event });
  });

  app.post("/events/simulate-delay", async (request, response) => {
    const event = createSignupEvent({
      customerName: "Delayed Job User",
      email: "delayed.job@realtime.dev",
      city: "Austin",
    });
    event.payload = { ...event.payload, simulateDelay: true };
    // Enqueue as delayed in Redis (3 seconds)
    await eventQueue.add(event.type, event, { delay: 3000 });
    response.status(201).json({ event });
  });

  app.post("/events/simulate-overflow", async (request, response) => {
    const events = [];
    for (let i = 0; i < 15; i++) {
      const event = createSignupEvent({
        customerName: `Overflow User #${i + 1}`,
        email: `overflow.${i + 1}@realtime.dev`,
        city: "Seattle",
      });
      events.push(eventQueue.add(event.type, event));
    }
    await Promise.all(events);
    response.status(201).json({ message: "Queue overflow triggered: 15 events added." });
  });

  return { app, httpServer, port: apiConfig.port };
}