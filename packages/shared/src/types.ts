export type EventType = "user.signup" | "order.placed" | "payment.done";

export type EventSource = "api" | "worker";

export interface NotificationEvent<TPayload extends object = object> {
  id: string;
  type: EventType;
  source: EventSource;
  timestamp: string;
  payload: TPayload;
  channel?: "socket" | "email" | "sms";
}

export interface CustomerSignupPayload {
  customerName: string;
  email: string;
  city: string;
}

export interface OrderPlacedPayload {
  orderId: string;
  customerName: string;
  restaurantName: string;
  itemCount: number;
  totalAmount: number;
}

export interface PaymentDonePayload {
  orderId: string;
  customerName: string;
  paymentMethod: "card" | "upi" | "wallet";
  amount: number;
}

export interface NotificationRecord {
  title: string;
  message: string;
  channel: "socket" | "email" | "sms";
  eventId: string;
  createdAt: string;
}