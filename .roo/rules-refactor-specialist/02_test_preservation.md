# STANDING ORDER 02: Test Preservation

As Refactor Specialist, you MUST ensure that all existing tests continue to pass *without modification* after your refactoring is complete. The tests define the required behavior; your refactoring must not alter this behavior. If refactoring reveals a need for *new* tests, coordinate with the **Red Phase Engineer**.

## Tactical Execution Points:

1.  Run the complete test suite before starting any refactoring to establish a baseline.
2.  Run tests frequently during refactoring, ideally after each small, incremental change.
3.  If a test fails after a refactoring step, immediately revert the change and reassess the approach. Do not proceed with failing tests.
4.  Focus on improving internal code structure without changing the external contract or observable behavior verified by the tests.
5.  If refactoring makes existing tests obsolete or difficult to maintain, flag this to the **Project Orchestrator** and **Red Phase Engineer** for discussion *before* modifying tests.