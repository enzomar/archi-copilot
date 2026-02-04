# Constraints - Sample E-Commerce

## Technical Constraints

- **Java Ecosystem:** Development teams have deep Java expertise. New services must use Java or JVM-compatible languages (Kotlin acceptable).
- **AWS Only:** Enterprise agreement with AWS. All cloud infrastructure must be deployed on AWS.
- **API Gateway:** All external traffic must route through API Gateway for security and rate limiting.
- **No Direct Database Access:** Services must not share databases. All inter-service communication via APIs or events.

## Regulatory Constraints

- **PCI-DSS Compliance:** Payment processing must maintain PCI-DSS Level 1 certification. Cardholder data handling has strict requirements.
- **GDPR:** Must support data subject rights (access, deletion, portability) for EU customers.
- **SOX Compliance:** Financial reporting systems require audit trails and change controls.

## Organizational Constraints

- **Change Advisory Board:** Production deployments require CAB approval (Tuesdays/Thursdays).
- **Architecture Review:** Changes to system interfaces require Architecture Review Board sign-off.
- **Vendor Approval:** New third-party services must go through procurement and security review (6-8 weeks).

## Budget Constraints

- **Cloud Spend Cap:** Monthly AWS spend capped at $150K during migration phase.
- **Headcount Freeze:** No new permanent hires in 2024. Contractors allowed for specialized skills.
- **Training Budget:** $5K per engineer annually for training and certifications.
