// ─── BaseService ─────────────────────────────────────────────────────────────
// Abstract foundation for every service in the application.
//
// Contract:
//   • start() — called once at boot; connect resources, register listeners
//   • stop()  — called on SIGINT/SIGTERM; release resources gracefully
//   • log()   — prefixed console.log("[ServiceName] ...")
//   • error() — prefixed console.error("[ServiceName] ...")
//
// To add a new service: extend BaseService, implement start() and stop().
// ─────────────────────────────────────────────────────────────────────────────

export abstract class BaseService {
  constructor(readonly name: string) {}

  /** Initialise the service (connect, subscribe, bind, etc.). */
  abstract start(): Promise<void>;

  /** Gracefully shut down the service (close, unsubscribe, etc.). */
  abstract stop(): Promise<void>;

  /** Log an informational message prefixed with the service name. */
  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  /** Log an error prefixed with the service name. */
  protected error(message: string, err?: unknown): void {
    console.error(`[${this.name}] ${message}`, err ?? "");
  }
}
