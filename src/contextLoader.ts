/**
 * Context Loader - Builds context from architecture memory files and Confluence
 * Supports organization-level and project-specific context
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfluenceLoader } from './confluenceLoader';

export class ContextLoader {
    private confluenceLoader: ConfluenceLoader;
    private currentProject: string = 'loyalty'; // Default project

    constructor() {
        this.confluenceLoader = new ConfluenceLoader();
        this.loadProjectSetting();
    }

    private loadProjectSetting(): void {
        const config = vscode.workspace.getConfiguration('archi-copilot');
        this.currentProject = config.get<string>('activeProject') || 'loyalty';
    }

    setProject(projectName: string): void {
        this.currentProject = projectName;
    }

    getProject(): string {
        return this.currentProject;
    }

    getAvailableProjects(): string[] {
        const memoryPath = this.getMemoryPath();
        if (!memoryPath) {
            return [];
        }

        const projectsPath = path.join(memoryPath, 'projects');
        if (!fs.existsSync(projectsPath)) {
            return [];
        }

        try {
            return fs.readdirSync(projectsPath)
                .filter(f => fs.statSync(path.join(projectsPath, f)).isDirectory());
        } catch (e) {
            return [];
        }
    }
    
    private getMemoryPath(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return undefined;
        }
        
        // Look for architecture_memory in workspace root
        const memoryPath = path.join(workspaceFolders[0].uri.fsPath, 'architecture_memory');
        if (fs.existsSync(memoryPath)) {
            return memoryPath;
        }
        
        // Also check if we're inside archi-copilot folder
        const archiCopilotPath = path.join(workspaceFolders[0].uri.fsPath, 'archi-copilot', 'architecture_memory');
        if (fs.existsSync(archiCopilotPath)) {
            return archiCopilotPath;
        }
        
        return undefined;
    }

    async loadStaticContext(): Promise<string> {
        const memoryPath = this.getMemoryPath();
        if (!memoryPath) {
            return this.getDefaultContext();
        }

        const content: string[] = [];
        
        // Load organization-level context first (applies to all projects)
        const orgPath = path.join(memoryPath, 'organization');
        const orgFiles = ['principles.md', 'standards.md', 'glossary.md', 'governance.md'];
        
        if (fs.existsSync(orgPath)) {
            content.push('# ORGANIZATION CONTEXT\n');
            for (const filename of orgFiles) {
                const filePath = path.join(orgPath, filename);
                if (fs.existsSync(filePath)) {
                    try {
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        const truncated = fileContent.length > 6000 
                            ? fileContent.substring(0, 6000) + '\n\n[... truncated ...]'
                            : fileContent;
                        content.push(`## ${filename.replace('.md', '').toUpperCase()}\n\n${truncated}`);
                    } catch (e) {
                        // Skip files that can't be read
                    }
                }
            }
        }

        // Load project-specific context
        const projectPath = path.join(memoryPath, 'projects', this.currentProject);
        const projectFiles = [
            'context.md',
            'capabilities.md',
            'constraints.md',
            'decisions.md',
            'tech_debt.md',
            'roadmap.md',
            'risks.md',
            'politics.md',
            'glossary.md'
        ];

        if (fs.existsSync(projectPath)) {
            content.push(`\n# PROJECT CONTEXT: ${this.currentProject.toUpperCase()}\n`);
            for (const filename of projectFiles) {
                const filePath = path.join(projectPath, filename);
                if (fs.existsSync(filePath)) {
                    try {
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        const truncated = fileContent.length > 6000 
                            ? fileContent.substring(0, 6000) + '\n\n[... truncated ...]'
                            : fileContent;
                        content.push(`## ${filename.replace('.md', '').toUpperCase()}\n\n${truncated}`);
                    } catch (e) {
                        // Skip files that can't be read
                    }
                }
            }
        }

        // Fallback to old static folder structure for backward compatibility
        if (content.length === 0) {
            const staticPath = path.join(memoryPath, 'static');
            if (fs.existsSync(staticPath)) {
                const priorityFiles = [
                    'context.md', 'principles.md', 'constraints.md', 'decisions.md',
                    'capabilities.md', 'tech_debt.md', 'roadmap.md', 'risks.md',
                    'standards.md', 'politics.md', 'glossary.md'
                ];

                for (const filename of priorityFiles) {
                    const filePath = path.join(staticPath, filename);
                    if (fs.existsSync(filePath)) {
                        try {
                            const fileContent = fs.readFileSync(filePath, 'utf-8');
                            const truncated = fileContent.length > 8000 
                                ? fileContent.substring(0, 8000) + '\n\n[... truncated ...]'
                                : fileContent;
                            content.push(`## ${filename.replace('.md', '').toUpperCase()}\n\n${truncated}`);
                        } catch (e) {
                            // Skip files that can't be read
                        }
                    }
                }
            }
        }

        return content.length > 0 
            ? content.join('\n\n---\n\n')
            : this.getDefaultContext();
    }

    async loadRelevantMemories(query: string): Promise<string[]> {
        const memoryPath = this.getMemoryPath();
        if (!memoryPath) {
            return [];
        }

        const memories: string[] = [];
        const dirs = ['decisions', 'insights', 'politics'];

        for (const dir of dirs) {
            const dirPath = path.join(memoryPath, dir);
            if (!fs.existsSync(dirPath)) {
                continue;
            }

            try {
                const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
                
                // Get most recent files (up to 5)
                const sortedFiles = files.sort().reverse().slice(0, 5);
                
                for (const file of sortedFiles) {
                    const filePath = path.join(dirPath, file);
                    try {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        
                        // Simple keyword matching
                        const queryWords = query.toLowerCase().split(/\s+/);
                        const contentLower = content.toLowerCase();
                        
                        if (queryWords.some(word => word.length > 3 && contentLower.includes(word))) {
                            memories.push(`[${dir}/${file}]\n${content.substring(0, 2000)}`);
                        }
                    } catch (e) {
                        // Skip files that can't be read
                    }
                }
            } catch (e) {
                // Skip directories that can't be read
            }
        }

        return memories.slice(0, 5); // Limit to 5 most relevant
    }

    async buildContext(query: string): Promise<string> {
        const staticContext = await this.loadStaticContext();
        const relevantMemories = await this.loadRelevantMemories(query);

        // Load Confluence context if configured
        let confluenceContext = '';
        let confluenceRelevant: string[] = [];
        
        if (this.confluenceLoader.isConfigured()) {
            try {
                confluenceContext = await this.confluenceLoader.fetchSpacePages();
                confluenceRelevant = await this.confluenceLoader.searchRelevantPages(query);
            } catch (e) {
                console.error('Error loading Confluence context:', e);
            }
        }

        const memoryText = relevantMemories.length > 0
            ? relevantMemories.map(m => `- ${m}`).join('\n\n')
            : 'No directly relevant past decisions found.';

        const confluenceRelevantText = confluenceRelevant.length > 0
            ? confluenceRelevant.map(m => `- ${m}`).join('\n\n')
            : '';

        return `
${staticContext}

${confluenceContext ? '---\n\n' + confluenceContext : ''}

---

## RELEVANT PAST DECISIONS & INSIGHTS

${memoryText}

${confluenceRelevantText ? '\n## RELEVANT CONFLUENCE PAGES\n\n' + confluenceRelevantText : ''}

---

IMPORTANT GUIDELINES:
- Consider the organizational context and constraints above
- Reference relevant past decisions if applicable
- Provide practical, actionable recommendations
- Consider political and organizational viability
- Highlight any risks or concerns
`;
    }

    private getDefaultContext(): string {
        return `
# Default Architecture Context

No architecture_memory folder found in workspace.

To get full context-aware responses, create an architecture_memory folder with:
- static/context.md - Your organization overview
- static/principles.md - Architecture principles
- static/constraints.md - Constraints and limitations
- static/decisions.md - Decision log
- decisions/ - Saved ADRs
- insights/ - Saved insights

## Default Principles
1. **Stability Over Speed** - Prefer proven patterns
2. **Loose Coupling** - Systems should be independently deployable
3. **Configuration over Customization** - Avoid custom code per client
4. **Observability by Default** - All systems must be monitorable
5. **Security is Non-Negotiable** - Security requirements are not tradeable
`;
    }
}
