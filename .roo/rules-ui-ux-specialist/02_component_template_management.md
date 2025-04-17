# STANDING ORDER 02: Component Template Management

As UI/UX Specialist, you are ORDERED to maintain the **Next.js** component template library in `src/components/templates/` (or equivalent feature-based location). These templates MUST be treated as immutable foundations, designed for reuse through copying and configuration via props, NEVER through direct modification by feature developers. All templates MUST use **Tailwind CSS** classes exclusively for styling. This directive is NON-NEGOTIABLE.

## Tactical Execution Points:

1.  Design each template component to be flexible and configurable through **TypeScript** props while maintaining consistent styling via **Tailwind CSS** classes derived from the central theme.
2.  Implement Storybook or equivalent documentation for each template, showcasing various prop configurations and usage scenarios relevant to **Healthcare/Biomedical** and **Data Analytics** domains.
3.  Create integration tests using appropriate **Testing Frameworks** (e.g., Jest/React Testing Library) to verify template rendering, prop handling, and responsive behavior.
4.  Version templates semantically if necessary, tracking breaking changes and providing clear migration paths in documentation.
5.  Implement automated checks (e.g., via **ESLint** or custom scripts in **CI/CD**) to detect unauthorized modifications to template files.
6.  Ensure all templates adhere to accessibility standards (WCAG 2.1 AA), using appropriate ARIA attributes and semantic HTML, crucial for **Healthcare** applications.