FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./

# Copy router package
COPY router/package.json ./router/
COPY router/tsconfig.json ./router/

# Install dependencies (workspace-aware)
RUN npm install --workspace=router --include-workspace-root

# Copy source
COPY router/src ./router/src

# Build
RUN npm run build --workspace=router

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/router/package.json ./router/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/router/node_modules ./router/node_modules 2>/dev/null || true
COPY --from=builder /app/router/dist ./router/dist

ENV NODE_ENV=production
ENV PORT=3100

EXPOSE 3100

CMD ["node", "router/dist/index.js"]
