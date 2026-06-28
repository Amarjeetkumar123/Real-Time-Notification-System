import { randomUUID } from "node:crypto";

import type {
  CustomerSignupPayload,
  EventType,
  NotificationEvent,
  OrderPlacedPayload,
  PaymentDonePayload,
} from "@realtime/shared";

function createEvent<TPayload extends object>(
  type: EventType,
  payload: TPayload,
  channel?: "socket" | "email" | "sms",
): NotificationEvent<TPayload> {
  return {
    id: randomUUID(),
    type,
    source: "api",
    timestamp: new Date().toISOString(),
    payload,
    ...(channel !== undefined ? { channel } : {}),
  };
}

export const sampleSignup: CustomerSignupPayload = {
  customerName: "John Doe",
  email: "john.doe@example.com",
  city: "Bengaluru",
};

export const sampleOrder: OrderPlacedPayload = {
  orderId: "ORD-2048",
  customerName: "John Doe",
  restaurantName: "Spice Route Kitchen",
  itemCount: 3,
  totalAmount: 799,
};

export const samplePayment: PaymentDonePayload = {
  orderId: "ORD-2048",
  customerName: "John Doe",
  paymentMethod: "upi",
  amount: 799,
};

export function createSignupEvent(payload: CustomerSignupPayload, channel?: "socket" | "email" | "sms") {
  return createEvent("user.signup", payload, channel);
}

export function createOrderPlacedEvent(payload: OrderPlacedPayload, channel?: "socket" | "email" | "sms") {
  return createEvent("order.placed", payload, channel);
}

export function createPaymentDoneEvent(payload: PaymentDonePayload, channel?: "socket" | "email" | "sms") {
  return createEvent("payment.done", payload, channel);
}