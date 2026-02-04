# Enterprise Technology Standards & Patterns

> TOGAF Content: Technology Architecture - Standards Catalog (Organization-Wide)

## Technology Radar

### Adopt (Use in Production)
Technologies we use and recommend.

| Technology | Category | Use Case | Notes |
|------------|----------|----------|-------|
| [Language X] | Language | Backend services | Primary language |
| [Framework Y] | Framework | API development | Standard framework |
| PostgreSQL | Database | Transactional data | Primary RDBMS |
| Kubernetes | Platform | Container orchestration | Standard deployment |
| [Cloud Provider] | Infrastructure | All workloads | Primary cloud |

### Trial (Proof of Concept)
Technologies we're evaluating.

| Technology | Category | Evaluation Criteria | POC Owner |
|------------|----------|---------------------|-----------|
| [Tech A] | [Category] | [What we're testing] | [Name] |
| [Tech B] | [Category] | [What we're testing] | [Name] |

### Assess (Research)
Technologies on our radar but not yet trialed.

| Technology | Category | Interest | Blocker |
|------------|----------|----------|---------|
| [Tech C] | [Category] | [Why interesting] | [What's stopping us] |

### Hold (Do Not Use)
Technologies we're moving away from or avoiding.

| Technology | Category | Reason | Migration Path |
|------------|----------|--------|----------------|
| [Legacy DB] | Database | End of support | Migrate to PostgreSQL |
| [Old Framework] | Framework | Security issues | Rewrite in [New] |

---

## Architecture Patterns

### Approved Patterns

#### Pattern: API Gateway
**Context:** External clients need to access platform services.
**Solution:** Single entry point handling auth, rate limiting, routing.
**When to Use:** All external API traffic.
**When NOT to Use:** Internal service-to-service calls.
**Reference Implementation:** [Link to example]

#### Pattern: Event-Driven Integration
**Context:** Services need to communicate without tight coupling.
**Solution:** Publish events to message broker, subscribers react.
**When to Use:** Cross-domain communication, eventual consistency acceptable.
**When NOT to Use:** Immediate consistency required, simple request-response.
**Reference Implementation:** [Link to example]

#### Pattern: Strangler Fig
**Context:** Need to replace legacy system incrementally.
**Solution:** Route traffic to new implementation feature by feature.
**When to Use:** Legacy modernization.
**When NOT to Use:** Greenfield development.
**Reference Implementation:** [Link to example]

#### Pattern: Feature Flags
**Context:** Need client-specific behavior without code branches.
**Solution:** Runtime configuration determines feature availability.
**When to Use:** Client customization, gradual rollout, A/B testing.
**When NOT to Use:** Simple, universal features.
**Reference Implementation:** [Link to example]

#### Pattern: Circuit Breaker
**Context:** Service calls can fail, need graceful degradation.
**Solution:** Fail fast when downstream is unhealthy.
**When to Use:** All external service calls.
**When NOT to Use:** Local, in-process calls.
**Reference Implementation:** [Link to example]

#### Pattern: Saga
**Context:** Distributed transaction across services.
**Solution:** Choreographed or orchestrated compensating actions.
**When to Use:** Business transactions spanning multiple services.
**When NOT to Use:** Single service transactions.
**Reference Implementation:** [Link to example]

---

### Anti-Patterns (Avoid)

#### Anti-Pattern: Distributed Monolith
**Description:** Microservices that are tightly coupled and must be deployed together.
**Why Bad:** Complexity of distributed systems without benefits.
**How to Detect:** Services can't be deployed independently; changes cascade.
**How to Fix:** Identify and break coupling points; accept some services should merge.

#### Anti-Pattern: Shared Database
**Description:** Multiple services directly accessing same database.
**Why Bad:** Tight coupling, schema changes affect multiple teams.
**How to Detect:** Multiple services with DB connections to same schema.
**How to Fix:** API-based access; eventually split database by domain.

#### Anti-Pattern: Big Ball of Mud
**Description:** No discernible architecture, everything connected to everything.
**Why Bad:** Changes are unpredictable, testing impossible.
**How to Detect:** Can't explain system boundaries; everything requires full regression.
**How to Fix:** Identify domains; create boundaries; strangler fig approach.

---

## API Standards

### REST API Guidelines

#### URL Structure
```
/{version}/{resource}/{id}/{sub-resource}
Examples:
  /v1/members/12345
  /v1/members/12345/transactions
  /v1/programs/airline-abc/tiers
```

#### HTTP Methods
| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resource | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove resource | Yes |

#### Response Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Authentication failed |
| 403 | Forbidden | Authorization failed |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Error | Unexpected server error |

#### Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

#### Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [
      {"field": "email", "issue": "Invalid format"}
    ],
    "traceId": "abc-123-xyz"
  }
}
```

---

## Data Standards

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | member_transactions |
| Columns | snake_case | created_at, member_id |
| Primary Keys | {table}_id | member_id, transaction_id |
| Foreign Keys | {referenced_table}_id | member_id in transactions |
| Indexes | idx_{table}_{columns} | idx_transactions_member_id |

### Required Fields (All Tables)
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID/BIGINT | Primary key |
| created_at | TIMESTAMP | Audit |
| updated_at | TIMESTAMP | Audit |
| created_by | VARCHAR | Audit |

### Data Classification
| Level | Description | Examples | Handling |
|-------|-------------|----------|----------|
| Public | No restriction | Program name | Standard |
| Internal | Company only | System metrics | Access control |
| Confidential | Need to know | Member data | Encryption, audit |
| Restricted | Highly sensitive | Payment data | PCI controls |

---

## Security Standards

### Authentication
- OAuth 2.0 for user-facing APIs
- API keys for service-to-service (internal)
- mTLS for high-security service communication

### Authorization
- RBAC (Role-Based Access Control) for admin functions
- ABAC (Attribute-Based Access Control) for data access
- Principle of least privilege

### Secrets Management
- No secrets in code or config files
- Use [Vault/AWS Secrets Manager/etc.]
- Rotate credentials regularly

### Network Security
- TLS 1.2+ for all traffic
- Network segmentation between tiers
- WAF for external endpoints

---

## Observability Standards

### Logging
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "member-service",
  "traceId": "abc-123",
  "spanId": "def-456",
  "message": "Member created",
  "context": {
    "memberId": "12345",
    "program": "airline-abc"
  }
}
```

### Metrics
| Type | Naming | Example |
|------|--------|---------|
| Counter | {service}_{action}_total | member_service_enrollments_total |
| Gauge | {service}_{resource}_{state} | member_service_connections_active |
| Histogram | {service}_{action}_duration_seconds | member_service_api_duration_seconds |

### Tracing
- OpenTelemetry for distributed tracing
- Trace context propagation required
- Sample rate: 100% for errors, 10% for success (adjust as needed)

---

## Code Standards

### General
- All code reviewed before merge
- Automated tests required (coverage target: 80%)
- Static analysis in CI pipeline
- Documentation for public APIs

### Git Workflow
- Main branch always deployable
- Feature branches from main
- Pull request required for merge
- Squash and merge preferred

---

*Review standards quarterly. Propose changes through ADR process.*
