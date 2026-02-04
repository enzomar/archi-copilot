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

## 🚀 Installation Guide

### Prerequisites

Before installing Archi Copilot, make sure you have:

| Requirement | Version | How to Check |
|-------------|---------|-------------|
| **VS Code** | 1.90.0+ | `code --version` |
| **Node.js** | 18.x+ | `node --version` |
| **npm** | 9.x+ | `npm --version` |
| **GitHub Copilot** | Active subscription | Check VS Code extensions |
| **GitHub Copilot Chat** | Installed | Check VS Code extensions |

> ⚠️ **Important:** You must have an active GitHub Copilot subscription with Chat enabled. This extension uses Copilot's language model - no separate API keys needed!

### Step 1: Clone the Repository

```bash
git clone https://github.com/vmarafioti/archi-copilot.git
cd archi-copilot
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including TypeScript and VS Code extension tools.

### Step 3: Compile the Extension

```bash
npm run compile
```

You should see no errors. If you do, make sure Node.js 18+ is installed.

### Step 4: Launch the Extension

**Option A: From VS Code (Recommended for Development)**
1. Open the `archi-copilot` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. A new VS Code window will open with the extension loaded

**Option B: Package and Install (For Regular Use)**
```bash
# Install the packaging tool
npm install -g @vscode/vsce

# Create the VSIX package
vsce package

# Install in VS Code
code --install-extension archi-copilot-1.0.0.vsix
```

### Step 5: Verify Installation

1. Open the **Copilot Chat** panel:
   - Click the chat icon in the sidebar, OR
   - Press `Cmd+Shift+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
2. Type `@archi` - you should see it autocomplete
3. Try: `@archi /projects` to list available projects

### Step 6: Set Up Your First Project

1. Open Admin Dashboard: `@archi /admin`
2. Create a new project or edit the sample project
3. Fill in your project context (stakeholders, constraints, tech stack)
4. Start asking architecture questions!

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `@archi` not appearing | Reload VS Code window (`Cmd+Shift+P` → "Reload Window") |
| Compile errors | Run `npm install` again, check Node.js version |
| Chat not working | Verify GitHub Copilot Chat is installed and signed in |
| Empty responses | Check that `architecture_memory/` folder exists |

---

## � Quick Examples (Copy & Paste!)

Try these in Copilot Chat right away:

```
@archi What are the key considerations for migrating from monolith to microservices?
```

```
@archi /decision Should we build or buy an API gateway?
```

```
@archi /risks What could go wrong with our cloud migration plan?
```

```
@archi /review Our team wants to use MongoDB for everything. Review this approach.
```

```
@archi /stakeholder How do I explain technical debt to a non-technical CEO?
```

```
@archi /admin
```

---

## �🌐 Confluence Integration

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

## 💡 Usage Examples & Real-World Scenarios

### 🟢 Scenario 1: Technology Decision

**You're evaluating message brokers for your e-commerce platform:**

```
@archi /decision Should we use Kafka or RabbitMQ for our order event streaming? 
We expect 10K orders/day initially, growing to 100K in 2 years.
```

**Archi Copilot will:**
- Ask clarifying questions about your constraints
- Analyze both options against your architecture principles
- Consider your team's skills (from context.md)
- Provide a recommendation with clear rationale
- List risks and mitigation strategies
- Suggest concrete next steps

---

### 🟢 Scenario 2: Generate an ADR

**Document a decision you've already made:**

```
@archi /adr We decided to use PostgreSQL instead of MongoDB for our product catalog 
because we need ACID transactions for inventory management and our team has stronger 
SQL skills. We considered MongoDB for its flexibility but decided consistency was more important.
```

**Archi Copilot generates a complete ADR with:**
- Title and status
- Context and problem statement
- Decision with full rationale
- Consequences (positive and negative)
- Alternatives considered and why rejected

---

### 🟢 Scenario 3: Review a Proposal

**Get critical feedback on architecture decisions:**

```
@archi /review Our proposal is to migrate all 15 microservices to Kubernetes 
in a single 3-month release. We'll do a big-bang cutover on a weekend.
```

**Archi Copilot will:**
- Identify risks in your approach (big-bang migration!)
- Challenge assumptions
- Suggest alternatives (incremental migration)
- Reference your risk register if relevant
- Recommend risk mitigations

---

### 🟢 Scenario 4: Stakeholder Communication

**Prepare for difficult conversations:**

```
@archi /stakeholder I need to convince our CFO to approve $500K for tech debt 
reduction. She's skeptical about ROI and thinks we should focus on new features.
```

**Archi Copilot provides:**
- CFO-focused messaging (cost savings, risk reduction, velocity)
- Anticipated objections and rebuttals
- ROI calculations approach
- Comparison: cost of doing nothing vs investing
- Draft talking points

---

### 🟢 Scenario 5: Risk Assessment

**Identify risks you might have missed:**

```
@archi /risks We're planning to migrate from on-premise Oracle to AWS Aurora 
PostgreSQL. The migration will happen over 6 months while both systems run in parallel.
```

**Archi Copilot identifies:**
- Data consistency risks during parallel run
- Stored procedure migration challenges
- Team skill gaps
- Rollback complexity
- Cost overrun scenarios
- Each with likelihood, impact, and mitigation

---

### 🟢 Scenario 6: Devil's Advocate

**Challenge your own assumptions:**

```
@archi /challenge We believe microservices will solve all our scaling problems 
and the migration will pay for itself in 12 months.
```

