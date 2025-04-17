# Centralized Container/Service Configuration Guide

**File:** `config/containers.yaml`  
**Maintainer:** Configuration Manager  
**Last Updated:** 2025-04-15

---

## Purpose

This document describes the structure, usage, and environment variable mappings for the centralized container/service configuration file: `config/containers.yaml`.  
This file is the **single source of truth** for all parameters used in Dockerfiles and `docker-compose.yaml` for the following services:
- Next.js Frontend (`frontend`)
- NestJS Backend (`backend`)
- Supabase Database (`supabase`)
- Neo4j Database (`neo4j`)

All secrets and sensitive values **must** be provided via environment variables.  
**No hardcoded secrets** are permitted in Dockerfiles, compose files, or application code.

---

## Structure

```yaml
version: "1.0.0"
last_updated: "2025-04-15"
author: "config-manager"
services:
  frontend:
    name: "frontend"
    image: "biobank-frontend:latest"
    build_context: "./frontend"
    dockerfile: "Dockerfile.frontend"
    ports:
      - 3000:3000
    env:
      NODE_ENV: "development"
      NEXT_PUBLIC_SUPABASE_URL: "${SUPABASE_URL}"
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}"
    resource_limits:
      cpus: "0.5"
      memory: "512m"
  backend:
    name: "backend"
    image: "biobank-backend:latest"
    build_context: "./backend"
    dockerfile: "Dockerfile.backend"
    ports:
      - 4000:4000
    env:
      NODE_ENV: "development"
      SUPABASE_URL: "${SUPABASE_URL}"
      SUPABASE_SERVICE_ROLE_KEY: "${SUPABASE_SERVICE_ROLE_KEY}"
      NEO4J_URI: "${NEO4J_URI}"
      NEO4J_USER: "${NEO4J_USER}"
      NEO4J_PASSWORD: "${NEO4J_PASSWORD}"
      API_KEY: "${API_KEY}"
    resource_limits:
      cpus: "0.5"
      memory: "512m"
  supabase:
    name: "supabase"
    image: "supabase/postgres:15.1.0.116"
    ports:
      - 5432:5432
    env:
      POSTGRES_PASSWORD: "${SUPABASE_DB_PASSWORD}"
      POSTGRES_DB: "postgres"
    volumes:
      - supabase-data:/var/lib/postgresql/data
    resource_limits:
      cpus: "0.5"
      memory: "1g"
  neo4j:
    name: "neo4j"
    image: "neo4j:5.15"
    ports:
      - 7474:7474
      - 7687:7687
    env:
      NEO4J_AUTH: "${NEO4J_USER}/${NEO4J_PASSWORD}"
    volumes:
      - neo4j-data:/data
    resource_limits:
      cpus: "0.5"
      memory: "1g"
volumes:
  supabase-data:
    driver: local
  neo4j-data:
    driver: local
```

---

## Parameter Definitions

- **name**: Logical service name (string)
- **image**: Docker image name/tag (string)
- **build_context**: Path to build context for Dockerfile (string)
- **dockerfile**: Dockerfile name (string)
- **ports**: List of port mappings (host:container, int:int)
- **env**: Key-value pairs for environment variables.  
  - **Secrets and sensitive values must be referenced as `${ENV_VAR}` and provided via .env or deployment environment.**
- **resource_limits**: CPU and memory limits for the container (string)
- **volumes**: List of volume mappings for persistent data (if applicable)

---

## Environment Variable Mapping

All secrets and sensitive values must be provided via environment variables.  
**Example mappings:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (from Supabase project settings)
- `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` (from Neo4j Aura or local instance)
- `API_KEY` (generated for service-to-service authentication)
- `SUPABASE_DB_PASSWORD` (for Supabase Postgres)

**Local development:**  
Provide these in a `.env` file (never commit secrets to version control).

**Production/CI/CD:**  
Set these as environment variables in Vercel, GitHub Actions, or your deployment platform.

---

## Usage Protocol

- **Do not hardcode any secrets or sensitive values** in Dockerfiles, docker-compose.yaml, or application code.
- Always reference config/containers.yaml for all service parameters.
- Update this file before making any changes to container/service configuration.
- Validate configuration at load time in application code (implement validation logic as needed).
- Update this documentation immediately after any change to config/containers.yaml.

---

## Example: Using in Docker Compose

Reference the parameters in `config/containers.yaml` when writing `docker-compose.yaml`:

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    image: biobank-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
  # ... other services as defined above
```

---

## Update & Validation Protocol

1. **Update config/containers.yaml** for any new service, port, or environment variable.
2. **Validate**: Ensure all referenced environment variables are present in `.env` or deployment environment.
3. **Document**: Immediately update this guide with any changes.
4. **Audit**: Periodically check Dockerfiles and compose files for compliance (no hardcoded secrets, all values sourced from config/containers.yaml and env).

---

## Contact

For questions or to propose changes, contact the Configuration Manager.