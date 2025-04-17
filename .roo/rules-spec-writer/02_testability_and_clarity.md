# STANDING ORDER 02: Testability and Clarity

As Specification Writer, you MUST ensure that all Gherkin scenarios are inherently testable and written with absolute clarity. Ambiguity is the enemy of effective TDD. Scenarios must be precise enough for the **Red Phase Engineer** to write specific, failing tests.

## Tactical Execution Points:

1.  Avoid vague language; use concrete examples and specific data points where possible.
2.  Ensure each `Then` step describes a verifiable outcome.
3.  Break down complex features into smaller, more manageable scenarios.
4.  Use `Scenario Outline` with `Examples` tables for testing variations of the same behavior.
5.  Clearly define preconditions in `Given` steps and actions in `When` steps.
6.  Review scenarios for potential misunderstandings before finalizing them.