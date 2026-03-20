import { FALLBACK_SCENARIOS } from "@/lib/demo-fallback";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json() as { scenario: string };
  const scenarioId = body.scenario;
  const lines = FALLBACK_SCENARIOS[scenarioId];

  if (!lines) {
    return new Response(JSON.stringify({ error: "Unknown scenario" }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const line of lines) {
        const data = JSON.stringify(line);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        // Variable delay based on line type
        const delay = line.type === "gap" ? 100
          : line.type === "stats" ? 200
          : line.type === "box" ? 300
          : line.style === "success" ? 250
          : line.style === "command" ? 150
          : 120;
        await new Promise(r => setTimeout(r, delay));
      }
      controller.enqueue(encoder.encode(`data: {"type":"done"}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
