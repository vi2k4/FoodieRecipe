# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN corepack enable


FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile


FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma.config.ts tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm exec prisma generate
RUN pnpm build


FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Copy dependencies, bao gồm Prisma CLI và tsx
COPY --from=builder /app/node_modules ./node_modules

# Copy mã NestJS đã build
COPY --from=builder /app/dist ./dist

# Copy schema, migrations và seed
COPY --from=builder /app/prisma ./prisma

# Copy cấu hình Prisma 7
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy Prisma Client đã generate để seed.ts có thể import:
# ../src/generated/prisma/client
COPY --from=builder /app/src/generated ./src/generated

COPY package.json ./package.json

EXPOSE 3001

# Tự chạy migration rồi mới khởi động NestJS
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec node dist/src/main.js"]