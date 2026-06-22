import { createClient } from "redis";
import { Server } from "socket.io";

import { apiConfig } from "./config.js";

export async function attachRealtimeBridge(httpServer: import("node:http").Server) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    path: apiConfig.socketPath,
  });

  const redisClient = createClient({ url: apiConfig.redisUrl });
  const subscriber = redisClient.duplicate();

  await Promise.all([redisClient.connect(), subscriber.connect()]);

  await subscriber.subscribe(apiConfig.notificationChannel, (message) => {
    // The worker publishes here and the dashboard receives the same payload instantly.
    io.emit("notification", JSON.parse(message));
  });

  io.on("connection", (socket) => {
    socket.emit("ready", { connectedAt: new Date().toISOString() });
  });

  return io;
}