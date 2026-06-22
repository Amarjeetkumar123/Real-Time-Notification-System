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
    const event = createSignupEvent(payload);

    await eventQueue.add(event.type, event);
    response.status(201).json({ event });
  });

  app.post("/events/order", async (request, response) => {
    const payload = pickPayload(orderSchema, request.body, sampleOrder);
    const event = createOrderPlacedEvent(payload);

    await eventQueue.add(event.type, event);
    response.status(201).json({ event });
  });

  app.post("/events/payment", async (request, response) => {
    const payload = pickPayload(paymentSchema, request.body, samplePayment);
    const event = createPaymentDoneEvent(payload);

    await eventQueue.add(event.type, event);
    response.status(201).json({ event });
  });

  return { app, httpServer, port: apiConfig.port };
}