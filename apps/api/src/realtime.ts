import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { config } from "./config.js";
import { notificationStoreService } from "./services/notification-store.service.js";
import { setSocketInstance } from "./socket.js";

// ─── attachRealtimeBridge ─────────────────────────────────────────────────────
// Creates the Socket.IO server, stores the singleton, and wires the
// "connection" handler to replay Redis-persisted notification history
// to every freshly connected client.
//
// Note: because API and Worker now run in the same process, NotificationJob
// emits directly via getSocketInstance() — no Redis pub/sub bridge needed.
// ─────────────────────────────────────────────────────────────────────────────

export async function attachRealtimeBridge(httpServer: HttpServer): Promise<Server> {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    path: config.socketPath,
  });

  // Make the Socket.IO instance available across the app (e.g. NotificationJob)
  setSocketInstance(io);

  io.on("connection", async (socket) => {
    // Acknowledge the connection with a server timestamp
    socket.emit("ready", { connectedAt: new Date().toISOString() });

    // Replay persisted notifications so the client is immediately up-to-date
    try {
      const history = await notificationStoreService.getAll();
      if (history.length > 0) {
        socket.emit("notification:history", history);
      }
    } catch (err) {
      console.error("[Realtime] Failed to replay notification history", err);
    }
  });

  return io;
}