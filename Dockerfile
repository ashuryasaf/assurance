FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++ openssl

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG BUILD_DATE=unknown
RUN echo "Build date: $BUILD_DATE"

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Force a placeholder DATABASE_URL during build (Prisma generate only).
ENV DATABASE_URL="file:./data/app.db"

RUN npx prisma generate
RUN npm run build

# ---- Runtime ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL="file:./data/app.db"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# Runtime data dir (SQLite DB + uploads). On Railway attach a Railway Volume
# at /app/data; on plain Docker pass `-v ashuri-data:/app/data`. The Docker
# `VOLUME` directive is intentionally omitted because Railway rejects it.
RUN mkdir -p /app/data /app/data/uploads && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000

CMD ["node", "scripts/start.mjs"]
