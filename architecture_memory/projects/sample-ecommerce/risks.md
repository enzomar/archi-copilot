# Risk Register - Sample E-Commerce

### Legacy System Dependency

- **ID:** RISK-1
- **Likelihood:** High
- **Impact:** High
- **Status:** Mitigating
- **Owner:** Michael Torres

**Description:** Critical business logic embedded in the legacy monolith is poorly documented, making migration risky.

**Mitigation:** Conducting code archaeology sessions and creating comprehensive documentation before migration. Implementing strangler fig pattern for gradual migration.

### Data Migration Complexity

- **ID:** RISK-2
- **Likelihood:** Medium
- **Impact:** Critical
- **Status:** Open
- **Owner:** Data Team

**Description:** 15 years of customer data in Oracle with complex relationships and undocumented business rules in stored procedures.

**Mitigation:** Planning parallel run period with data reconciliation. Creating comprehensive data mapping documentation.

### Team Skill Gap

- **ID:** RISK-3
- **Likelihood:** Medium
- **Impact:** Medium
- **Status:** Mitigating
- **Owner:** HR / Engineering

**Description:** Current team has limited experience with Kubernetes and cloud-native patterns.

**Mitigation:** Training program in progress. Hiring cloud-native specialists. Partnering with AWS for architecture reviews.

### Vendor Lock-in

- **ID:** RISK-4
- **Likelihood:** Low
- **Impact:** Medium
- **Status:** Accepted
- **Owner:** Architecture Team

**Description:** Heavy use of AWS-specific services (Aurora, SQS, Lambda) may complicate future multi-cloud strategy.

**Mitigation:** Accepted risk for Phase 1. Abstracting cloud-specific code behind interfaces for future portability.
