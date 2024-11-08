FROM node:iron-alpine AS builder
RUN npm install -g pnpm@latest
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY apps/invoice/package.json apps/invoice/
COPY apps/invoice/tsconfig.json apps/invoice/
RUN pnpm install --frozen-lockfile

COPY apps/invoice apps/invoice

RUN pnpm --filter invoice build

FROM node:iron-alpine
RUN npm install -g pnpm@latest

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/invoice ./dist/apps/invoice

EXPOSE 3001

CMD ["node", "dist/apps/invoice/main.js"]
