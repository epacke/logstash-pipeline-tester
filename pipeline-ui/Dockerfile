# Build stage
FROM node:23-alpine3.21 as compile-image

# Install dependencies only when needed
WORKDIR /home/node/app

# Install frontend dependencies
COPY ./frontend/package*.json ./frontend/
WORKDIR /home/node/app/frontend
RUN npm ci

# Install backend dependencies
COPY ./backend/package*.json ../backend/
WORKDIR /home/node/app/backend
RUN npm ci --only=production && npm install --save-dev @types/node

# Build frontend
COPY ./frontend/ ../frontend/
WORKDIR /home/node/app/frontend
RUN npm run build

# Build backend
COPY ./backend ../backend/
WORKDIR /home/node/app/backend
RUN npm run build

# Production stage
FROM node:23-alpine3.21 as runtime-image

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/src/app

# Copy only necessary files from build stage
COPY --from=compile-image --chown=appuser:appgroup /home/node/app/backend/build/ ./
COPY --from=compile-image --chown=appuser:appgroup /home/node/app/frontend/build ./public
COPY --from=compile-image --chown=appuser:appgroup /home/node/app/backend/node_modules/ ./node_modules/

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "./index.js"]
