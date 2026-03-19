/**
 * Dynamic service route registration.
 * Loops through catalog and registers Hono routes with MPP gate + proxy.
 */

import { Hono } from "hono";
import { services } from "../services/catalog.js";
import { proxyToUpstream } from "../proxy/handler.js";
import { mppGate } from "../mpp/middleware.js";

export function registerServiceRoutes(app: Hono): void {
  for (const service of services) {
    for (const endpoint of service.endpoints) {
      const routePath = `/${service.slug}${endpoint.path}`;

      // Register with MPP payment gate
      const handler = [
        mppGate({
          amount: endpoint.price,
          description: `${service.name}: ${endpoint.description}`,
        }),
        async (c: Parameters<Parameters<Hono["on"]>[2]>[0]) => {
          const response = await proxyToUpstream(c.req.raw, service, endpoint.path);
          return response;
        },
      ] as const;

      if (endpoint.method === "GET") {
        app.get(routePath, ...handler);
      } else if (endpoint.method === "POST") {
        app.post(routePath, ...handler);
      } else if (endpoint.method === "PUT") {
        app.put(routePath, ...handler);
      } else if (endpoint.method === "DELETE") {
        app.delete(routePath, ...handler);
      }
    }
  }
}
