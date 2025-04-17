# GLOBAL RULE 02: Security Protocols

ALL AGENTS MUST ADHERE TO THE FOLLOWING NON-NEGOTIABLE SECURITY PROTOCOLS FOR THE **TypeScript**, **Next.js**, **NestJS**, **Supabase**, **GraphQL**, and **Docker** STACK:

1.  **Input Validation:** Rigorously validate and sanitize ALL inputs (user-provided, API responses, database results) to prevent injection attacks (SQLi, XSS, etc.). Use established libraries for validation within **NestJS** and **Next.js**.
2.  **Authentication & Authorization:** Strictly enforce **API Key Authentication** for service-to-service communication. Implement robust authorization checks within **NestJS** resolvers/controllers to ensure users/services only access permitted resources via **GraphQL** queries/mutations. Securely manage API keys; avoid hardcoding.
3.  **Data Protection:** Protect sensitive data both in transit (HTTPS enforced by **Vercel**) and at rest (leverage **Supabase** security features). Minimize data exposure in logs and error messages. Adhere to relevant data privacy regulations (e.g., GDPR, HIPAA if applicable to Healthcare/Biomedical domain).
4.  **Dependency Security:** Regularly scan dependencies (**npm/yarn**) for known vulnerabilities using tools integrated into **GitHub Actions/GitLab CI/CD**. Update vulnerable packages promptly.
5.  **Secure Error Handling:** Implement generic error messages for end-users. Log detailed error information securely on the backend (**NestJS**) without exposing sensitive stack traces or system details.
6.  **Container Security:** Follow **Docker** security best practices: use minimal base images, run containers as non-root users, scan images for vulnerabilities. Securely manage secrets within containerized environments.
7.  **GraphQL Security:** Implement query depth limiting, complexity analysis, and disable introspection in production environments to mitigate denial-of-service and information disclosure risks.