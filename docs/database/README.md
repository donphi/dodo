# Database Architecture & Integration Guide

_Last updated: 2025-04-15_

## Overview

This document describes the data models, access patterns, security protocols, and integration details for the project's two primary databases: **Supabase (PostgreSQL)** and **Neo4j (Graph Database)**. It is maintained as a living document and will be updated as the implementation progresses.

---

## 1. Supabase (PostgreSQL)

### 1.1 Data Model

**Tables & Relationships:**  
*(To be updated after TDD Green Phase implementation)*

- `users`: Stores user profile and authentication data.
- `research_surveys`: Survey definitions and metadata.
- `survey_responses`: User-submitted survey answers.
- *(Additional tables as required by features)*

**Relationships:**
- `users` 1---* `survey_responses`
- `research_surveys` 1---* `survey_responses`

### 1.2 Authentication & Authorization

- **Authentication:** Managed by Supabase Auth (JWT-based).
- **Authorization:** Row-Level Security (RLS) policies enforced for all tables.
- **API Key:** Used for service-to-service backend operations.

### 1.3 Row-Level Security (RLS) Policies

- Only authenticated users can access their own data.
- Service role key required for privileged backend operations.
- *(Detailed RLS policy SQL will be added post-implementation.)*

### 1.4 Indexes & Performance

- Indexes on primary/foreign keys and frequently queried columns.
- *(Specific index definitions will be documented after schema migration.)*

### 1.5 Triggers & Functions

- Audit triggers for sensitive tables (e.g., `users`, `survey_responses`).
- Custom functions for business logic (e.g., survey scoring).
- *(Definitions to be added after implementation.)*

### 1.6 Access Patterns

- **Frontend:** Uses Supabase JS client with JWT auth.
- **Backend:** Uses Supabase service role key for privileged operations.
- **GraphQL API:** All data access via NestJS GraphQL resolvers.

### 1.7 Example Queries

```sql
-- Fetch all surveys for a user
SELECT * FROM survey_responses WHERE user_id = auth.uid();

-- Insert a new survey response
INSERT INTO survey_responses (user_id, survey_id, answers) VALUES (...);
```

### 1.8 Security Considerations

- All input validated via backend and Supabase RLS.
- No sensitive data exposed in logs or error messages.
- Environment variables used for all secrets/keys.

---

## 2. Neo4j (Graph Database)

### 2.1 Graph Data Model

**Node Types:**
- `User`
- `Survey`
- `Response`
- `Concept` (for graph visualization features)

**Relationship Types:**
- `:SUBMITTED` (User)-[:SUBMITTED]->(Response)
- `:ANSWERS` (Response)-[:ANSWERS]->(Survey)
- `:LINKED_TO` (Concept)-[:LINKED_TO]->(Concept)

*(Detailed property keys and constraints to be added post-implementation.)*

### 2.2 Indexes & Constraints

- Unique constraints on node IDs.
- Indexes on frequently queried properties (e.g., `email`, `surveyId`).

### 2.3 Seed Data

- Initial graph nodes/relationships for development/testing.
- *(Cypher seed scripts to be documented after implementation.)*

### 2.4 Access Controls

- Database credentials managed via environment variables.
- Role-based access for backend services.
- No direct client access; all queries routed through backend API.

### 2.5 Access Patterns

- **Backend:** Uses Neo4j driver via NestJS module.
- **GraphQL API:** Exposes graph queries/mutations for frontend.

### 2.6 Example Cypher Queries

```cypher
// Find all responses submitted by a user
MATCH (u:User {id: $userId})-[:SUBMITTED]->(r:Response) RETURN r;

// Get all concepts linked to a given concept
MATCH (c:Concept {id: $conceptId})-[:LINKED_TO]->(related:Concept) RETURN related;
```

### 2.7 Security Considerations

- All queries parameterized to prevent injection.
- No sensitive data in error messages.
- Access restricted to backend service account.

---

## 3. Integration & Best Practices

- All configuration values are sourced from the central `config/` directory or environment variables.
- No hardcoded secrets or connection strings in code.
- All database access is performed via backend services (NestJS), never directly from the client.
- Follow TDD: Schema and logic are implemented only after failing tests are written.

---

## 4. Maintenance

- This document is updated after each Green Phase completion.
- All changes to data models or access patterns must be reflected here.
- Coordinate with the Documentation Scribe for review and consistency.