/**
 * @caypo/canton-gateway — MPP API Gateway for Canton Network.
 * 17 services, 46+ endpoints via Hono.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerServiceRoutes } from "./routes/services.js";
import { registerDiscoveryRoutes } from "./routes/discovery.js";

export const CANTON_GATEWAY_VERSION = "0.2.0";

export const app = new Hono();

// CORS
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept"],
  exposeHeaders: ["Payment-Receipt", "WWW-Authenticate", "X-Upstream-Status", "X-Gateway-Service"],
}));

// Root
app.get("/", (c) => {
  return c.json({
    name: "CAYPO MPP Gateway",
    description: "Agent finance on institutional rails",
    version: CANTON_GATEWAY_VERSION,
    docs: "/api/services",
    discovery: "/llms.txt",
    health: "/health",
  });
});

// Discovery routes (/api/services, /llms.txt, /health)
registerDiscoveryRoutes(app);

// Service proxy routes (/{slug}/{path})
registerServiceRoutes(app);

// Global error handler
app.onError((err, c) => {
  console.error("Gateway error:", err.message);
  return c.json(
    { error: "Internal gateway error", message: err.message },
    500,
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    { error: "Not found", message: "Use /api/services to see available endpoints" },
    404,
  );
});

// Re-export catalog types
export { services, totalEndpoints, type ServiceDef, type EndpointDef } from "./services/catalog.js";
export { mppGate, type MppGateOptions } from "./mpp/middleware.js";
export { proxyToUpstream } from "./proxy/handler.js";
