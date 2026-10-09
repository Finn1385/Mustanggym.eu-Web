# syntax=docker/dockerfile:1

FROM node:24-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---- dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
# --ignore-scripts: native deps (better-sqlite3, sharp, esbuild) ship prebuilt binaries, so no
# compiler is needed and no third-party install scripts run during the build.
RUN npm ci --no-audit --no-fund --ignore-scripts

# ---- build: no database needed, every page renders at request time ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm run build:scripts

# ---- runtime ----
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data

# curl: Coolify's health check runs `curl` (or `wget`) inside the container; the slim image has neither.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --no-create-home nextjs \
 && mkdir -p /data \
 && chown nextjs:nodejs /data

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/db/migrations ./db/migrations
COPY --from=build --chown=nextjs:nodejs /app/db/seed-media ./db/seed-media
COPY --from=build --chown=nextjs:nodejs /app/assets ./assets
COPY --from=build --chown=nextjs:nodejs /app/dist/scripts ./scripts

USER nextjs
VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

# Migrations, first-run seed and the optional first admin run inside the server (instrumentation.ts).
CMD ["node", "server.js"]
