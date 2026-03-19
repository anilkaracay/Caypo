/**
 * Gateway metrics — request counts, response times, payment stats.
 * Exported at /metrics endpoint.
 */

export interface ServiceMetrics {
  requests: number;
  errors: number;
  totalResponseTimeMs: number;
  paymentsAccepted: number;
  paymentsFailed: number;
  volumeUSDCx: number;
}

export interface GatewayMetrics {
  startedAt: string;
  uptimeSeconds: number;
  totalRequests: number;
  totalErrors: number;
  totalPayments: number;
  totalVolumeUSDCx: number;
  services: Record<string, ServiceMetrics>;
}

const startedAt = new Date().toISOString();
const serviceMetrics: Record<string, ServiceMetrics> = {};

function getService(slug: string): ServiceMetrics {
  if (!serviceMetrics[slug]) {
    serviceMetrics[slug] = {
      requests: 0,
      errors: 0,
      totalResponseTimeMs: 0,
      paymentsAccepted: 0,
      paymentsFailed: 0,
      volumeUSDCx: 0,
    };
  }
  return serviceMetrics[slug];
}

export function recordRequest(slug: string, responseTimeMs: number, isError: boolean): void {
  const m = getService(slug);
  m.requests++;
  m.totalResponseTimeMs += responseTimeMs;
  if (isError) m.errors++;
}

export function recordPayment(slug: string, accepted: boolean, amountUSDCx: number): void {
  const m = getService(slug);
  if (accepted) {
    m.paymentsAccepted++;
    m.volumeUSDCx += amountUSDCx;
  } else {
    m.paymentsFailed++;
  }
}

export function getMetrics(): GatewayMetrics {
  let totalRequests = 0;
  let totalErrors = 0;
  let totalPayments = 0;
  let totalVolume = 0;

  for (const m of Object.values(serviceMetrics)) {
    totalRequests += m.requests;
    totalErrors += m.errors;
    totalPayments += m.paymentsAccepted;
    totalVolume += m.volumeUSDCx;
  }

  return {
    startedAt,
    uptimeSeconds: Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
    totalRequests,
    totalErrors,
    totalPayments,
    totalVolumeUSDCx: Math.round(totalVolume * 1000000) / 1000000,
    services: { ...serviceMetrics },
  };
}
