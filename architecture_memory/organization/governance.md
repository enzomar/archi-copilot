# Enterprise Governance & Processes

> Organization-wide governance policies that apply to all projects

## Change Advisory Board (CAB)

### Meeting Schedule
- **Regular CAB:** Every Thursday, 14:00-15:00 UTC
- **Emergency CAB:** On-demand, requires VP approval

### Submission Requirements
| Change Type | Lead Time | Approvers |
|-------------|-----------|-----------|
| Standard | 5 business days | CAB |
| Normal | 3 business days | CAB + Tech Lead |
| Emergency | Same day | VP + On-call Lead |

### Documentation Required
- Change description and rationale
- Risk assessment
- Rollback plan
- Testing evidence
- Affected systems list

---

## Architecture Review Board (ARB)

### When ARB Review Required
- New system or service introduction
- Technology not on approved radar
- Cross-project integration changes
- Security architecture changes
- Changes affecting >3 systems

### ARB Meeting
- **Schedule:** Bi-weekly, Tuesday 10:00 UTC
- **Submission:** ADR draft required 1 week before
- **Attendees:** Principal architects, security, affected project leads

---

## Exception Process

### Requesting an Exception
1. Document the principle/standard being violated
2. Explain business justification
3. Identify risks and mitigations
4. Propose exception duration
5. Submit to ARB for approval

### Exception Tracking
- All exceptions logged in exception register
- Maximum duration: 12 months
- Quarterly review of active exceptions
- Exceptions must have remediation plan

---

## Decision Making Framework

### RACI for Architecture Decisions

| Decision Scope | Responsible | Accountable | Consulted | Informed |
|----------------|-------------|-------------|-----------|----------|
| Project-level | Tech Lead | Project Architect | Team | Stakeholders |
| Cross-project | Enterprise Architect | ARB | Project Leads | All Teams |
| Strategic | CTO | ARB | Leadership | Organization |

### Escalation Path
1. Tech Lead → Project Architect
2. Project Architect → Enterprise Architect
3. Enterprise Architect → ARB
4. ARB → CTO

---

## Documentation Standards

### Required Documentation
| Artifact | When Required | Owner |
|----------|---------------|-------|
| ADR | Significant decisions | Architect |
| System Design | New systems | Tech Lead |
| API Specification | New APIs | Developer |
| Runbook | Production systems | SRE |
| Data Flow Diagram | Data processing | Architect |

### Review Cadence
- ADRs: Quarterly relevance check
- System Designs: Annual review
- Runbooks: After each incident
