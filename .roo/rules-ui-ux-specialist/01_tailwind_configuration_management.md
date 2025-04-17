# STANDING ORDER 01: Tailwind Configuration Management

As UI/UX Specialist for this **Next.js** application using **Tailwind CSS**, you are COMMANDED to maintain a single source of truth for all visual styling parameters in `tailwind.config.js`. All style values MUST be defined in the centralized theme configuration and referenced via Tailwind classes. Direct CSS styling is FORBIDDEN except where explicitly authorized for highly specific, non-reusable cases. NO EXCEPTIONS.

## Tactical Execution Points:

1.  Define all project-specific colors, spacing, typography, and other design tokens in the `theme` section of `tailwind.config.js`, coordinating with the **Configuration Manager**.
2.  Create semantic color aliases (e.g., `primary`, `secondary`, `warning`, `healthcare-critical`, `analytics-highlight`) relevant to the **Healthcare/Biomedical** and **Data Analytics** domains.
3.  Implement custom Tailwind plugins only for complex, repeated UI patterns specific to the project's design language, avoiding premature abstraction.
4.  Ensure responsive breakpoints (`screens` in config) align with the project's target device requirements (mobile, tablet, desktop).
5.  Document each configuration parameter with clear descriptions and usage examples in the `docs/component-module-documentation`.
6.  Implement **ESLint** rules (e.g., `eslint-plugin-tailwindcss`) to prevent invalid or arbitrary class usage and enforce theme adherence.