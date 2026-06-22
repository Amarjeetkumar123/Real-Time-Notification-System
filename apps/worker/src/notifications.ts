import nodemailer from "nodemailer";

import { workerConfig } from "./config.js";
import { publishRealtimeNotification } from "./realtime.js";

type NotificationPayload = {
  title: string;
  message: string;
  eventId: string;
  createdAt: string;
};

export async function sendDemoEmail(subject: string, text: string) {
  if (!workerConfig.smtpHost) {
    // The project can still run locally without SMTP; the worker just logs the email payload.
    console.log("SMTP is not configured, skipping email send:", { subject, text });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: workerConfig.smtpHost,
    port: workerConfig.smtpPort,
    secure: false,
  });

  await transporter.sendMail({
    from: workerConfig.emailFrom,
    to: workerConfig.emailTo,
    subject,
    text,
  });
}

export async function sendFakeSms(notification: NotificationPayload) {
  console.log("Simulated SMS send:", {
    to: "+91 90000 00000",
    title: notification.title,
    message: notification.message,
  });

  await publishRealtimeNotification({
    ...notification,
    channel: "sms",
  });
}

export async function sendFakeEmail(notification: NotificationPayload) {
  console.log("Simulated email send:", {
    from: workerConfig.emailFrom,
    to: workerConfig.emailTo,
    title: notification.title,
    message: notification.message,
  });

  await publishRealtimeNotification({
    ...notification,
    channel: "email",
  });
}