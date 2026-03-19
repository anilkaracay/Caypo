#!/bin/bash
#
# CAYPO Canton Sandbox Setup (Binary approach)
#
# Downloads Canton 3.4.x binary and starts a sandbox with JSON Ledger API v2.
# Requires: Java 17+, curl
#
# Usage:
#   ./sandbox/setup-binary.sh
#   CANTON_VERSION=3.4.11 ./sandbox/setup-binary.sh
#

set -e

CANTON_VERSION="${CANTON_VERSION:-3.4.11}"
CANTON_DIR="./sandbox/.canton"
CANTON_BIN="$CANTON_DIR/bin/canton"
JSON_API_PORT=7575

echo ""
echo "  CAYPO Canton Sandbox Setup"
echo "  ================================"
echo ""

# -------------------------------------------------------------------------
# 1. Check Java
# -------------------------------------------------------------------------
if ! command -v java &>/dev/null; then
  echo "  [FAIL] Java 17+ is required."
  echo ""
  echo "  Install with:"
  echo "    macOS:  brew install openjdk@17"
  echo "    Linux:  sudo apt install openjdk-17-jdk"
  echo ""
  exit 1
fi

JAVA_VER=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VER" -lt 17 ] 2>/dev/null; then
  echo "  [FAIL] Java 17+ required, found Java $JAVA_VER"
  exit 1
fi
echo "  [OK] Java $JAVA_VER detected"

# -------------------------------------------------------------------------
# 2. Download Canton
# -------------------------------------------------------------------------
if [ ! -f "$CANTON_BIN" ]; then
  echo "  [..] Downloading Canton $CANTON_VERSION..."
  mkdir -p "$CANTON_DIR"

  DOWNLOAD_URL="https://github.com/digital-asset/canton/releases/download/v${CANTON_VERSION}/canton-open-source-${CANTON_VERSION}.tar.gz"

  if curl -fSL "$DOWNLOAD_URL" -o "$CANTON_DIR/canton.tar.gz" 2>/dev/null; then
    tar xzf "$CANTON_DIR/canton.tar.gz" -C "$CANTON_DIR" --strip-components=1
    rm "$CANTON_DIR/canton.tar.gz"
    chmod +x "$CANTON_BIN"
    echo "  [OK] Canton $CANTON_VERSION installed"
  else
    echo "  [WARN] Could not download Canton $CANTON_VERSION from GitHub."
    echo ""
    echo "  Canton 3.4+ may require enterprise access."
    echo "  Alternatives:"
    echo "    1. Install via Daml SDK: curl -sSL https://get.daml.com/ | sh"
    echo "    2. Use Docker (Canton 2.x): docker compose -f sandbox/docker-compose.yml up"
    echo "    3. Connect to a remote Canton node: CANTON_LEDGER_URL=https://... pnpm test:e2e"
    echo ""
    exit 1
  fi
else
  echo "  [OK] Canton already installed at $CANTON_BIN"
fi

# -------------------------------------------------------------------------
# 3. Build test DAML model (optional, requires daml CLI)
# -------------------------------------------------------------------------
DAR_FLAG=""
if command -v daml &>/dev/null; then
  echo "  [..] Building test DAML model..."
  cd sandbox/daml && daml build 2>/dev/null && cd ../..
  DAR_PATH="sandbox/daml/.daml/dist/caypo-test-token-0.0.1.dar"
  if [ -f "$DAR_PATH" ]; then
    DAR_FLAG="--dar $DAR_PATH"
    echo "  [OK] Test DAR built: $DAR_PATH"
  fi
else
  echo "  [SKIP] Daml SDK not found — sandbox will start without custom DAR"
fi

# -------------------------------------------------------------------------
# 4. Start Canton sandbox
# -------------------------------------------------------------------------
echo "  [..] Starting Canton sandbox on port $JSON_API_PORT..."

$CANTON_BIN sandbox --json-api-port $JSON_API_PORT $DAR_FLAG &
CANTON_PID=$!

echo $CANTON_PID > sandbox/.canton.pid
echo "  [..] PID: $CANTON_PID"

# -------------------------------------------------------------------------
# 5. Wait for JSON API
# -------------------------------------------------------------------------
echo "  [..] Waiting for JSON Ledger API..."
for i in $(seq 1 60); do
  if curl -sf http://localhost:$JSON_API_PORT/livez > /dev/null 2>&1; then
    echo ""
    echo "  [OK] Canton sandbox ready on http://localhost:$JSON_API_PORT"
    echo ""
    echo "  Endpoints:"
    echo "    Health:    curl http://localhost:$JSON_API_PORT/livez"
    echo "    Parties:   curl http://localhost:$JSON_API_PORT/v2/parties"
    echo "    Ledger:    curl http://localhost:$JSON_API_PORT/v2/state/ledger-end"
    echo ""
    echo "  Usage:"
    echo "    Run E2E:   pnpm test:e2e"
    echo "    Verify:    pnpm verify:canton"
    echo "    Stop:      ./sandbox/stop.sh"
    echo ""
    exit 0
  fi
  sleep 2
done

echo "  [FAIL] Timeout waiting for Canton sandbox (120s)"
kill $CANTON_PID 2>/dev/null
exit 1
