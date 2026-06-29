import { createApiServer } from "./server.js";
import { queueService } from "./services/queue.service.js";
import { notificationStoreService } from "./services/notification-store.service.js";
import { notifyService } from "./services/notify.service.js";
import type { BaseService } from "./services/base.service.js";

// ─── Service Registry ─────────────────────────────────────────────────────────
// All long-running services are listed here.
// They start in order (top → bottom) and stop in reverse (bottom → top).
//
// To add a new service in the future:
//   1. Create a class that extends BaseService
//   2. Implement start() and stop()
//   3. Append the instance to the array below — done.
// ─────────────────────────────────────────────────────────────────────────────

const services: BaseService[] = [
  queueService,               // BullMQ Queue   (producer — must start first)
  notificationStoreService,   // Redis List store (must be ready before worker)
  notifyService,              // BullMQ Worker  (consumer — starts last)
  // future: analyticsService, emailReportService, ...
];

// ─── Boot ─────────────────────────────────────────────────────────────────────

// Create HTTP server + Socket.IO (sets socket singleton before services start)
const { httpServer, port } = await createApiServer();

// Start all services in registry order
for (const service of services) {
  await service.start();
}

// Begin accepting HTTP + WebSocket connections only after services are ready
httpServer.listen(port, () => {
  console.log(`\n🚀 Server running at http://localhost:${port}`);
  console.log(`📡 Socket.IO listening on path /socket.io\n`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Shutdown] ${signal} received — stopping services...`);

  // Stop in reverse order (consumer before producer)
  for (const service of [...services].reverse()) {
    await service.stop();
  }

  httpServer.close(() => {
    console.log("[Shutdown] HTTP server closed. Goodbye.");
    process.exit(0);
  });
}

process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));