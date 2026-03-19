/**
 * Generic upstream proxy handler.
 * Forwards request to upstream service with API key injection.
 */

import type { ServiceDef } from "../services/catalog.js";

export interface ProxyResult {
  status: number;
  headers: Record<string, string>;
  body: ReadableStream<Uint8Array> | null;
}

function getApiKey(service: ServiceDef): string {
  const key = process.env[service.apiKeyEnvVar];
  if (!key) {
    throw new Error(`Missing API key: set ${service.apiKeyEnvVar} environment variable`);
  }
  return key;
}

function buildAuthHeader(service: ServiceDef, apiKey: string): Record<string, string> {
  const header = service.apiKeyHeader;

  // Some services use Bearer token pattern
  if (header === "Authorization") {
    return { Authorization: `Bearer ${apiKey}` };
  }

  // Others use custom headers with raw key
  return { [header]: apiKey };
}

export async function proxyToUpstream(
  request: Request,
  service: ServiceDef,
  upstreamPath: string,
): Promise<Response> {
  const apiKey = getApiKey(service);
  const authHeaders = buildAuthHeader(service, apiKey);

  const upstreamUrl = `${service.upstreamBaseUrl}${upstreamPath}`;

  // Copy original URL search params
  const originalUrl = new URL(request.url);
  const targetUrl = new URL(upstreamUrl);
  originalUrl.searchParams.forEach((val, key) => {
    targetUrl.searchParams.set(key, val);
  });

  // Build upstream headers — forward content-type and accept, inject auth
  const upstreamHeaders: Record<string, string> = {
    ...authHeaders,
  };

  const contentType = request.headers.get("content-type");
  if (contentType) {
    upstreamHeaders["Content-Type"] = contentType;
  }

  const accept = request.headers.get("accept");
  if (accept) {
    upstreamHeaders["Accept"] = accept;
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: upstreamHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      // @ts-expect-error duplex needed for streaming body
      duplex: "half",
    });

    // Return upstream response with CORS headers
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set("X-Upstream-Status", String(upstreamResponse.status));
    responseHeaders.set("X-Gateway-Service", service.slug);

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Upstream error", message: (err as Error).message }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
