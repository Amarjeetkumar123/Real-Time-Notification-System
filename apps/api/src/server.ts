import cors from "cors";
import express from "express";
import http from "node:http";

import { eventsRouter } from "./routes/events.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { attachRealtimeBridge } from "./realtime.js";
import { config } from "./config.js";

// ─── createApiServer ──────────────────────────────────────────────────────────
// Bootstraps the Express app, attaches middleware, mounts routers, and
// wires the Socket.IO realtime bridge to the underlying HTTP server.
//
// Routes are defined in routes/ — server.ts only composes them.
// Business logic lives in services/ and jobs/.
// ─────────────────────────────────────────────────────────────────────────────

export async function createApiServer() {
  const app        = express();
  const httpServer = http.createServer(app);

  // Attach Socket.IO and set the global socket singleton before routes boot
  await attachRealtimeBridge(httpServer);

  // ── Middleware ───────────────────────────────────────────────────────────────
  app.use(cors());
  app.use(express.json());

  // ── Routers ──────────────────────────────────────────────────────────────────
  app.use(healthRouter);
  app.use(eventsRouter);
  app.use(notificationsRouter);

  return { app, httpServer, port: config.port };
}