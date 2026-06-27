import { Hono } from "hono";
export function createAdminRouter(storage: { cleanupExpiredSessions: () => void }): Hono {
  const router = new Hono();
  router.post("/v1/admin/cleanup", (c) => { storage.cleanupExpiredSessions(); return c.json({ status: "cleaned" }); });
  router.get("/v1/admin/stats", (c) => c.json({ uptime: process.uptime() | 0, memory: process.memoryUsage() }));
  return router;
}