**Archi Copilot challenges:**
- "What evidence supports the 12-month payback?"
- "Have you accounted for operational complexity?"
- "What if your scaling problems are actually database-related?"
- Provides counter-arguments and alternative perspectives

---

### 🟢 Scenario 7: Tech Debt Analysis

**Prioritize technical debt remediation:**

```
@archi /techdebt Our payment service has: no unit tests, hardcoded config values, 
a 5000-line God class, and uses a deprecated encryption library.
```

**Archi Copilot provides:**
- Categorization (code, security, testing, architecture)
- Risk assessment for each item
- Prioritization matrix (quick wins vs major efforts)
- Recommended remediation sequence
- Effort estimates

---

### 🟢 Scenario 8: Sprint/Quarter Planning

**Prioritize your architecture backlog:**

```
@archi /backlog We have these items for Q2:
1. API gateway implementation
2. Database connection pooling optimization  
3. OAuth2 migration from legacy auth
4. Observability stack (logging, metrics, tracing)
5. CI/CD pipeline improvements
Help me prioritize.
```

**Archi Copilot provides:**
- T-shirt sizing for each item
- Business value assessment
- Dependencies between items
- WSJF scores
- Recommended sequence
- "What fits in Q2" analysis

---

### 🟢 Scenario 9: Milestone Planning

**Define clear milestones with success criteria:**

```
@archi /milestone Define the "API Gateway Live" milestone. We need to route 
30% of traffic through the new gateway by end of Q2.
```

**Archi Copilot provides:**
- Clear milestone definition
- Success criteria (measurable)
- In-scope / out-of-scope items
- Work breakdown structure
- Risk factors
- Go/No-Go checklist

---

### 🟢 Scenario 10: General Architecture Questions

**Just ask anything architecture-related:**

```
@archi What's the best approach for handling eventual consistency 
in our order management system?
```

```
@archi How should we structure our API versioning strategy 
for our public REST APIs?
```

```
@archi What are the tradeoffs between CQRS and traditional 
CRUD for our reporting use cases?
```

**Archi Copilot will answer in context of your:**
- Architecture principles
- Tech standards
- Current constraints
- Team capabilities

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

### General

**Q: Do I need an OpenAI API key?**  
A: No! This extension uses GitHub Copilot's built-in language model. No separate API keys or subscriptions required.

**Q: What GitHub Copilot plan do I need?**  
A: Any GitHub Copilot plan that includes Chat functionality (Individual, Business, or Enterprise).

**Q: Where are saved decisions stored?**  
A: In `architecture_memory/decisions/` in your workspace as markdown files.

**Q: Can I use this with multiple projects?**  
A: Yes! Create folders under `architecture_memory/projects/` for each project and switch between them using `@archi /project <name>`.

**Q: How do I improve response quality?**  
A: Fill out the `architecture_memory/` files with detailed organizational context - principles, constraints, stakeholders, tech stack. The more context you provide, the better the responses!

### LLM & Model Selection

**Q: How do I select which AI model to use?**  
A: The model is managed by GitHub Copilot based on your subscription - you don't select it directly. The extension uses `vscode.lm.selectChatModels()` API which returns available models from the `copilot` family. GitHub determines which model (GPT-4 class) to serve based on your license tier.

**Q: Can I use GPT-4, Claude, or other models?**  
A: The extension is designed for GitHub Copilot's models. It uses whatever model GitHub Copilot provides through VS Code's Language Model API. Enterprise customers may have access to additional model options.

**Q: Why can't I choose the model manually?**  
A: This is by design - GitHub Copilot manages model selection to ensure quality and compliance. The VS Code `vscode.lm` API abstracts the model choice, focusing on capability rather than specific model versions.

### Agent & Architecture

**Q: Is Archi Copilot an AI Agent?**  
A: It's best described as a **domain-specialized chat participant** with memory - not a fully autonomous agent. Here's the distinction:

| Capability | Archi Copilot | True AI Agent |
|------------|---------------|---------------|
| Responds to prompts | ✅ | ✅ |
| Has domain knowledge | ✅ | ✅ |
| Maintains context | ✅ | ✅ |
| Takes actions (save files) | ✅ Limited | ✅ Full |
| Plans multi-step tasks | ❌ | ✅ |
| Uses tools dynamically | ❌ | ✅ |
| Self-corrects in loops | ❌ | ✅ |

**Q: Can Archi Copilot execute commands or modify code?**  
A: Currently, it can only save responses as decisions or insights. It doesn't autonomously execute terminal commands, modify source code, or call external APIs. This is intentional for safety and predictability in enterprise environments.

**Q: Will Archi Copilot become a full agent?**  
A: Potentially! VS Code is developing "Agent Mode" capabilities for Copilot. Future versions could leverage this for autonomous multi-step tasks like analyzing codebases, creating tickets, or updating documentation.

### Troubleshooting

**Q: `@archi` doesn't appear in chat suggestions?**  
A: Reload VS Code window (`Cmd+Shift+P` → "Reload Window"). Make sure the extension compiled successfully with `npm run compile`.

**Q: Responses are generic and don't reflect my context?**  
A: Check that `architecture_memory/` folder exists in your workspace and contains populated markdown files. Run `@archi /projects` to verify projects are detected.

**Q: The Admin Dashboard shows empty dropdowns?**  
A: Ensure the `architecture_memory/projects/` folder contains at least one project subfolder with markdown files.

**Q: Confluence integration isn't working?**  
A: Verify your settings in VS Code: `baseUrl`, `spaceKey`, `username`, and `apiToken` must all be configured. Test your API token at [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens).

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
