import type { Storage } from "./storage.js";
export function createHealthHandler(storage: Storage) {
  return () => {
    try { storage.getIdentity("test"); return { status: "ok", db: "connected" }; }
    catch { return { status: "degraded", db: "error" }; }
  };
}
