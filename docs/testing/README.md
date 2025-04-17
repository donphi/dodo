# Testing & TDD Workflow

This document describes the Test-Driven Development (TDD) process, testing frameworks, and the roles of the TDD Task Force agents for this project.

---

## 1. TDD Process Overview

1. **Specification Writer** creates Gherkin/BDD scenarios describing the required feature or behavior.
2. **Red Phase Engineer** implements failing tests based on the scenarios.
3. **Green Phase Engineer** writes the minimal code necessary to make the failing tests pass, using established patterns and configuration accessors.
4. **Refactor Specialist** cleans up and optimizes the codebase, ensuring tests remain green and code quality standards are met.

This cycle is repeated for each feature or bugfix, ensuring high test coverage and robust, maintainable code.

---

## 2. Testing Frameworks

- **Frontend (Next.js):**
  - **Jest** & **React Testing Library** for unit/component tests
  - **Cypress** for end-to-end (E2E) tests
  - Test utilities and mocks for Supabase and other services

- **Backend (NestJS):**
  - **Jest** for unit and integration tests
  - Test modules for GraphQL resolvers
  - Test utilities and mocks for Supabase and Neo4j

---

## 3. Directory Structure

- Frontend tests: `frontend/components/*.test.tsx`, `frontend/pages/*.test.tsx`
- Backend tests: `backend/src/**/*.spec.ts`
- Test utilities/mocks: `frontend/test-utils/`, `backend/test/utils/`

---

## 4. TDD Task Force Agent Roles

- **Specification Writer:** Authors clear, testable Gherkin/BDD scenarios for new features and bugfixes.
- **Red Phase Engineer:** Implements failing tests that precisely match the scenarios.
- **Green Phase Engineer:** Writes the minimal code to make the failing tests pass, strictly following templates and configuration accessors.
- **Refactor Specialist:** Refactors and optimizes code, ensuring all tests remain green and code quality standards are upheld.

---

## 5. Test Coverage & Quality

- All new features and bugfixes require comprehensive tests.
- Coverage thresholds are enforced (80%+ for branches, functions, lines, statements).
- Tests must be run locally and in CI before merge/deployment.

---

## 6. Running Tests

- **Frontend:**
  - Unit/component: `npm run test` (Jest)
  - E2E: `npm run test:e2e` (Cypress)
- **Backend:**
  - Unit/integration: `npm run test` (Jest)

---

## 7. CI/CD Integration

- All tests are run in CI (GitHub Actions/GitLab CI).
- Coverage reports are generated and must meet thresholds.
- Test failures block merges/deployments.

---

## 8. References

- See `docs/component-module-documentation` and `docs/api-documentation` for feature/module-specific test details.
- See `config/04_testing_quality_assurance.yaml` for configuration details.