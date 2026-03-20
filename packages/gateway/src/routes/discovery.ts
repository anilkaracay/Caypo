/**
 * Discovery routes: /api/services, /llms.txt, /health
 */

import { Hono } from "hono";
import { services, totalEndpoints } from "../services/catalog.js";

export function registerDiscoveryRoutes(app: Hono): void {
  // JSON service catalog
  app.get("/api/services", (c) => {
    return c.json({
      gateway: "mpp.caypo.xyz",
      protocol: "MPP (Micropayment Protocol)",
      paymentMethod: "canton",
      totalServices: services.length,
      totalEndpoints,
      services: services.map((s) => ({
        name: s.name,
        slug: s.slug,
        description: s.description,
        categories: s.categories,
        endpoints: s.endpoints.map((e) => ({
          method: e.method,
          path: `/${s.slug}${e.path}`,
          description: e.description,
          price: `${e.price} USDCx`,
        })),
      })),
    });
  });

  // Agent discovery file (llms.txt format)
  app.get("/llms.txt", (c) => {
    const lines: string[] = [
      "# CAYPO MPP Gateway",
      "# Agent finance on institutional rails",
      "# Payment: Canton CIP-56 TransferPreapproval (USDCx)",
      "",
      `> Total services: ${services.length}`,
      `> Total endpoints: ${totalEndpoints}`,
      `> Payment method: canton (HTTP 402 + WWW-Authenticate)`,
      "",
    ];

    for (const s of services) {
      lines.push(`## ${s.name} (/${s.slug})`);
      lines.push(`${s.description}`);
      for (const e of s.endpoints) {
        lines.push(`- ${e.method} /${s.slug}${e.path} — ${e.description} [${e.price} USDCx]`);
      }
      lines.push("");
    }

    return c.text(lines.join("\n"), 200, { "Content-Type": "text/plain" });
  });

  // Health check
  app.get("/health", (c) => {
    return c.json({
      status: "ok",
      services: services.length,
      endpoints: totalEndpoints,
      version: "0.1.0",
    });
  });
}
