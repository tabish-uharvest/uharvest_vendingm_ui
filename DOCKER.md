# Docker Setup for UHarvest Vending Machine UI

This project includes Docker configuration for containerized deployment of the React TypeScript + Express application.

## Files Created

- `Dockerfile` - Multi-stage build for production deployment
- `docker-compose.yml` - Service orchestration
- `.dockerignore` - Excludes unnecessary files from build context

## Building and Running

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop the application
docker-compose down
```

### Option 2: Using Docker Commands

```bash
# Build the image
docker build -t uharvest-ui .

# Run the container
docker run -p 5001:5001 --name uharvest-ui-container uharvest-ui

# Run in background
docker run -d -p 5001:5001 --name uharvest-ui-container uharvest-ui
```

## Environment Variables

You can set environment variables in the `docker-compose.yml` or pass them with `-e`:

```bash
docker run -p 5001:5001 -e NODE_ENV=production -e PORT=5001 uharvest-ui
```

## Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2025-08-21T10:00:00.000Z",
  "uptime": 123.456
}
```

## Production Deployment

The Docker image is optimized for production with:

- Multi-stage build to reduce image size
- Non-root user for security
- Health checks for monitoring
- Proper caching of dependencies
- Static file serving

## Accessing the Application

Once running, the application will be available at:
- Web UI: http://localhost:5001
- API: http://localhost:5001/api/*
- Health Check: http://localhost:5001/health
