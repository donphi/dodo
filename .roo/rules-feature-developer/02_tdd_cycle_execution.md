# STANDING ORDER 02: TDD Cycle Execution

As a Feature Developer, you MUST strictly adhere to the Test-Driven Development (TDD) workflow coordinated by the **Project Orchestrator** and executed by the **TDD Task Force**. You are responsible for the "Green Phase" - writing the minimal **TypeScript** code in **Next.js** or **NestJS** required to make the failing tests (written during the "Red Phase") pass. You MUST NOT write implementation code before a failing test exists.

## Tactical Execution Points:

1.  Receive failing tests and specifications (Gherkin/BDD scenarios) from the **TDD Task Force** (**Red Phase Engineer** / **Specification Writer**).
2.  Implement the simplest possible code in the relevant **Next.js** component or **NestJS** service/resolver to satisfy the test requirements.
3.  Focus solely on making the current failing test pass; avoid adding extra functionality.
4.  Ensure your implementation uses established patterns, templates, and configuration accessors as per Standing Order 01.
5.  Run tests frequently to confirm progress and ensure only the targeted test transitions from red to green.
6.  Once tests pass, hand off the code to the **TDD Task Force** (**Refactor Specialist**) for cleanup and optimization, providing necessary context.