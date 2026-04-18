FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./

COPY router/package.json router/tsconfig.json ./router/
COPY builderbee-cli/package.json builderbee-cli/tsconfig.json ./builderbee-cli/
COPY aob-cli/package.json aob-cli/tsconfig.json ./aob-cli/
COPY centaurion-cli/package.json centaurion-cli/tsconfig.json ./centaurion-cli/

RUN npm ci

COPY router/src ./router/src
COPY builderbee-cli/src ./builderbee-cli/src
COPY aob-cli/src ./aob-cli/src
COPY centaurion-cli/src ./centaurion-cli/src

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/router/package.json /app/router/dist ./router/
COPY --from=builder /app/router/dist ./router/dist

COPY --from=builder /app/builderbee-cli/package.json ./builderbee-cli/
COPY --from=builder /app/builderbee-cli/dist ./builderbee-cli/dist

COPY --from=builder /app/aob-cli/package.json ./aob-cli/
COPY --from=builder /app/aob-cli/dist ./aob-cli/dist

COPY --from=builder /app/centaurion-cli/package.json ./centaurion-cli/
COPY --from=builder /app/centaurion-cli/dist ./centaurion-cli/dist

COPY autoresearch ./autoresearch

ENV NODE_ENV=production
ENV PORT=3100

EXPOSE 3100

CMD ["node", "router/dist/index.js"]
