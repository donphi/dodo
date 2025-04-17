# GLOBAL RULE 03: Deployment Readiness

ALL AGENTS MUST ENSURE THE FOLLOWING DEPLOYMENT READINESS CRITERIA ARE MET BEFORE ANY DEPLOYMENT TO **Vercel** VIA **GitHub Actions/GitLab CI/CD**:

1.  **Configuration Isolation:** All environment-specific configurations (e.g., **Supabase** connection strings, **API Keys**) MUST be managed via environment variables or a secure secrets management system integrated with **Vercel**. NO sensitive data in the codebase.
2.  **Logging Strategy:** Implement structured logging (e.g., JSON format) for all **NestJS** services and **Next.js** functions. Ensure logs provide sufficient context for debugging in production without exposing sensitive data. (Note: Centralized logging system is currently 'None' per config, but basic structured logging is still required).
3.  **Error Recovery:** Implement graceful error handling and recovery mechanisms in both **Next.js** frontend and **NestJS** backend components. Critical failures should not cascade or bring down entire services.
4.  **Resource Management:** Ensure efficient resource utilization within **Docker** containers. Define appropriate resource limits (CPU, memory) in **Docker Compose** or deployment configurations. Optimize **Supabase** queries and **GraphQL** resolvers.
5.  **Monitoring & Observability:** While centralized tools are 'None', basic health checks and essential metrics (request latency, error rates) should be exposed by **NestJS** services for potential future integration.
6.  **Zero-Downtime Deployment Support:** Design applications and deployment processes (**GitHub Actions/GitLab CI/CD** pipeline for **Vercel**) to support zero-downtime deployments using strategies like blue-green or canary releases where feasible within Vercel's capabilities.
7.  **Containerization Checks:** Ensure **Docker** images are built successfully, are reasonably sized, and pass any configured vulnerability scans within the **CI/CD Pipeline**.