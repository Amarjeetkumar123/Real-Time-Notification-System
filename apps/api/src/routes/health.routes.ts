import { Router } from "express";

// ─── Health Routes ────────────────────────────────────────────────────────────
// Simple liveness and discovery endpoints.
// No business logic — just confirms the server is up.
// ─────────────────────────────────────────────────────────────────────────────

export const healthRouter = Router();

/** Liveness probe — used by load balancers and uptime monitors. */
healthRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api", timestamp: new Date().toISOString() });
});

/** Root discovery — lists available event endpoints. */
healthRouter.get("/", (_req, res) => {
  res.json({
    message: "Real-time notification API is running.",
    endpoints: [
      "POST /events/signup",
      "POST /events/order",
      "POST /events/payment",
      "POST /events/simulate-retry",
      "POST /events/simulate-fail",
      "POST /events/simulate-delay",
      "POST /events/simulate-overflow",
      "GET  /notifications",
    ],
  });
});
