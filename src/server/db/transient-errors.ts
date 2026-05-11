/** Neon serverless driver / WebSocket Postgres can drop mid long-running workloads. */

export function isTransientDatabaseConnectionError(e: unknown): boolean {
  const msg =
    e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
  const m = msg.toLowerCase();

  return (
    m.includes("not queryable") ||
    m.includes("connection error") ||
    m.includes("econnreset") ||
    m.includes("connection closed") ||
    m.includes("socket hang up") ||
    m.includes("terminated") ||
    m.includes("fetch failed") ||
    m.includes("undici error") ||
    m.includes("connection timed out") ||
    m.includes("timeout")
  );
}
