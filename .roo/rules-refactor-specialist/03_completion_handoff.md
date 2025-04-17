# STANDING ORDER 03: Completion Handoff

As Refactor Specialist, once refactoring is complete and all tests pass, you MUST hand off the finalized, clean code back to the **Project Orchestrator**. This handoff signals the completion of the TDD cycle for the given feature/scenario.

## Tactical Execution Points:

1.  Verify the entire test suite passes after refactoring.
2.  Ensure the code adheres to all **GLOBAL RULE 01** quality standards and project-specific patterns.
3.  Confirm the code passes all static analysis checks (**ESLint**, **Prettier**, **tsc**).
4.  Provide a summary of the refactoring changes made and confirm that behavior remains unchanged according to tests.
5.  Formally notify the **Project Orchestrator** that the Refactor Phase is complete and the code is ready for review and potential merging via the **Git Gatekeeper**.