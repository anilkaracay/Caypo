# ============================================================
# CAYPO MPP Gateway — Production Dockerfile
# ============================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.32.0 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @caypo/gateway-server... build

# --- Stage 2: Production ---
FROM node:20-alpine AS production
RUN apk add --no-cache curl && \
    addgroup -g 1001 -S caypo && \
    adduser -S caypo -u 1001

WORKDIR /app

# Copy only built artifacts and production deps
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/gateway-server/dist ./dist
COPY --from=build /app/apps/gateway-server/package.json ./package.json
COPY --from=build /app/packages/gateway/dist ./packages/gateway/dist
COPY --from=build /app/packages/gateway/package.json ./packages/gateway/package.json
COPY --from=build /app/packages/mpp/dist ./packages/mpp/dist
COPY --from=build /app/packages/mpp/package.json ./packages/mpp/package.json

USER caypo

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
