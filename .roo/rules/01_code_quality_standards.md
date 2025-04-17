# GLOBAL RULE 01: Code Quality Standards

ALL AGENTS MUST ADHERE TO THE FOLLOWING NON-NEGOTIABLE CODE QUALITY STANDARDS FOR THE **TypeScript**, **Next.js**, and **NestJS** STACK:

1.  **Zero Tolerance for Code Smells:** Actively identify and eliminate anti-patterns (e.g., magic strings, excessive nesting), duplication, and unnecessary complexity. Employ **ESLint** and **Prettier** configurations consistently.
2.  **Mandatory Test Coverage:** All new features and bug fixes require comprehensive tests (Unit, Integration, E2E where applicable, using appropriate frameworks like Jest/Vitest). Aim for high coverage, especially on critical paths. TDD workflow is mandatory.
3.  **Documentation Requirements:** Adhere strictly to the "Documentation as Living System" protocol. Update relevant **Markdown** documentation in `docs/` *immediately* after completing any subtask. Code comments should explain *why*, not *what*.
4.  **Type Safety:** Leverage **TypeScript**'s strict mode. Avoid `any` type unless absolutely necessary and justified. Define clear interfaces and types for data structures and function signatures. Ensure **TypeScript Compiler (tsc)** passes without errors.
5.  **Performance Optimization:** Write efficient code. Be mindful of **Next.js** bundle sizes, **NestJS** query performance against **Supabase** (via **GraphQL**), and **ECharts** rendering performance. Profile and optimize bottlenecks when identified.
6.  **Consistent Formatting:** Code MUST be automatically formatted using **Prettier** on save/commit, adhering to the project's defined style guide.
7.  **Configuration Adherence:** Strictly follow the "Centralized Configuration" principle. NEVER hardcode values; always source from the central `config/` directory.