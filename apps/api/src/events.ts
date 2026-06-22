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
): NotificationEvent<TPayload> {
  return {
    id: randomUUID(),
    type,
    source: "api",
    timestamp: new Date().toISOString(),
    payload,
  };
}

export const sampleSignup: CustomerSignupPayload = {
  customerName: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  city: "Bengaluru",
};

export const sampleOrder: OrderPlacedPayload = {
  orderId: "ORD-2048",
  customerName: "Aarav Sharma",
  restaurantName: "Spice Route Kitchen",
  itemCount: 3,
  totalAmount: 799,
};

export const samplePayment: PaymentDonePayload = {
  orderId: "ORD-2048",
  customerName: "Aarav Sharma",
  paymentMethod: "upi",
  amount: 799,
};

export function createSignupEvent(payload: CustomerSignupPayload) {
  return createEvent("user.signup", payload);
}

export function createOrderPlacedEvent(payload: OrderPlacedPayload) {
  return createEvent("order.placed", payload);
}

export function createPaymentDoneEvent(payload: PaymentDonePayload) {
  return createEvent("payment.done", payload);
}