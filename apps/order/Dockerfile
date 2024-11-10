FROM node:iron-alpine AS builder
RUN npm install -g pnpm@latest
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY apps/order/package.json apps/order/
COPY apps/order/tsconfig.json apps/order/
RUN pnpm install --frozen-lockfile

COPY apps/order apps/order

RUN pnpm --filter order build

FROM node:iron-alpine
RUN npm install -g pnpm@latest

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/order ./dist/apps/order

EXPOSE 3000

CMD ["node", "dist/apps/order/main.js"]
