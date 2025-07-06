# Docker Compose Development Environment

This guide explains how to run and monitor the Dormie application using Docker Compose for development.

## Quick Start

```bash
# Navigate to project root
cd /home/mushfiqur-rahman/Dormie

# First time setup (builds images)
docker-compose -f docker-compose.dev.yml up --build

# Subsequent runs (if no Dockerfile changes)
docker-compose -f docker-compose.dev.yml up

# Run in background (detached mode)
docker-compose -f docker-compose.dev.yml up -d
```

## Services Overview

| Service  | URL                    | Port | Description                    |
|----------|------------------------|------|--------------------------------|
| Frontend | http://localhost:3000  | 3000 | Next.js development server     |
| Backend  | http://localhost:8080  | 8080 | Spring Boot application        |
| Database | localhost:5432         | 5432 | PostgreSQL database            |

## Monitoring & Debugging

### View All Service Logs (Live)
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### View Specific Service Logs
```bash
# Backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Frontend logs
docker-compose -f docker-compose.dev.yml logs -f frontend

# Database logs
docker-compose -f docker-compose.dev.yml logs -f db
```

### View Recent Logs (without following)
```bash
# Last 100 lines from all services
docker-compose -f docker-compose.dev.yml logs --tail=100

# Last 50 lines from backend only
docker-compose -f docker-compose.dev.yml logs --tail=50 backend
```

### Check Service Status
```bash
# List all running containers
docker-compose -f docker-compose.dev.yml ps

# Show service health status
docker-compose -f docker-compose.dev.yml ps --services
```

### Access Container Shell
```bash
# Backend container shell
docker-compose -f docker-compose.dev.yml exec backend sh

# Frontend container shell
docker-compose -f docker-compose.dev.yml exec frontend sh

# Database container shell
docker-compose -f docker-compose.dev.yml exec db sh
```

### Database Connection (from inside db container)
```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.dev.yml exec db psql -U hms_user -d hmsdb
```

## Service Management

### Stop Services
```bash
# Stop all services (keeps containers)
docker-compose -f docker-compose.dev.yml stop

# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Stop and remove containers + volumes (deletes database data)
docker-compose -f docker-compose.dev.yml down -v
```

### Restart Services
```bash
# Restart all services
docker-compose -f docker-compose.dev.yml restart

# Restart specific service
docker-compose -f docker-compose.dev.yml restart backend
```

### Rebuild Images
```bash
# Rebuild all images
docker-compose -f docker-compose.dev.yml build

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build backend

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build
```

## Development Features

### Live Reload
- **Frontend**: Changes in `/Dormie-Frontend` auto-reload via Next.js dev server
- **Backend**: Changes in `/Dormie-Backend/src` auto-reload (if Spring Boot DevTools is configured)
- **Maven dependencies**: Cached in `~/.m2` volume for faster builds

### Database Persistence
- Database data persists in `postgres_data` volume
- Data survives container restarts
- Use `down -v` to reset database

## Environment Variables

### Backend Environment
- `SPRING_PROFILES_ACTIVE=dev`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/hmsdb`

### Frontend Environment
- `NODE_ENV=development`
- `CHOKIDAR_USEPOLLING=true` (better file watching in Docker)

### Database Environment
- `POSTGRES_USER=hms_user`
- `POSTGRES_PASSWORD=hms_password`
- `POSTGRES_DB=hmsdb`

## Troubleshooting

### Database Connection Issues
```bash
# Check database health
docker-compose -f docker-compose.dev.yml exec db pg_isready -U hms_user -d hmsdb

# View database logs
docker-compose -f docker-compose.dev.yml logs db
```

### Port Conflicts
If ports 3000, 8080, or 5432 are already in use:
```bash
# Check what's using the ports
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8080
sudo netstat -tlnp | grep :5432
```

### Clean Start (removes everything)
```bash
# Stop and remove everything
docker-compose -f docker-compose.dev.yml down -v

# Remove all unused Docker resources
docker system prune -a

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml up --build
```


### warning
if you can't start db then make sure your 5432 port is open on local machine.

