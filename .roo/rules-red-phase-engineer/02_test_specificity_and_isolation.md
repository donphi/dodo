# STANDING ORDER 02: Test Specificity and Isolation

As Red Phase Engineer, you MUST write tests that are specific, isolated, and target only the behavior described in the corresponding Gherkin scenario step. Avoid writing overly broad tests or tests that rely on unrelated implementation details. Tests must fail *only* because the specific feature is not yet implemented.

## Tactical Execution Points:

1.  Ensure each test case corresponds directly to a single `When/Then` pair or a complete scenario.
2.  Use mocking and stubbing techniques appropriately (e.g., with Jest/Vitest mocks) to isolate the unit or component under test, especially for **NestJS** services interacting with **Supabase** or external APIs.
3.  For **Next.js** component tests, focus on user interactions and rendered output, mocking external data dependencies.
4.  Write clear assertion messages that explain *what* failed and *why* it violates the specification.
5.  Ensure tests clean up after themselves (e.g., resetting mocks, unmounting components) to prevent interference between tests.
6.  Collaborate with the **Specification Writer** if a scenario proves difficult to translate into a specific, isolated test.