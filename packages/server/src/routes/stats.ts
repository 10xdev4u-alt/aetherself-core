import { Hono } from "hono";
export function createStatsRouter(): Hono {
  const router = new Hono();
  const startedAt = Date.now();
  router.get("/v1/stats", (c) => c.json({
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    startedAt,
    version: "0.1.0",
    node: process.version,
    memory: { rss: process.memoryUsage().rss, heap: process.memoryUsage().heapUsed },
  }));
  return router;
}
