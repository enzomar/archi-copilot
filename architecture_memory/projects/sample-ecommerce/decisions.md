# Decision Log - Sample E-Commerce

### Adopt Kubernetes for Container Orchestration

- **ID:** DEC-1
- **Status:** Approved
- **Date:** 2024-06-15

**Context:** Need container orchestration platform for microservices deployment. Must support auto-scaling, service discovery, and rolling deployments.

**Options:** 1) Amazon ECS - simpler, AWS-native 2) Kubernetes (EKS) - industry standard, portable 3) Docker Swarm - lightweight but limited features

**Decision:** Adopt Amazon EKS (managed Kubernetes) for container orchestration.

**Consequences:** Higher learning curve for team. Better long-term portability. Large ecosystem of tools and community support. Need to invest in Kubernetes training.

### PostgreSQL as Primary Database

- **ID:** DEC-2
- **Status:** Approved
- **Date:** 2024-07-01

**Context:** Migrating from Oracle 12c. Need open-source alternative to reduce licensing costs and support cloud-native patterns.

**Options:** 1) PostgreSQL - mature, feature-rich, AWS Aurora compatible 2) MySQL - simpler, widely used 3) Stay with Oracle - familiar but expensive

**Decision:** Use PostgreSQL (via Amazon Aurora PostgreSQL-Compatible) as the primary relational database.

**Consequences:** Need to migrate PL/SQL stored procedures. Reduced licensing costs (~$500K/year). Better JSON support for semi-structured data. Team training required on PostgreSQL specifics.

### Event-Driven Architecture for Service Communication

- **ID:** DEC-3
- **Status:** Approved
- **Date:** 2024-08-10

**Context:** Microservices need reliable communication pattern. Synchronous calls create tight coupling and cascade failures.

**Options:** 1) REST APIs only - simple but coupled 2) Event-driven with Kafka - scalable but complex 3) Event-driven with SQS/SNS - simpler, managed

**Decision:** Implement event-driven architecture using Amazon SQS for queuing and SNS for pub/sub, with REST APIs for synchronous queries.

**Consequences:** Eventual consistency requires careful handling. Simpler operations vs self-managed Kafka. May need Kafka later for streaming use cases.

### Strangler Fig Migration Pattern

- **ID:** DEC-4
- **Status:** Approved
- **Date:** 2024-05-20

**Context:** Cannot do big-bang migration of legacy monolith. Need incremental approach that reduces risk and allows continuous delivery.

**Options:** 1) Big bang rewrite - high risk, long timeline 2) Strangler fig - incremental, lower risk 3) Lift and shift first - quick but doesn't solve problems

**Decision:** Use strangler fig pattern with API gateway routing traffic between legacy and new services.

**Consequences:** Longer total timeline but lower risk. Need to maintain both systems during transition (18-24 months). Clear rollback path for each migration phase.
