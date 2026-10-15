# Stage 1: Build stage (node 20-slim) [ПРЕДПОЛОЖЕНИЕ — уточнить в документации]
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime stage (node 20-slim) [ПРЕДПОЛОЖЕНИЕ — уточнить в документации]
FROM node:20-slim AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
# Включаем prisma CLI для выполнения 'prisma migrate deploy' в production
RUN npm ci

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
