# 🧠 Archi Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://code.visualstudio.com/)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-Chat%20Participant-purple.svg)](https://github.com/features/copilot)

**Architecture Decision Support System - Powered by GitHub Copilot Chat**

An AI assistant for enterprise architects that **integrates directly into Copilot Chat** - just type `@archi` to start!

> 🎯 **No API keys required** - Uses your existing GitHub Copilot subscription

---

## ✨ What It Does

Archi Copilot is a VS Code Chat Participant that helps senior architects:

| Slash Command | Purpose | Example |
|---------------|---------|---------|
| *(none)* | General architecture questions | `@archi How should we handle API versioning?` |
| `/decision` | Structured decision analysis | `@archi /decision Should we use Kafka or RabbitMQ?` |
| `/adr` | Generate Architecture Decision Records | `@archi /adr Document our choice of PostgreSQL` |
| `/review` | Critical review of proposals | `@archi /review Review this microservices migration plan` |
| `/risks` | Comprehensive risk identification | `@archi /risks Identify risks in 6-month migration` |
| `/stakeholder` | Prepare communications | `@archi /stakeholder Present tech debt plan to CFO` |
| `/challenge` | Devil's advocate analysis | `@archi /challenge Microservices will solve scaling` |
| `/techdebt` | Analyze & prioritize technical debt | `@archi /techdebt Assess debt in loyalty points engine` |
| `/backlog` | Manage technical backlog | `@archi /backlog Prioritize API refactor vs DB migration` |
| `/milestone` | Plan & track milestones | `@archi /milestone Define Q2 client consolidation milestone` |
| `/saveDecision` | Save last response as decision | `@archi /saveDecision` |
| `/saveInsight` | Save last response as insight | `@archi /saveInsight` |
| `/project` | Switch between projects | `@archi /project rail` |
| `/projects` | List available projects | `@archi /projects` |
| `/admin` | Open Admin Dashboard | `@archi /admin` |

## 🎯 Key Features

- **Native Chat Integration** - Works directly in GitHub Copilot Chat panel
- **Admin Dashboard** - Visual UI to manage projects and edit context files
- **Organizational Memory** - Learns your context, principles, and constraints
- **Multi-Project Support** - Switch between different project contexts
- **Slash Commands** - Quick access to specialized modes
- **Confluence Integration** - Pull context from Confluence spaces
- **Conversation Context** - Maintains context across the chat session
- **Save & Build Knowledge** - Save valuable responses as decisions or insights
- **TOGAF Aligned** - Templates follow enterprise architecture best practices

---

## 🛠️ Admin Dashboard

The Admin Dashboard provides a user-friendly interface to manage your architecture context without editing markdown files directly.

### Opening the Dashboard

Three ways to open it:
1. **Chat:** `@archi /admin`
2. **Command Palette:** `Cmd+Shift+P` → "Archi Copilot: Open Admin Dashboard"
3. **Code:** Call `archi-copilot.openAdmin` command

### Dashboard Features

| Tab | Description |
|-----|-------------|
| **📁 Projects** | Select and edit project-specific context files |
| **🏢 Organization** | Edit organization-wide settings (principles, standards, glossary, governance) |

### What You Can Do

- **Browse Projects** - Select from dropdown to load project files
- **Edit Context** - Rich text editor for each markdown file with keyboard shortcuts (`Cmd+S`)
- **Create Projects** - Add new projects with pre-populated templates
- **Save Changes** - Instant save with toast notifications

### File Descriptions

| File | Icon | Purpose |
|------|------|---------|
| `context.md` | 📋 | Project overview, stakeholders, strategic context |
| `capabilities.md` | 🎯 | Business capability model and system mapping |
| `constraints.md` | 🚧 | Technical, regulatory, organizational constraints |
| `decisions.md` | ⚖️ | Architecture decision log and pending items |
| `tech_debt.md` | 🔧 | Technical debt register and remediation plans |
| `roadmap.md` | 🗓️ | Architecture roadmap and milestones |
| `risks.md` | ⚠️ | Risk register and mitigation strategies |
| `politics.md` | 🤝 | Stakeholder dynamics (confidential) |
| `glossary.md` | 📖 | Project-specific terminology |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd archi-copilot
npm install
npm run compile
```

### 2. Run the Extension

**Option A: Using VS Code**
Press **F5** in VS Code to launch Extension Development Host

**Option B: From Command Line**
```bash
code --extensionDevelopmentPath=/path/to/archi-copilot
```

### 3. Use Archi Copilot

1. Open **Copilot Chat** panel (click the chat icon or `Ctrl+Shift+I` / `Cmd+Shift+I`)
2. Type `@archi` followed by your question
3. Use slash commands for specialized modes: `@archi /decision Should we use Kafka?`

**Examples:**
- `@archi What's the best approach for our API versioning strategy?`
- `@archi /decision Should we use PostgreSQL or MongoDB for our new service?`
- `@archi /adr We decided to adopt event-driven architecture because...`
- `@archi /review Review our proposal to migrate to Kubernetes`

