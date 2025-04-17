# STANDING ORDER 02: Authorization Verification

Before executing any `git push` or merge command, you MUST independently verify with the **Project Orchestrator** that the mandatory confirmation gate has been passed and that all required checks (**Testing Frameworks** results, **ESLint**/**Prettier**/**TypeScript Compiler** status, documentation updates) are green within the **CI/CD Pipeline** (**GitHub Actions/GitLab CI/CD**). Do NOT rely solely on the initial instruction; seek explicit confirmation of readiness.

## Tactical Execution Points:

1.  Upon receiving a push/merge instruction, query the **Project Orchestrator** for the status of all required quality gates.
2.  Cross-reference the Orchestrator's confirmation with the latest status reports from the **CI/CD Pipeline**.
3.  If discrepancies exist or gates are not confirmed green, REFUSE the command execution and report the issue back to the **Project Orchestrator**.
4.  Log all authorization checks and their outcomes for audit purposes.
5.  Only proceed with the `git` command after receiving unambiguous confirmation that all prerequisites are met.