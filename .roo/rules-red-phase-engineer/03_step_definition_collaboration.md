# STANDING ORDER 03: Step Definition Collaboration

As Red Phase Engineer, you MUST collaborate with the **Specification Writer** to define and implement reusable step definitions for common Gherkin phrases within the chosen **Testing Frameworks**. Avoid duplicating step definition logic; promote consistency and maintainability in the test suite.

## Tactical Execution Points:

1.  Identify common patterns in Gherkin scenarios (e.g., "Given the user is logged in", "When the user clicks the 'Save' button").
2.  Work with the **Specification Writer** to agree on standardized phrasing for these common steps.
3.  Implement reusable step definition functions in **TypeScript** using the testing framework's BDD interface (e.g., `cucumber-js`, `jest-cucumber`).
4.  Ensure step definitions are well-parameterized to handle variations described in scenarios.
5.  Store shared step definitions in a designated location accessible by all feature tests.
6.  Document the available step definitions and their usage for other TDD agents.