---

## 🌐 Confluence Integration

Archi Copilot can read architecture documentation directly from Confluence! Configure it in VS Code settings:

### Configuration

Open VS Code Settings (`Cmd+,` / `Ctrl+,`) and search for "archi-copilot", or add to your `settings.json`:

```json
{
  "archi-copilot.confluence.baseUrl": "https://yourcompany.atlassian.net",
  "archi-copilot.confluence.spaceKey": "ARCH",
  "archi-copilot.confluence.username": "your-email@company.com",
  "archi-copilot.confluence.apiToken": "your-api-token",
  "archi-copilot.confluence.parentPageId": "123456",
  "archi-copilot.confluence.labels": ["architecture", "adr"]
}
```

### Settings Explained

| Setting | Required | Description |
|---------|----------|-------------|
| `baseUrl` | ✅ | Your Confluence URL (e.g., `https://company.atlassian.net`) |
| `spaceKey` | ✅ | The space key containing your architecture docs (e.g., `ARCH`) |
| `username` | ✅ | Your Atlassian account email |
| `apiToken` | ✅ | API token from [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `parentPageId` | ❌ | Only fetch pages under this parent (useful for large spaces) |
| `labels` | ❌ | Only fetch pages with specific labels (e.g., `["architecture"]`) |

### How to Get Your API Token

1. Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label (e.g., "Archi Copilot")
4. Copy the token and add it to your VS Code settings

### Finding Your Space Key

The space key is in the Confluence URL: `https://yourcompany.atlassian.net/wiki/spaces/ARCH/...`
In this example, `ARCH` is the space key.

---

## 📚 Architecture Memory

The extension reads context from `architecture_memory/` in your workspace:

```
architecture_memory/
├── organization/            # Organization-wide context (applies to all projects)
│   ├── principles.md        # Architecture principles
│   ├── standards.md         # Technology standards/radar
│   ├── governance.md        # CAB/ARB processes
│   └── glossary.md          # Domain terminology
├── projects/                # Project-specific context
│   └── sample-ecommerce/    # Example: E-commerce modernization project
│       ├── context.md       # Project overview, stakeholders
│       ├── capabilities.md  # Business capability model
│       ├── constraints.md   # Project constraints
│       ├── decisions.md     # Decision log
│       ├── tech_debt.md     # Technical debt register
│       ├── roadmap.md       # Project roadmap
│       ├── risks.md         # Risk register
│       ├── politics.md      # Stakeholder dynamics (confidential)
│       └── glossary.md      # Project-specific terms
├── decisions/               # Saved ADRs (grows over time)
├── insights/                # Saved insights
└── politics/                # Political notes
```

### Multi-Project Support

Switch between projects using slash commands in chat:

- `@archi /projects` - List all available projects
- `@archi /project payments` - Switch to the "payments" project

Or set the default project in VS Code settings:
```json
{
  "archi-copilot.activeProject": "sample-ecommerce"
}
```

### Customizing Your Context

**Organization-level** (applies to all projects):
- `organization/principles.md` - Define architecture principles
- `organization/standards.md` - Technology standards
- `organization/glossary.md` - Common terminology

**Project-specific** (per project):
- `projects/<name>/context.md` - Project overview, stakeholders
- `projects/<name>/capabilities.md` - Business capabilities
- `projects/<name>/constraints.md` - Project constraints
- `projects/<name>/decisions.md` - Decision log

The more context you provide, the better the responses!

---

## 🛠 Slash Commands

Use these commands in Copilot Chat with `@archi`:

### Analysis Commands
| Command | Description |
|---------|-------------|
| `/decision` | Structured decision analysis |
| `/adr` | Generate Architecture Decision Record |
| `/review` | Critical review of a proposal |
| `/risks` | Comprehensive risk identification |
| `/stakeholder` | Prepare communications |
| `/challenge` | Devil's advocate analysis |
| `/techdebt` | Technical debt analysis |
| `/backlog` | Prioritize architecture items |
| `/milestone` | Plan milestones |

### Project & Save Commands
| Command | Description |
|---------|-------------|
| `/projects` | List available projects |
| `/project <name>` | Switch to a project |
| `/saveDecision` | Save last response as decision |
| `/saveInsight` | Save last response as insight |

---

### Interactive Session Commands

When in interactive mode, you can:

- Type any question → Get response
- `mode decision` → Switch to decision mode
- `mode adr` → Switch to ADR mode
- `modes` or `help` → List all modes
- `save` → Save last response
- `quit` → Exit session

---

## 💡 Usage Examples

### Making a Technology Decision

```
Mode: DECISION
Question: Should we migrate from RabbitMQ to Kafka for our loyalty event streaming?
```

Response includes:
- Clarifying questions
- Options analysis
- Pros/cons against your principles
- Recommendation with rationale
- Risks and mitigations
- Concrete next steps

### Generating an ADR

```
Mode: ADR
Question: We decided to adopt PostgreSQL as our primary database for the new loyalty 
core platform, replacing the mixed Oracle/MySQL landscape, because we need consistency 
across clients and better support for JSONB operations.
```

Generates a complete ADR with:
- Context and problem statement
- Decision and rationale
- Consequences (positive/negative)
- Alternatives considered

### Stakeholder Communication

```
Mode: STAKEHOLDER
Question: I need to present the 18-month tech debt reduction plan to the CFO who 
is skeptical about the investment.
```

Response includes:
- Audience analysis
- Key messages (business-focused)
- Anticipated objections
- Response strategies
- Draft communication outline

### Analyzing Tech Debt

```
Mode: TECHDEBT
Question: Analyze the technical debt in our loyalty points calculation engine 
that uses stored procedures and has no unit tests.
```

Response includes:
- Debt categorization (code, architecture, infrastructure, documentation)
- Impact assessment (business, velocity, risk)
- Prioritization matrix with cost of delay vs cost to fix
- Remediation strategy (quick wins, planned refactoring, major overhauls)
- Tracking metrics

### Managing Technical Backlog

```
Mode: BACKLOG
Question: We have these items: API versioning refactor, Oracle to PostgreSQL 
migration, authentication upgrade to OAuth2, and client onboarding automation. 
Help prioritize for Q2.
```

Response includes:
- Item analysis with T-shirt sizing and business value
- Dependencies mapping
- WSJF prioritization scores
- Sprint/quarter allocation recommendations
- Acceptance criteria per item

### Planning Milestones

```
Mode: MILESTONE
Question: Define the Q2 milestone for consolidating the first 5 airline clients 
onto the new shared platform.
```

Response includes:
- Milestone definition with success criteria
- Scope analysis (in/out of scope)
- Work breakdown with effort estimates
- Risk assessment and mitigation plans
- Go/No-Go criteria

---

## 🏗 Project Structure

```
archi-copilot/
├── src/
│   ├── extension.ts     # Main extension entry point
│   ├── prompts.ts       # Mode-specific prompts
│   ├── contextLoader.ts # Loads architecture memory
│   └── memoryWriter.ts  # Saves decisions/insights
├── architecture_memory/ # Your organizational context
├── package.json         # Extension manifest
├── tsconfig.json        # TypeScript config
└── README.md
```

---

## 🔧 Development

### Build & Watch

```bash
npm run compile    # One-time build
npm run watch      # Watch mode for development
```

### Debug

1. Open the project in VS Code
2. Press F5 to launch Extension Development Host
3. Test commands in the new window

### Package for Distribution

```bash
npm install -g @vscode/vsce
vsce package
```

This creates `archi-copilot-1.0.0.vsix` which can be installed in any VS Code.

---

## ❓ FAQ

**Q: Do I need an OpenAI API key?**  
A: No! This extension uses GitHub Copilot's built-in language model.

**Q: What GitHub Copilot plan do I need?**  
A: Any GitHub Copilot plan that includes chat functionality.

**Q: Where are saved decisions stored?**  
A: In `architecture_memory/decisions/` in your workspace.

**Q: Can I use this with multiple projects?**  
A: Yes! Copy the `architecture_memory/` folder to each project and customize.

**Q: How do I improve response quality?**  
A: Fill out the `architecture_memory/static/` files with detailed organizational context.

---

## 🎯 Designed For

This tool is designed for **Principal/Enterprise Architects** dealing with:

- Complex legacy modernization
- Multi-tenant platforms with custom implementations
- Tech debt prioritization
- Stakeholder management
- Architecture decision documentation
- Strategic technology choices

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- Additional slash commands for specific architecture patterns
- Templates for different frameworks (TOGAF, Zachman, C4)
- Integration with other documentation platforms
- Improved Admin Dashboard features
- Better prompt engineering for specific domains

---

## 🐛 Issues & Feature Requests

Found a bug or have a feature idea? [Open an issue](../../issues) on GitHub!

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! It helps others discover the project.

---

*Built with ❤️ for architects who want AI assistance without extra subscriptions.*
# archi-copilot
