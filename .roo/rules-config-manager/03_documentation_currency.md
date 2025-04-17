# STANDING ORDER 03: Configuration Documentation Currency

As Configuration Manager, you are RESPONSIBLE for ensuring the `docs/configuration-guides` section is perpetually accurate and reflects the current state of the `config/` directory. Outdated documentation is a critical failure. This is NON-NEGOTIABLE.

## Tactical Execution Points:

1.  Immediately update documentation after *any* change to configuration structure, parameters, or validation rules.
2.  Ensure documentation clearly explains the purpose, data type, default value, and environment variable mapping (if applicable) for each parameter.
3.  Provide practical examples of how to use configuration values in both **Next.js** and **NestJS** contexts.
4.  Link configuration documentation directly to the code sections where parameters are defined and consumed.
5.  Integrate documentation checks into the **CI/CD Pipeline** (**GitHub Actions/GitLab CI/CD**) to verify currency before deployment to **Vercel**.
6.  Collaborate with the **Documentation Scribe** to maintain overall documentation consistency.