#!/bin/bash
#
# CAYPO E2E Test Runner
#
# Usage:
#   ./scripts/run-e2e.sh                          # default localhost:7575
#   ./scripts/run-e2e.sh http://remote:7575        # custom URL
#   CANTON_LEDGER_URL=http://... ./scripts/run-e2e.sh
#

set -e

CANTON_URL="${1:-${CANTON_LEDGER_URL:-http://localhost:7575}}"

echo ""
echo "  CAYPO E2E Test Runner"
echo "  ========================"
echo "  Canton URL: $CANTON_URL"
echo ""

# -------------------------------------------------------------------------
# 1. Check Canton is running
# -------------------------------------------------------------------------
echo "  Checking Canton connectivity..."
if curl -sf "$CANTON_URL/livez" > /dev/null 2>&1; then
  echo "  [OK] Canton is reachable"
else
  echo "  [FAIL] Canton not reachable at $CANTON_URL"
  echo ""
  echo "  Start the sandbox first:"
  echo "    ./sandbox/setup-binary.sh"
  echo ""
  echo "  Or point to an existing node:"
  echo "    ./scripts/run-e2e.sh https://your-canton-node:7575"
  echo ""
  exit 1
fi

# -------------------------------------------------------------------------
# 2. Check API version
# -------------------------------------------------------------------------
echo ""
echo "  Checking JSON Ledger API..."
API_RESPONSE=$(curl -sf "$CANTON_URL/v2/state/ledger-end" 2>/dev/null || echo "FAIL")
if [ "$API_RESPONSE" != "FAIL" ]; then
  echo "  [OK] JSON Ledger API v2 responding"
  echo "  Response: $API_RESPONSE"
else
  echo "  [WARN] /v2/state/ledger-end not available"
  echo "  This might be Canton 2.x (v1 API) or auth may be required"
fi

# -------------------------------------------------------------------------
# 3. Create test parties
# -------------------------------------------------------------------------
echo ""
echo "  Creating test parties..."

AGENT_PARTY=$(curl -sf -X POST "$CANTON_URL/v2/parties" \
  -H "Content-Type: application/json" \
  -d "{\"partyIdHint\":\"e2e-agent-$(date +%s)\", \"identityProviderId\":\"\"}" 2>/dev/null | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['partyDetails']['party'])" 2>/dev/null || echo "")

if [ -n "$AGENT_PARTY" ]; then
  echo "  [OK] Agent party: $AGENT_PARTY"
else
  echo "  [WARN] Could not create agent party (may need auth token)"
fi

SERVICE_PARTY=$(curl -sf -X POST "$CANTON_URL/v2/parties" \
  -H "Content-Type: application/json" \
  -d "{\"partyIdHint\":\"e2e-service-$(date +%s)\", \"identityProviderId\":\"\"}" 2>/dev/null | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['partyDetails']['party'])" 2>/dev/null || echo "")

if [ -n "$SERVICE_PARTY" ]; then
  echo "  [OK] Service party: $SERVICE_PARTY"
else
  echo "  [WARN] Could not create service party"
fi

# -------------------------------------------------------------------------
# 4. Run E2E tests
# -------------------------------------------------------------------------
echo ""
echo "  Running E2E tests..."
echo "  ===================="
echo ""

CANTON_LEDGER_URL="$CANTON_URL" pnpm test:e2e

echo ""
echo "  ===================="
echo "  E2E tests complete"
echo ""
