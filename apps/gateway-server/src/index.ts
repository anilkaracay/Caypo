/**
 * CAYPO MPP Gateway — Node.js server entry point.
 * Runs the Hono app on @hono/node-server.
 */

import { serve } from "@hono/node-server";
import { app } from "@caypo/canton-gateway";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`CAYPO MPP Gateway running on http://localhost:${info.port}`);
  console.log(`  Health: http://localhost:${info.port}/health`);
  console.log(`  Services: http://localhost:${info.port}/api/services`);
  console.log(`  Discovery: http://localhost:${info.port}/llms.txt`);
});
