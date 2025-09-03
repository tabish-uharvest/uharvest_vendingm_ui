# Use Node.js official image
FROM node:22.16.0-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (needed for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Clean cache but keep all dependencies (some might be needed at runtime)
RUN npm cache clean --force

# Change ownership to non-root user
RUN chown -R appuser:nodejs /app
USER appuser

# Expose port
EXPOSE 5001
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Start the application
CMD ["npm", "start"]
