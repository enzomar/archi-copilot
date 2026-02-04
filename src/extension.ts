/**
 * Archi Copilot - VS Code Extension
 * Integrates as a Chat Participant in GitHub Copilot Chat
 */
import * as vscode from 'vscode';
import { ContextLoader } from './contextLoader';
import { MemoryWriter } from './memoryWriter';
import { ModePrompts, AgentMode } from './prompts';
import { AdminDashboard } from './adminDashboard';

const PARTICIPANT_ID = 'archi-copilot.archi';

let lastResponse: string = '';
let contextLoader: ContextLoader;
let memoryWriter: MemoryWriter;

// Map slash commands to modes
const SLASH_COMMAND_MAP: Record<string, AgentMode> = {
    'decision': AgentMode.DECISION,
    'adr': AgentMode.ADR,
    'review': AgentMode.REVIEW,
    'risks': AgentMode.RISKS,
    'stakeholder': AgentMode.STAKEHOLDER,
    'challenge': AgentMode.CHALLENGE,
    'techdebt': AgentMode.TECHDEBT,
    'backlog': AgentMode.BACKLOG,
    'milestone': AgentMode.MILESTONE,
};

interface ArchiChatResult extends vscode.ChatResult {
    metadata: {
        response: string;
        mode: AgentMode;
    };
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Archi Copilot is now active!');
    
    contextLoader = new ContextLoader();
    memoryWriter = new MemoryWriter();

    // Register the Chat Participant
    const archi = vscode.chat.createChatParticipant(PARTICIPANT_ID, handleChatRequest);
    archi.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
    
    // Register follow-up provider for save actions
    archi.followupProvider = {
        provideFollowups(result: ArchiChatResult, _context: vscode.ChatContext, _token: vscode.CancellationToken) {
            if (result.metadata?.response) {
                return [
                    {
                        prompt: 'Save this as an Architecture Decision',
                        command: 'saveDecision',
                        label: '💾 Save as Decision'
                    },
                    {
                        prompt: 'Save this as an Insight',
                        command: 'saveInsight', 
                        label: '📝 Save as Insight'
                    }
                ];
            }
            return [];
        }
    };

    context.subscriptions.push(archi);

    // Register save commands (can still be used from command palette)
    context.subscriptions.push(
        vscode.commands.registerCommand('archi-copilot.saveDecision', async () => {
            if (!lastResponse) {
                vscode.window.showWarningMessage('No recent response to save.');
                return;
            }
            await memoryWriter.saveAsDecision(lastResponse);
        }),
        vscode.commands.registerCommand('archi-copilot.saveInsight', async () => {
            if (!lastResponse) {
                vscode.window.showWarningMessage('No recent response to save.');
                return;
            }
            await memoryWriter.saveAsInsight(lastResponse);
        })
    );

    // Register Admin Dashboard command
    context.subscriptions.push(
        vscode.commands.registerCommand('archi-copilot.openAdmin', () => {
            AdminDashboard.createOrShow(context.extensionUri);
        })
    );

    // Ensure memory directories exist
    memoryWriter.ensureDirectories();
}

