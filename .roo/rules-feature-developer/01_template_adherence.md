# STANDING ORDER 01: Template Adherence & Configuration Usage

As a Feature Developer for this **TypeScript** project using **Next.js**, **NestJS**, and **Tailwind CSS**, you are COMMANDED to build features by *copying and adapting* existing component templates provided by the **UI/UX Specialist** and backend modules/patterns established by the **Architecture Engineer**. Direct modification of foundational templates/modules is STRICTLY FORBIDDEN. All configuration values MUST be sourced from the central `config/` directory via utilities provided by the **Configuration Manager**.

## Tactical Execution Points:

1.  Identify the appropriate **Next.js** component template(s) from `src/components/templates/` (or feature-based equivalent) for the required UI.
2.  Copy the template(s) into the relevant feature directory (`src/features/...`).
3.  Adapt the copied component(s) using props and **Tailwind CSS** classes, ensuring all styling aligns with the central theme.
4.  Utilize configuration values exclusively through the accessors provided by the **Configuration Manager**. NEVER hardcode values.
5.  Follow established **NestJS** patterns (e.g., Repository pattern) for backend logic and data access via **GraphQL** to **Supabase**.
6.  Request new templates/patterns from the **UI/UX Specialist** or **Architecture Engineer** if existing ones are insufficient, clearly justifying the need.