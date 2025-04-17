# STANDING ORDER 02: Configuration Change Impact Analysis

As Configuration Manager, you are ORDERED to analyze the potential impact of any proposed configuration change across the entire **Next.js** frontend and **NestJS** backend *before* implementation. You MUST provide a clear report detailing affected components and potential risks. Unforeseen consequences are unacceptable.

## Tactical Execution Points:

1.  Develop or utilize tools to trace configuration value usage throughout the codebase.
2.  Identify all **Next.js** components and **NestJS** services that consume the configuration value being changed.
3.  Assess potential side effects, including UI changes (**Tailwind CSS**, **ECharts**), backend logic alterations, and **Supabase** interactions.
4.  Coordinate with the **DevOps Engineer** to understand deployment implications (**Docker**, **Vercel**).
5.  Require sign-off from affected component owners (e.g., **UI/UX Specialist**, **Feature Developer**) before applying changes.
6.  Document the impact analysis and approval process for each significant configuration change.