async function handleChatRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<ArchiChatResult> {
    
    // Determine mode from slash command
    let mode = AgentMode.ASK;
    if (request.command) {
        // Handle save commands
        if (request.command === 'saveDecision') {
            if (lastResponse) {
                await memoryWriter.saveAsDecision(lastResponse);
                stream.markdown('✅ **Saved as Architecture Decision!**\n\nThe response has been saved to `architecture_memory/decisions/`');
            } else {
                stream.markdown('⚠️ No recent response to save. Ask a question first!');
            }
            return { metadata: { response: '', mode: AgentMode.ASK } };
        }
        if (request.command === 'saveInsight') {
            if (lastResponse) {
                await memoryWriter.saveAsInsight(lastResponse);
                stream.markdown('✅ **Saved as Insight!**\n\nThe response has been saved to `architecture_memory/insights/`');
            } else {
                stream.markdown('⚠️ No recent response to save. Ask a question first!');
            }
            return { metadata: { response: '', mode: AgentMode.ASK } };
        }

        // Handle project commands
        if (request.command === 'projects') {
            const projects = contextLoader.getAvailableProjects();
            const current = contextLoader.getProject();
            if (projects.length === 0) {
                stream.markdown('⚠️ No projects found. Create folders under `architecture_memory/projects/`');
            } else {
                stream.markdown(`# 📁 Available Projects\n\n` +
                    projects.map(p => p === current ? `- **${p}** ✅ *(active)*` : `- ${p}`).join('\n') +
                    `\n\nUse \`/project <name>\` to switch projects.`);
            }
            return { metadata: { response: '', mode: AgentMode.ASK } };
        }

        if (request.command === 'project') {
            const projectName = request.prompt.trim();
            if (!projectName) {
                const current = contextLoader.getProject();
                stream.markdown(`📁 **Current project:** ${current}\n\nUse \`/project <name>\` to switch, or \`/projects\` to list available projects.`);
                return { metadata: { response: '', mode: AgentMode.ASK } };
            }
            
            const projects = contextLoader.getAvailableProjects();
            if (projects.includes(projectName)) {
                contextLoader.setProject(projectName);
                stream.markdown(`✅ **Switched to project: ${projectName}**\n\nAll subsequent questions will use the context from \`architecture_memory/projects/${projectName}/\``);
            } else {
                stream.markdown(`❌ **Project not found:** ${projectName}\n\nAvailable projects: ${projects.join(', ') || 'none'}\n\nCreate a new project by adding a folder under \`architecture_memory/projects/\``);
            }
            return { metadata: { response: '', mode: AgentMode.ASK } };
        }

        // Handle admin dashboard command
        if (request.command === 'admin') {
            vscode.commands.executeCommand('archi-copilot.openAdmin');
            stream.markdown(`🛠️ **Opening Admin Dashboard...**\n\nYou can:\n- 📁 Switch between projects\n- ✏️ Edit project context files\n- ➕ Create new projects\n- 🏢 Manage organization-wide settings\n\n> Tip: You can also open it from Command Palette: \`Archi Copilot: Open Admin Dashboard\``);
            return { metadata: { response: '', mode: AgentMode.ASK } };
        }

        mode = SLASH_COMMAND_MAP[request.command] || AgentMode.ASK;
    }

    const query = request.prompt;
    if (!query.trim()) {
        stream.markdown(getWelcomeMessage());
        return { metadata: { response: '', mode } };
    }

    // Show mode and project indicator
    stream.progress(`Analyzing with ${mode} mode (project: ${contextLoader.getProject()})...`);

    try {
        // Build architecture context
        const architectureContext = await contextLoader.buildContext(query);
        const systemPrompt = ModePrompts[mode];

        // Get the model to use
        const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
        if (!model) {
            stream.markdown('❌ **Error:** GitHub Copilot model not available. Please ensure Copilot is installed and you are signed in.');
            return { metadata: { response: '', mode } };
        }

        // Build messages with context
        const messages = [
            vscode.LanguageModelChatMessage.User(
                `${systemPrompt}\n\n` +
                `ORGANIZATIONAL CONTEXT:\n${architectureContext}\n\n` +
                `CONVERSATION HISTORY:\n${formatHistory(context.history)}\n\n` +
                `USER QUESTION: ${query}`
            )
        ];

        // Stream the response
        const response = await model.sendRequest(messages, {}, token);
        
        let fullResponse = '';
        for await (const chunk of response.text) {
            stream.markdown(chunk);
            fullResponse += chunk;
        }

        lastResponse = fullResponse;

        return { 
            metadata: { 
                response: fullResponse,
                mode 
            } 
        };

    } catch (error) {
        if (error instanceof vscode.CancellationError) {
            stream.markdown('🛑 Request cancelled.');
        } else {
            stream.markdown(`❌ **Error:** ${error}`);
        }
        return { metadata: { response: '', mode } };
    }
}

function formatHistory(history: readonly (vscode.ChatRequestTurn | vscode.ChatResponseTurn)[]): string {
    const relevantHistory = history.slice(-6); // Last 3 exchanges
    return relevantHistory.map(turn => {
        if (turn instanceof vscode.ChatRequestTurn) {
            return `User: ${turn.prompt}`;
        } else if (turn instanceof vscode.ChatResponseTurn) {
            const text = turn.response
                .filter((part): part is vscode.ChatResponseMarkdownPart => part instanceof vscode.ChatResponseMarkdownPart)
                .map(part => part.value.value)
                .join('');
            return `Assistant: ${text.substring(0, 500)}...`;
        }
        return '';
    }).filter(Boolean).join('\n');
}

function getWelcomeMessage(): string {
    const currentProject = contextLoader.getProject();
    const projects = contextLoader.getAvailableProjects();
    
    return `# 🧠 Archi Copilot

Welcome! I'm your Architecture Decision Support assistant.

**📁 Active Project:** \`${currentProject}\` ${projects.length > 1 ? `*(${projects.length} projects available)*` : ''}

## How to use me

Just ask your architecture question, or use a **slash command** for specialized modes:

### Analysis Commands
| Command | Purpose |
|---------|---------|
| \`/decision\` | Make architecture decisions with structured analysis |
| \`/adr\` | Generate Architecture Decision Records |
| \`/review\` | Review a proposal or design |
| \`/risks\` | Identify and analyze risks |
| \`/stakeholder\` | Prepare stakeholder communications |
| \`/challenge\` | Challenge assumptions or designs |
| \`/techdebt\` | Analyze technical debt |
| \`/backlog\` | Prioritize architecture backlog items |
| \`/milestone\` | Plan architecture milestones |

### Project & Save Commands
| Command | Purpose |
|---------|---------|
| \`/projects\` | List available projects |
| \`/project <name>\` | Switch to a different project |
| \`/saveDecision\` | Save last response as a decision |
| \`/saveInsight\` | Save last response as an insight |

## Examples

- \`@archi Should we use Kafka or RabbitMQ for our messaging?\`
- \`@archi /decision Which database for our new loyalty engine?\`
- \`@archi /project payments\` - Switch to payments project
- \`@archi /adr We decided to adopt PostgreSQL because...\`

I have access to your organization's architecture context and project-specific documentation.
`;
}

export function deactivate() {}
