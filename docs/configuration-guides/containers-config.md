# Centralized Container/Service Configuration Guide

**File:** `config/containers.yaml`
**Maintainer:** Configuration Manager
**Last Updated:** 2025-04-18

---

## Purpose

This document describes the structure, usage, and environment variable mappings for the centralized container/service configuration file: `config/containers.yaml`.
This file is the **single source of truth** for all parameters used in Dockerfiles and `docker-compose.yaml` for the following services:
- Next.js Frontend (`frontend`)

All secrets and sensitive values **must** be provided via environment variables.
**No hardcoded secrets** are permitted in Dockerfiles, compose files, or application code.

---

## Structure

```yaml
version: "1.0.0"
last_updated: "2025-04-18"
author: "config-manager"
description: |
  Defines all container/service parameters for the Next.js frontend.
  No hardcoded secrets. All values are referenced by Dockerfiles and docker-compose.yml.
  Update this file before making any changes to container/service configuration.
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
      NEXT_PUBLIC_SUPABASE_URL: "${NEXT_PUBLIC_SUPABASE_URL}"
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
    resource_limits:
      cpus: "0.5"
      memory: "512m"
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

---

## Environment Variable Mapping

All secrets and sensitive values must be provided via environment variables.
**Example mappings:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase project settings)

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
      context: .
      dockerfile: Dockerfile.frontend
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    image: biobank-frontend:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
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