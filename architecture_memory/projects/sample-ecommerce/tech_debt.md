# Technical Debt Register - Sample E-Commerce

### Monolithic Database Schema

- **ID:** TD-1
- **Type:** Architecture
- **Severity:** High
- **Effort:** High

**Description:** Single Oracle database serves all domains with tightly coupled tables, triggers, and stored procedures. 400+ tables with undocumented relationships.

**Impact:** Cannot scale individual services independently. Database is a bottleneck during peak traffic.

**Recommendation:** Implement database-per-service pattern gradually. Start with bounded contexts that have clearest boundaries (e.g., Inventory, Customer Profile).

### Hard-coded Configuration

- **ID:** TD-2
- **Type:** Code
- **Severity:** Medium
- **Effort:** Low

**Description:** Environment-specific configuration scattered across property files, database tables, and hard-coded values in Java classes.

**Impact:** Deployment to new environments requires code changes. Configuration drift between environments causes production issues.

**Recommendation:** Externalize configuration using Spring Cloud Config or AWS Parameter Store. Implement feature flags for runtime toggles.

### Missing API Documentation

- **ID:** TD-3
- **Type:** Documentation
- **Severity:** Medium
- **Effort:** Medium

**Description:** Internal APIs lack OpenAPI specifications. Consumers rely on tribal knowledge and reverse engineering.

**Impact:** New team members struggle to understand integration points. API changes frequently break downstream consumers.

**Recommendation:** Mandate OpenAPI specs for all new APIs. Retrofit documentation for critical existing APIs using contract-first approach.

### Insufficient Test Coverage

- **ID:** TD-4
- **Type:** Testing
- **Severity:** High
- **Effort:** High

**Description:** Legacy codebase has ~15% unit test coverage. No integration tests. Manual regression testing takes 2 weeks.

**Impact:** Fear of change slows feature delivery. Bugs frequently reach production.

**Recommendation:** Implement testing pyramid for new code. Add characterization tests before refactoring legacy modules.
