#!/bin/bash
#
# CAYPO Gateway — Production Deployment
#
# Usage:
#   ./scripts/deploy-gateway.sh <server-ip>
#   ./scripts/deploy-gateway.sh 84.32.223.16
#
# Prerequisites:
#   - SSH access to the server
#   - Docker and Docker Compose on the server
#   - .env.production file configured
#   - Caddy installed on the server
#

set -e

SERVER="${1:?Usage: ./scripts/deploy-gateway.sh <server-ip>}"
REMOTE_DIR="/root/caypo-gateway"
SSH="ssh -o StrictHostKeyChecking=no root@$SERVER"

echo ""
echo "  CAYPO Gateway Deployment"
echo "  ========================"
echo "  Server: $SERVER"
echo "  Remote: $REMOTE_DIR"
echo ""

# 1. Check .env.production exists
if [ ! -f apps/gateway-server/.env.production ]; then
  echo "  [FAIL] apps/gateway-server/.env.production not found"
  echo "  Copy .env.production.example and fill in your API keys."
  exit 1
fi
echo "  [OK] .env.production found"

# 2. Build locally
echo "  [..] Building packages..."
pnpm build 2>&1 | tail -1
echo "  [OK] Build complete"

# 3. Create remote directory
echo "  [..] Preparing remote directory..."
$SSH "mkdir -p $REMOTE_DIR" 2>/dev/null
echo "  [OK] Remote directory ready"

# 4. Copy files
echo "  [..] Uploading files..."
scp -o StrictHostKeyChecking=no -r \
  apps/gateway-server/Dockerfile \
  apps/gateway-server/docker-compose.prod.yml \
  apps/gateway-server/.env.production \
  apps/gateway-server/Caddyfile \
  apps/gateway-server/dist/ \
  apps/gateway-server/package.json \
  root@$SERVER:$REMOTE_DIR/ 2>/dev/null

# Copy package dependencies
scp -o StrictHostKeyChecking=no -r \
  packages/gateway/dist/ \
  root@$SERVER:$REMOTE_DIR/packages-gateway-dist/ 2>/dev/null

scp -o StrictHostKeyChecking=no -r \
  packages/mpp/dist/ \
  root@$SERVER:$REMOTE_DIR/packages-mpp-dist/ 2>/dev/null

echo "  [OK] Files uploaded"

# 5. Start with Docker Compose
echo "  [..] Starting gateway..."
$SSH "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build" 2>&1 | tail -3
echo "  [OK] Gateway starting"

# 6. Wait and verify
echo "  [..] Waiting for health check..."
sleep 5
HEALTH=$($SSH "curl -sf http://localhost:3000/health 2>/dev/null" || echo "FAIL")
if echo "$HEALTH" | grep -q "ok"; then
  echo "  [OK] Gateway healthy: $HEALTH"
else
  echo "  [WARN] Health check: $HEALTH"
fi

# 7. Caddy config
echo ""
echo "  Caddy configuration:"
echo "  Copy the Caddyfile to your Caddy config directory:"
echo "    sudo cp $REMOTE_DIR/Caddyfile /etc/caddy/Caddyfile"
echo "    sudo systemctl reload caddy"
echo ""
echo "  Then verify: curl https://mpp.caypo.xyz/health"
echo ""
echo "  [DONE] Deployment complete"
echo ""
