FROM node:24-alpine AS client-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:24-alpine AS server-builder
RUN apk add --no-cache openssl
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
COPY server/prisma ./prisma
RUN npm ci && ./node_modules/.bin/prisma generate
COPY server/ ./
RUN npm run build

FROM node:24-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app/server
COPY --from=server-builder /app/server/package.json ./
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/prisma ./prisma
# The seed imports this password hashing helper through tsx.
COPY --from=server-builder /app/server/src/lib/password.ts ./src/lib/password.ts
COPY --from=client-builder /app/client/dist /app/client/dist
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]
