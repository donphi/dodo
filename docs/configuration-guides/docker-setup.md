# Docker Setup and Build Fixes

**File:** `docs/configuration-guides/docker-setup.md`  
**Maintainer:** Documentation Scribe  
**Last Updated:** 2025-04-15

---

## Purpose

This document describes the Docker setup for the project, including recent build fixes, configuration details, and troubleshooting tips. It covers both the Next.js frontend and NestJS backend Docker configurations.

---

## Recent Docker Build Fixes

The following fixes were implemented to resolve Docker build issues:

1. **Removal of package-lock.json and yarn.lock references in Dockerfile.frontend**
   - The build now relies solely on `package.json` for dependency installation
   - This prevents build failures when lock files are missing or inconsistent

2. **Creation of minimal frontend structure**
   - `frontend/package.json`: Basic Next.js dependencies
   - `frontend/tsconfig.json`: TypeScript configuration for Next.js
   - `frontend/pages/index.tsx`: Minimal page component

3. **Creation of backend/tsconfig.json**
   - Provides TypeScript configuration for the NestJS backend
   - Ensures proper TypeScript compilation during the build process

4. **Addition of frontend/public/.gitkeep placeholder**
   - Ensures the public directory exists in the repository
   - Prevents build failures due to missing directories

---

## Docker Configuration Overview

### Frontend (Next.js)

The frontend Docker setup uses a multi-stage build process:

```dockerfile
# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY ./frontend/package.json ./
RUN npm install
COPY ./frontend .
# Build with environment variables
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
# Runtime env vars
CMD ["npm", "start"]
```

### Backend (NestJS)

The backend Docker setup also uses a multi-stage build:

```dockerfile
# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY ./backend/package.json ./
RUN npm install
COPY ./backend .
# Build with environment variables
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 4000
# Start NestJS in production mode
CMD ["node", "dist/main"]
```

---

## Environment Variable Requirements

The Docker setup requires several environment variables to be properly set:

### Frontend Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (required at build time and runtime)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (required at build time and runtime)

### Backend Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `NEO4J_URI`: Neo4j database URI
- `NEO4J_USER`: Neo4j database username
- `NEO4J_PASSWORD`: Neo4j database password
- `API_KEY`: API key for service-to-service authentication

### Authentication Architecture

**Important Note**: JWT authentication is directly handled by Supabase and doesn't require a separate `JWT_SECRET` environment variable. Supabase manages the entire JWT lifecycle internally:

- Token generation
- Signature validation
- Expiration handling
- Role-based claims

The frontend uses Supabase's client library with the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to authenticate users, while the backend uses the `SUPABASE_SERVICE_ROLE_KEY` to verify tokens and perform privileged operations.

### Environment Variable Setup

Environment variables can be provided in several ways:

1. **Local Development**: Create a `.env` file in the project root (use `.env.example` as a template)
2. **Docker Compose**: Variables are passed from the host environment or `.env` file to containers
3. **CI/CD Pipeline**: Set as secure environment variables in GitHub Actions/GitLab CI/CD
4. **Production**: Set in Vercel environment settings

Example `.env` file structure:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
API_KEY=your-api-key
SUPABASE_DB_PASSWORD=postgres-password
# Note: JWT_SECRET is not required as Supabase handles JWT authentication internally
```

---

## Troubleshooting Common Docker Build Issues

### 1. Missing Environment Variables

**Symptoms:**
- Build fails with errors about undefined environment variables
- Runtime errors about missing configuration

**Solutions:**
- Ensure all required environment variables are defined in your `.env` file
- Verify environment variables are correctly passed to Docker in `docker-compose.yaml`
- Check for typos in variable names (e.g., `NEXT_PUBLIC_SUPABASE_URL` vs `NEXT_PUBLIC_SUPABASE_URL`)
- Remember that `JWT_SECRET` is not required as Supabase handles JWT authentication internally

### 2. TypeScript Compilation Errors

**Symptoms:**
- Build fails with TypeScript errors
- Messages about missing types or incompatible types

**Solutions:**
- Ensure `tsconfig.json` exists in both frontend and backend directories
- Verify TypeScript dependencies are installed
- Fix any type errors in the codebase

### 3. Next.js Build Failures

**Symptoms:**
- Frontend build fails during the Docker build process
- Errors about missing dependencies or modules

**Solutions:**
- Ensure minimal Next.js structure exists:
  - `frontend/package.json` with required dependencies
  - `frontend/tsconfig.json` with proper configuration
  - `frontend/pages/index.tsx` or other entry point
  - `frontend/public/` directory (with at least `.gitkeep`)
- Check for compatibility between Next.js and React versions

### 4. Node Module Resolution Issues

**Symptoms:**
- "Module not found" errors during build
- Dependency resolution problems

**Solutions:**
- Clear node_modules and reinstall dependencies
- Ensure package.json contains all required dependencies
- Check for circular dependencies

### 5. Docker Caching Issues

**Symptoms:**
- Changes to code not reflected in the Docker build
- Outdated dependencies being used

**Solutions:**
- Use `docker-compose build --no-cache` to rebuild without cache
- Ensure proper layer ordering in Dockerfile (copy package.json first, then install, then copy code)

### 6. Permission Issues

**Symptoms:**
- Permission denied errors during build or runtime
- Unable to write to directories

**Solutions:**
- Ensure proper user permissions in Dockerfiles
- Check volume mount permissions in docker-compose.yaml

### 7. Authentication Issues

**Symptoms:**
- Authentication failures in the application
- "Invalid JWT" or "JWT verification failed" errors
- Users unable to log in or access protected resources

**Solutions:**
- Verify Supabase URL and keys are correctly set in environment variables
- Ensure you're using Supabase's built-in authentication methods rather than custom JWT handling
- Check that frontend is correctly passing authentication tokens to backend services
- Remember that Supabase handles JWT authentication internally - no separate JWT_SECRET is needed

---

## Best Practices

1. **Environment Variables**
   - Never hardcode sensitive information in Dockerfiles or application code
   - Use `.env` for local development and secure environment variables for production
   - Prefix client-side variables with `NEXT_PUBLIC_` for Next.js
   - Rely on Supabase's built-in JWT authentication rather than implementing custom JWT handling

2. **Docker Optimization**
   - Use multi-stage builds to reduce final image size
   - Order Dockerfile commands to maximize layer caching (dependencies first, then code)
   - Include only necessary files in the final image

3. **TypeScript Configuration**
   - Maintain separate `tsconfig.json` files for frontend and backend
   - Enable strict type checking for better code quality
   - Regularly update TypeScript and type definitions

4. **Docker Compose Usage**
   - Use `docker-compose -f config/docker-compose.yaml up --build` for development
   - Set appropriate resource limits for containers
   - Define proper service dependencies and startup order

5. **Continuous Integration**
   - Include Docker build in CI/CD pipeline
   - Validate environment variables before deployment
   - Run tests within Docker containers to ensure consistency

---

## Related Documentation

- [Centralized Container/Service Configuration Guide](./containers-config.md)
- [Environment Variable Setup](../setup/environment-variables.md) (if exists)
- [Deployment Guide](../deployment/deployment-guide.md) (if exists)

---

## Contact

For questions or to propose changes, contact the Documentation Scribe or DevOps Engineer.