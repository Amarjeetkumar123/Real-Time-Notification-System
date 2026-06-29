import type { Server } from "socket.io";

// ─── Socket.IO Singleton ─────────────────────────────────────────────────────
// One file owns the Socket.IO Server instance so any module can call
// getSocketInstance() without circular dependency issues.
// attachRealtimeBridge() in realtime.ts must call setSocketInstance() first.
// ─────────────────────────────────────────────────────────────────────────────

let _io: Server | null = null;

/** Store the Socket.IO server created during app startup. */
export function setSocketInstance(io: Server): void {
  _io = io;
}

/** Retrieve the Socket.IO server. Throws if called before initialisation. */
export function getSocketInstance(): Server {
  if (!_io) {
    throw new Error("[Socket] Instance not initialised. Call setSocketInstance() first.");
  }
  return _io;
}
