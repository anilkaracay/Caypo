FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@10.32.0 --activate

FROM base AS build
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @caypo/gateway-server... build

FROM base AS production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/gateway-server/dist ./dist
COPY --from=build /app/packages/gateway/dist ./packages/gateway/dist
COPY --from=build /app/packages/mpp/dist ./packages/mpp/dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
