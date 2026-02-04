/**
 * Admin Dashboard - Webview panel for managing architecture context
 * Structured form-based editing (no raw markdown!)
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class AdminDashboard {
    public static currentPanel: AdminDashboard | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (AdminDashboard.currentPanel) {
            AdminDashboard.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'archiCopilotAdmin',
            '🧠 Archi Copilot - Admin Dashboard',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [extensionUri]
            }
        );

        AdminDashboard.currentPanel = new AdminDashboard(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'getProjects':
                        this._sendProjects();
                        break;
                    case 'getProjectData':
                        this._sendProjectData(message.project);
                        break;
                    case 'saveProjectData':
                        await this._saveProjectData(message.project, message.fileType, message.data);
                        break;
                    case 'createProject':
                        await this._createProject(message.projectName);
                        break;
                    case 'getOrganizationData':
                        this._sendOrganizationData();
                        break;
                    case 'saveOrganizationData':
                        await this._saveOrganizationData(message.fileType, message.data);
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    private _getMemoryPath(): string | undefined {
        const extensionPath = this._extensionUri.fsPath;
        const extensionMemoryPath = path.join(extensionPath, 'architecture_memory');
        if (fs.existsSync(extensionMemoryPath)) return extensionMemoryPath;

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return undefined;
        
        const memoryPath = path.join(workspaceFolders[0].uri.fsPath, 'architecture_memory');
        if (fs.existsSync(memoryPath)) return memoryPath;
        
        return undefined;
    }

    private _sendProjects() {
        const memoryPath = this._getMemoryPath();
        if (!memoryPath) {
            this._panel.webview.postMessage({ command: 'projects', projects: [], memoryPath: 'Not found' });
            return;
        }

        const projectsPath = path.join(memoryPath, 'projects');
        let projects: string[] = [];
        
        if (fs.existsSync(projectsPath)) {
            projects = fs.readdirSync(projectsPath)
                .filter(f => fs.statSync(path.join(projectsPath, f)).isDirectory());
        }

        this._panel.webview.postMessage({ command: 'projects', projects, memoryPath });
    }

    private _parseMarkdown(content: string, fileType: string): any {
        switch (fileType) {
            case 'context': return this._parseContext(content);
            case 'risks': return this._parseRisks(content);
            case 'tech_debt': return this._parseTechDebt(content);
            case 'decisions': return this._parseDecisions(content);
            case 'glossary': return this._parseGlossary(content);
            case 'constraints': return this._parseConstraints(content);
            case 'capabilities': return this._parseCapabilities(content);
            case 'roadmap': return this._parseRoadmap(content);
            case 'politics': return this._parsePolitics(content);
            case 'principles': return this._parsePrinciples(content);
            case 'standards': return this._parseStandards(content);
            case 'governance': return this._parseGovernance(content);
            default: return { raw: content };
        }
    }

    private _generateMarkdown(data: any, fileType: string): string {
        switch (fileType) {
            case 'context': return this._generateContext(data);
            case 'risks': return this._generateRisks(data);
            case 'tech_debt': return this._generateTechDebt(data);
            case 'decisions': return this._generateDecisions(data);
            case 'glossary': return this._generateGlossary(data);
            case 'constraints': return this._generateConstraints(data);
            case 'capabilities': return this._generateCapabilities(data);
            case 'roadmap': return this._generateRoadmap(data);
            case 'politics': return this._generatePolitics(data);
            case 'principles': return this._generatePrinciples(data);
            case 'standards': return this._generateStandards(data);
            case 'governance': return this._generateGovernance(data);
            default: return data.raw || '';
        }
    }

    // === PARSERS ===
    
    private _parseContext(content: string): any {
        const sections = this._extractSections(content);
        return {
            title: this._extractTitle(content),
            overview: sections['Overview'] || sections['overview'] || '',
            stakeholders: this._parseTable(sections['Key Stakeholders'] || sections['Stakeholders'] || ''),
            techStack: sections['Technical Stack'] || sections['Tech Stack'] || sections['Technology'] || '',
            sites: sections['Sites'] || sections['Locations'] || '',
            notes: sections['Notes'] || sections['Additional Notes'] || ''
        };
    }

    private _parseRisks(content: string): any {
        const risks: any[] = [];
        const riskPattern = /###\s*(?:RISK-?\d*:?\s*)?(.*?)\n([\s\S]*?)(?=###\s|$)/gi;
        let match;
        
        while ((match = riskPattern.exec(content)) !== null) {
            const title = match[1].trim();
            const body = match[2];
            
            risks.push({
                id: this._extractField(body, 'ID') || `RISK-${risks.length + 1}`,
                title: title,
                description: this._extractField(body, 'Description') || this._extractFirstParagraph(body),
                likelihood: this._extractField(body, 'Likelihood') || 'Medium',
                impact: this._extractField(body, 'Impact') || 'Medium',
                mitigation: this._extractField(body, 'Mitigation') || '',
                owner: this._extractField(body, 'Owner') || '',
                status: this._extractField(body, 'Status') || 'Open'
            });
        }
        
        return { title: this._extractTitle(content), risks };
    }

    private _parseTechDebt(content: string): any {
        const items: any[] = [];
        const debtPattern = /###\s*(?:TD-?\d*:?\s*)?(.*?)\n([\s\S]*?)(?=###\s|$)/gi;
        let match;
        
        while ((match = debtPattern.exec(content)) !== null) {
            const title = match[1].trim();
            const body = match[2];
            
            items.push({
                id: this._extractField(body, 'ID') || `TD-${items.length + 1}`,
                title: title,
                description: this._extractField(body, 'Description') || this._extractFirstParagraph(body),
                type: this._extractField(body, 'Type') || 'Code',
                severity: this._extractField(body, 'Severity') || 'Medium',
                effort: this._extractField(body, 'Effort') || 'Medium',
                impact: this._extractField(body, 'Impact') || '',
                recommendation: this._extractField(body, 'Recommendation') || ''
            });
        }
        
        return { title: this._extractTitle(content), items };
    }

    private _parseDecisions(content: string): any {
        const decisions: any[] = [];
        const decisionPattern = /###\s*(?:DEC-?\d*:?\s*)?(.*?)\n([\s\S]*?)(?=###\s|$)/gi;
        let match;
        
        while ((match = decisionPattern.exec(content)) !== null) {
            const title = match[1].trim();
            const body = match[2];
            
            decisions.push({
                id: this._extractField(body, 'ID') || `DEC-${decisions.length + 1}`,
                title: title,
                status: this._extractField(body, 'Status') || 'Pending',
                context: this._extractField(body, 'Context') || '',
                options: this._extractField(body, 'Options') || '',
                decision: this._extractField(body, 'Decision') || '',
                consequences: this._extractField(body, 'Consequences') || '',
                date: this._extractField(body, 'Date') || ''
            });
        }
        
        return { title: this._extractTitle(content), decisions };
    }

    private _parseGlossary(content: string): any {
        const terms: any[] = [];
        const tableMatch = content.match(/\|.*\|.*\|[\s\S]*?(?=\n\n|\n#|$)/);
        
        if (tableMatch) {
            const rows = tableMatch[0].split('\n').filter(r => r.includes('|') && !r.includes('---'));
            rows.slice(1).forEach(row => {
                const cells = row.split('|').map(c => c.trim()).filter(c => c);
                if (cells.length >= 2) {
                    terms.push({ term: cells[0], definition: cells[1] });
                }
            });
        }
        
        return { title: this._extractTitle(content), terms };
    }

    private _parseConstraints(content: string): any {
        const sections = this._extractSections(content);
        const constraints: any[] = [];
        
        ['Technical Constraints', 'Regulatory Constraints', 'Organizational Constraints', 'Budget Constraints'].forEach(section => {
            const sectionContent = sections[section] || '';
            const items = sectionContent.match(/[-*]\s+\*\*(.*?)\*\*:?\s*([\s\S]*?)(?=[-*]\s+\*\*|$)/g) || [];
            items.forEach(item => {
                const match = item.match(/[-*]\s+\*\*(.*?)\*\*:?\s*([\s\S]*)/);
                if (match) {
                    constraints.push({
                        type: section.replace(' Constraints', ''),
                        name: match[1],
                        description: match[2].trim()
                    });
                }
            });
        });
        
        return { title: this._extractTitle(content), constraints };
    }

    private _parseCapabilities(content: string): any {
        const capabilities: any[] = [];
        const capPattern = /##\s*(.*?)\n([\s\S]*?)(?=\n##\s|$)/gi;
        let match;
        
        while ((match = capPattern.exec(content)) !== null) {
            const name = match[1].trim();
            const body = match[2];
            
            capabilities.push({
                name: name,
                description: this._extractFirstParagraph(body),
                systems: this._extractListItems(body)
            });
        }
        
        return { title: this._extractTitle(content), capabilities };
    }

    private _parseRoadmap(content: string): any {
        const milestones: any[] = [];
        const milestonePattern = /###\s*(.*?)\n([\s\S]*?)(?=###\s|$)/gi;
        let match;
        
        while ((match = milestonePattern.exec(content)) !== null) {
            const title = match[1].trim();
            const body = match[2];
            
            milestones.push({
                title: title,
                timeframe: this._extractField(body, 'Timeframe') || this._extractField(body, 'Timeline') || '',
                goals: this._extractListItems(body),
                status: this._extractField(body, 'Status') || 'Planned'
            });
        }
        
        return { title: this._extractTitle(content), milestones };
    }

    private _parsePolitics(content: string): any {
        const stakeholders: any[] = [];
        const stakeholderPattern = /###\s*(.*?)\n([\s\S]*?)(?=###\s|$)/gi;
        let match;
        
        while ((match = stakeholderPattern.exec(content)) !== null) {
            const name = match[1].trim();
            const body = match[2];
            
            stakeholders.push({
                name: name,
                role: this._extractField(body, 'Role') || '',
                influence: this._extractField(body, 'Influence') || 'Medium',
                stance: this._extractField(body, 'Stance') || 'Neutral',
                interests: this._extractField(body, 'Interests') || '',
                concerns: this._extractField(body, 'Concerns') || '',
                strategy: this._extractField(body, 'Strategy') || ''
            });
        }
        
        return { title: this._extractTitle(content), stakeholders };
    }

    private _parsePrinciples(content: string): any {
        const principles: any[] = [];
        const principlePattern = /###\s*(?:AP-?\d*:?\s*)?(.*?)\n([\s\S]*?)(?=###\s|$)/gi;
        let match;
        
        while ((match = principlePattern.exec(content)) !== null) {
            const name = match[1].trim();
            const body = match[2];
            
            principles.push({
                id: this._extractField(body, 'ID') || `AP-${principles.length + 1}`,
                name: name,
                statement: this._extractField(body, 'Statement') || this._extractFirstParagraph(body),
                rationale: this._extractField(body, 'Rationale') || '',
                implications: this._extractField(body, 'Implications') || ''
            });
        }
        
        return { title: this._extractTitle(content), principles };
    }

    private _parseStandards(content: string): any {
        const categories: any[] = [];
        const categoryPattern = /##\s*(.*?)\n([\s\S]*?)(?=##\s|$)/gi;
        let match;
        
        while ((match = categoryPattern.exec(content)) !== null) {
            const category = match[1].trim();
            const body = match[2];
            
            const technologies = this._parseTable(body);
            if (technologies.length > 0) {
                categories.push({ category, technologies });
            }
        }
        
        return { title: this._extractTitle(content), categories };
    }

    private _parseGovernance(content: string): any {
        const sections = this._extractSections(content);
        return {
            title: this._extractTitle(content),
            cabProcess: sections['CAB Process'] || sections['Change Advisory Board'] || '',
            arbProcess: sections['ARB Process'] || sections['Architecture Review Board'] || '',
            exceptions: sections['Exception Process'] || sections['Exceptions'] || '',
            escalation: sections['Escalation'] || sections['Escalation Path'] || ''
        };
    }

    // === GENERATORS ===

    private _generateContext(data: any): string {
        let md = `# ${data.title || 'Architecture Context'}\n\n`;
        if (data.overview) md += `## Overview\n\n${data.overview}\n\n`;
        if (data.stakeholders && data.stakeholders.length > 0) {
            md += `## Key Stakeholders\n\n| Stakeholder | Role | Interest |\n|-------------|------|----------|\n`;
            data.stakeholders.forEach((s: any) => {
                md += `| ${s.Stakeholder || s.stakeholder || ''} | ${s.Role || s.role || ''} | ${s.Interest || s.interest || ''} |\n`;
            });
            md += '\n';
        }
        if (data.techStack) md += `## Technical Stack\n\n${data.techStack}\n\n`;
        if (data.sites) md += `## Sites\n\n${data.sites}\n\n`;
        if (data.notes) md += `## Notes\n\n${data.notes}\n`;
        return md;
    }

    private _generateRisks(data: any): string {
        let md = `# ${data.title || 'Risk Register'}\n\n`;
        if (data.risks && data.risks.length > 0) {
            data.risks.forEach((r: any) => {
                md += `### ${r.title}\n\n`;
                md += `- **ID:** ${r.id}\n`;
                md += `- **Likelihood:** ${r.likelihood}\n`;
                md += `- **Impact:** ${r.impact}\n`;
                md += `- **Status:** ${r.status}\n`;
                if (r.owner) md += `- **Owner:** ${r.owner}\n`;
                md += `\n**Description:** ${r.description}\n\n`;
                if (r.mitigation) md += `**Mitigation:** ${r.mitigation}\n\n`;
            });
        }
        return md;
    }

    private _generateTechDebt(data: any): string {
        let md = `# ${data.title || 'Technical Debt Register'}\n\n`;
        if (data.items && data.items.length > 0) {
            data.items.forEach((item: any) => {
                md += `### ${item.title}\n\n`;
                md += `- **ID:** ${item.id}\n`;
                md += `- **Type:** ${item.type}\n`;
                md += `- **Severity:** ${item.severity}\n`;
                md += `- **Effort:** ${item.effort}\n`;
                md += `\n**Description:** ${item.description}\n\n`;
                if (item.impact) md += `**Impact:** ${item.impact}\n\n`;
                if (item.recommendation) md += `**Recommendation:** ${item.recommendation}\n\n`;
            });
        }
        return md;
    }

    private _generateDecisions(data: any): string {
        let md = `# ${data.title || 'Decision Log'}\n\n`;
        if (data.decisions && data.decisions.length > 0) {
            data.decisions.forEach((d: any) => {
                md += `### ${d.title}\n\n`;
                md += `- **ID:** ${d.id}\n`;
                md += `- **Status:** ${d.status}\n`;
                if (d.date) md += `- **Date:** ${d.date}\n`;
                md += `\n`;
                if (d.context) md += `**Context:** ${d.context}\n\n`;
                if (d.options) md += `**Options:** ${d.options}\n\n`;
                if (d.decision) md += `**Decision:** ${d.decision}\n\n`;
                if (d.consequences) md += `**Consequences:** ${d.consequences}\n\n`;
            });
        }
        return md;
    }

    private _generateGlossary(data: any): string {
        let md = `# ${data.title || 'Glossary'}\n\n`;
        if (data.terms && data.terms.length > 0) {
            md += `| Term | Definition |\n|------|------------|\n`;
            data.terms.forEach((t: any) => {
                md += `| ${t.term} | ${t.definition} |\n`;
            });
        }
        return md;
    }

    private _generateConstraints(data: any): string {
        let md = `# ${data.title || 'Constraints'}\n\n`;
        const byType: Record<string, any[]> = {};
        (data.constraints || []).forEach((c: any) => {
            if (!byType[c.type]) byType[c.type] = [];
            byType[c.type].push(c);
        });
        Object.entries(byType).forEach(([type, items]) => {
            md += `## ${type} Constraints\n\n`;
            items.forEach(c => {
                md += `- **${c.name}:** ${c.description}\n`;
            });
            md += '\n';
        });
        return md;
    }

    private _generateCapabilities(data: any): string {
        let md = `# ${data.title || 'Business Capabilities'}\n\n`;
        (data.capabilities || []).forEach((cap: any) => {
            md += `## ${cap.name}\n\n`;
            if (cap.description) md += `${cap.description}\n\n`;
            if (cap.systems && cap.systems.length > 0) {
                cap.systems.forEach((s: string) => md += `- ${s}\n`);
                md += '\n';
            }
        });
        return md;
    }

    private _generateRoadmap(data: any): string {
        let md = `# ${data.title || 'Roadmap'}\n\n`;
        (data.milestones || []).forEach((m: any) => {
            md += `### ${m.title}\n\n`;
            if (m.timeframe) md += `**Timeframe:** ${m.timeframe}\n\n`;
            if (m.status) md += `**Status:** ${m.status}\n\n`;
            if (m.goals && m.goals.length > 0) {
                m.goals.forEach((g: string) => md += `- ${g}\n`);
                md += '\n';
            }
        });
        return md;
    }

    private _generatePolitics(data: any): string {
        let md = `# ${data.title || 'Stakeholder Dynamics'}\n\n> ⚠️ CONFIDENTIAL\n\n`;
        (data.stakeholders || []).forEach((s: any) => {
            md += `### ${s.name}\n\n`;
            if (s.role) md += `- **Role:** ${s.role}\n`;
            if (s.influence) md += `- **Influence:** ${s.influence}\n`;
            if (s.stance) md += `- **Stance:** ${s.stance}\n`;
            md += '\n';
            if (s.interests) md += `**Interests:** ${s.interests}\n\n`;
            if (s.concerns) md += `**Concerns:** ${s.concerns}\n\n`;
            if (s.strategy) md += `**Strategy:** ${s.strategy}\n\n`;
        });
        return md;
    }

    private _generatePrinciples(data: any): string {
        let md = `# ${data.title || 'Architecture Principles'}\n\n`;
        (data.principles || []).forEach((p: any) => {
            md += `### ${p.id}: ${p.name}\n\n`;
            if (p.statement) md += `**Statement:** ${p.statement}\n\n`;
            if (p.rationale) md += `**Rationale:** ${p.rationale}\n\n`;
            if (p.implications) md += `**Implications:** ${p.implications}\n\n`;
        });
        return md;
    }

    private _generateStandards(data: any): string {
        let md = `# ${data.title || 'Technology Standards'}\n\n`;
        (data.categories || []).forEach((cat: any) => {
            md += `## ${cat.category}\n\n`;
            if (cat.technologies && cat.technologies.length > 0) {
                const headers = Object.keys(cat.technologies[0]);
                md += `| ${headers.join(' | ')} |\n`;
                md += `| ${headers.map(() => '---').join(' | ')} |\n`;
                cat.technologies.forEach((t: any) => {
                    md += `| ${headers.map(h => t[h] || '').join(' | ')} |\n`;
                });
                md += '\n';
            }
        });
        return md;
    }

    private _generateGovernance(data: any): string {
        let md = `# ${data.title || 'Governance'}\n\n`;
        if (data.cabProcess) md += `## CAB Process\n\n${data.cabProcess}\n\n`;
        if (data.arbProcess) md += `## ARB Process\n\n${data.arbProcess}\n\n`;
        if (data.exceptions) md += `## Exception Process\n\n${data.exceptions}\n\n`;
        if (data.escalation) md += `## Escalation\n\n${data.escalation}\n\n`;
        return md;
    }

    // === HELPER METHODS ===

    private _extractTitle(content: string): string {
        const match = content.match(/^#\s+(.+)/m);
        return match ? match[1].trim() : '';
    }

    private _extractSections(content: string): Record<string, string> {
        const sections: Record<string, string> = {};
        const sectionPattern = /##\s+(.+?)\n([\s\S]*?)(?=\n##\s|$)/g;
        let match;
        while ((match = sectionPattern.exec(content)) !== null) {
            sections[match[1].trim()] = match[2].trim();
        }
        return sections;
    }

    private _extractField(content: string, field: string): string {
        const patterns = [
            new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'i'),
            new RegExp(`-\\s*\\*\\*${field}:\\*\\*\\s*(.+)`, 'i'),
            new RegExp(`${field}:\\s*(.+)`, 'i')
        ];
        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) return match[1].trim();
        }
        return '';
    }

    private _extractFirstParagraph(content: string): string {
        const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('|'));
        return lines[0] || '';
    }

    private _extractListItems(content: string): string[] {
        const items: string[] = [];
        const listPattern = /[-*]\s+(.+)/g;
        let match;
        while ((match = listPattern.exec(content)) !== null) {
            items.push(match[1].trim());
        }
        return items;
    }

    private _parseTable(content: string): any[] {
        const rows: any[] = [];
        const lines = content.split('\n').filter(l => l.includes('|'));
        if (lines.length < 2) return rows;
        const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
        lines.slice(2).forEach(line => {
            const cells = line.split('|').map(c => c.trim()).filter(c => c);
            if (cells.length === headers.length) {
                const row: any = {};
                headers.forEach((h, i) => row[h] = cells[i]);
                rows.push(row);
            }
        });
        return rows;
    }

    private _sendProjectData(project: string) {
        const memoryPath = this._getMemoryPath();
        if (!memoryPath) return;

        const projectPath = path.join(memoryPath, 'projects', project);
        const fileTypes = ['context', 'capabilities', 'constraints', 'decisions', 'tech_debt', 'roadmap', 'risks', 'politics', 'glossary'];
        const data: Record<string, any> = {};
        
        for (const fileType of fileTypes) {
            const filePath = path.join(projectPath, `${fileType}.md`);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                data[fileType] = this._parseMarkdown(content, fileType);
            } else {
                data[fileType] = null;
            }
        }

        this._panel.webview.postMessage({ command: 'projectData', project, data });
    }

    private _sendOrganizationData() {
        const memoryPath = this._getMemoryPath();
        if (!memoryPath) return;

        const orgPath = path.join(memoryPath, 'organization');
        const fileTypes = ['principles', 'standards', 'glossary', 'governance'];
        const data: Record<string, any> = {};
        
        for (const fileType of fileTypes) {
            const filePath = path.join(orgPath, `${fileType}.md`);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                data[fileType] = this._parseMarkdown(content, fileType);
            } else {
                data[fileType] = null;
            }
        }

        this._panel.webview.postMessage({ command: 'organizationData', data });
    }

    private async _saveProjectData(project: string, fileType: string, data: any) {
        const memoryPath = this._getMemoryPath();
        if (!memoryPath) return;

        const filePath = path.join(memoryPath, 'projects', project, `${fileType}.md`);
        const markdown = this._generateMarkdown(data, fileType);
        
        try {
            fs.writeFileSync(filePath, markdown, 'utf-8');
            this._panel.webview.postMessage({ command: 'saveResult', success: true, message: `Saved ${fileType}` });
        } catch (error) {
            this._panel.webview.postMessage({ command: 'saveResult', success: false, message: `Error: ${error}` });
        }
    }

    private async _saveOrganizationData(fileType: string, data: any) {
        const memoryPath = this._getMemoryPath();
        if (!memoryPath) return;

        const filePath = path.join(memoryPath, 'organization', `${fileType}.md`);
        const markdown = this._generateMarkdown(data, fileType);
        
        try {
            fs.writeFileSync(filePath, markdown, 'utf-8');
            this._panel.webview.postMessage({ command: 'saveResult', success: true, message: `Saved ${fileType}` });
        } catch (error) {
            this._panel.webview.postMessage({ command: 'saveResult', success: false, message: `Error: ${error}` });
        }
    }

    private async _createProject(projectName: string) {
        const memoryPath = this._getMemoryPath();
        if (!memoryPath) return;

        const projectPath = path.join(memoryPath, 'projects', projectName);
        
        try {
            fs.mkdirSync(projectPath, { recursive: true });
            
            const templates: Record<string, any> = {
                context: { title: `${projectName} - Architecture Context`, overview: '', stakeholders: [], techStack: '', sites: '', notes: '' },
                capabilities: { title: `Business Capabilities - ${projectName}`, capabilities: [] },
                constraints: { title: `Constraints - ${projectName}`, constraints: [] },
                decisions: { title: `Decision Log - ${projectName}`, decisions: [] },
                tech_debt: { title: `Technical Debt - ${projectName}`, items: [] },
                roadmap: { title: `Roadmap - ${projectName}`, milestones: [] },
                risks: { title: `Risk Register - ${projectName}`, risks: [] },
                politics: { title: `Stakeholder Dynamics - ${projectName}`, stakeholders: [] },
                glossary: { title: `Glossary - ${projectName}`, terms: [] }
            };

            for (const [fileType, data] of Object.entries(templates)) {
                const markdown = this._generateMarkdown(data, fileType);
                fs.writeFileSync(path.join(projectPath, `${fileType}.md`), markdown, 'utf-8');
            }

            this._panel.webview.postMessage({ command: 'projectCreated', success: true, projectName });
            this._sendProjects();
        } catch (error) {
            this._panel.webview.postMessage({ command: 'projectCreated', success: false, message: `Error: ${error}` });
        }
    }

    private _update() {
        this._panel.webview.html = this._getHtmlContent();
    }

    private _getHtmlContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archi Copilot Admin</title>
    <style>
        :root {
            --bg: var(--vscode-editor-background);
            --fg: var(--vscode-editor-foreground);
            --border: var(--vscode-panel-border);
            --btn-bg: var(--vscode-button-background);
            --btn-fg: var(--vscode-button-foreground);
            --btn-hover: var(--vscode-button-hoverBackground);
            --input-bg: var(--vscode-input-background);
            --input-border: var(--vscode-input-border);
            --card-bg: var(--vscode-editorWidget-background);
            --success: #4caf50;
            --danger: #f44336;
            --warning: #ff9800;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--vscode-font-family); background: var(--bg); color: var(--fg); padding: 20px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border); }
        h1 { font-size: 1.5rem; display: flex; align-items: center; gap: 10px; }
        h2 { font-size: 1.2rem; margin: 20px 0 10px; }
        h3 { font-size: 1rem; margin: 15px 0 8px; color: var(--btn-bg); }
        .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 20px; }
        .tab { padding: 10px 20px; background: transparent; border: none; color: var(--fg); cursor: pointer; border-bottom: 2px solid transparent; opacity: 0.7; }
        .tab:hover { opacity: 1; }
        .tab.active { opacity: 1; border-bottom-color: var(--btn-bg); }
        .panel { display: none; }
        .panel.active { display: block; }
        .selector { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        select, input[type="text"], input[type="date"], textarea {
            padding: 8px 12px; background: var(--input-bg); border: 1px solid var(--input-border);
            color: var(--fg); border-radius: 4px; font-size: 14px; font-family: inherit;
        }
        select { min-width: 200px; }
        textarea { width: 100%; min-height: 80px; resize: vertical; }
        button {
            padding: 8px 16px; background: var(--btn-bg); color: var(--btn-fg); border: none;
            border-radius: 4px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 6px;
        }
        button:hover { background: var(--btn-hover); }
        button.secondary { background: transparent; border: 1px solid var(--border); color: var(--fg); }
        button.danger { background: var(--danger); }
        button.small { padding: 4px 8px; font-size: 12px; }
        .file-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .file-btn { padding: 8px 16px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 4px; cursor: pointer; color: var(--fg); }
        .file-btn:hover { border-color: var(--btn-bg); }
        .file-btn.active { background: var(--btn-bg); color: var(--btn-fg); border-color: var(--btn-bg); }
        .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 15px; margin-bottom: 15px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .card-title { font-weight: bold; }
        .form-group { margin-bottom: 12px; }
        .form-group label { display: block; font-size: 12px; margin-bottom: 4px; opacity: 0.8; }
        .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end; }
        .toast { position: fixed; bottom: 20px; right: 20px; padding: 12px 20px; border-radius: 4px; color: white; opacity: 0; transition: opacity 0.3s; z-index: 1000; }
        .toast.show { opacity: 1; }
        .toast.success { background: var(--success); }
        .toast.error { background: var(--danger); }
        .add-section { border: 2px dashed var(--border); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
        .add-section:hover { opacity: 1; border-color: var(--btn-bg); }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--border); }
        th { font-size: 12px; opacity: 0.7; }
        .actions { text-align: right; white-space: nowrap; }
        .empty-state { text-align: center; padding: 40px; opacity: 0.6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 Archi Copilot Admin</h1>
        <button id="save-btn">💾 Save Changes</button>
    </div>
    
    <div class="tabs">
        <button class="tab active" data-tab="projects">📁 Projects</button>
        <button class="tab" data-tab="organization">🏢 Organization</button>
    </div>
    
    <div id="projects-panel" class="panel active">
        <div class="selector">
            <label><strong>Project:</strong></label>
            <select id="project-select"><option value="">Select a project...</option></select>
            <button id="refresh-btn" class="secondary">🔄</button>
            <input type="text" id="new-project-name" placeholder="New project name..." style="width: 200px;">
            <button id="create-btn">➕ Create</button>
        </div>
        <div id="project-content" style="display: none;">
            <div class="file-nav" id="file-nav"></div>
            <div id="editor-area"></div>
        </div>
    </div>
    
    <div id="organization-panel" class="panel">
        <div class="file-nav" id="org-file-nav"></div>
        <div id="org-editor-area"></div>
    </div>
    
    <div id="toast" class="toast"></div>
    
    <script>
        const vscode = acquireVsCodeApi();
        let currentProject = '', currentFile = 'context', currentOrgFile = 'principles';
        let projectData = {}, orgData = {};
        
        const fileConfig = {
            context: { icon: '📋', label: 'Context' },
            capabilities: { icon: '🎯', label: 'Capabilities' },
            constraints: { icon: '🚧', label: 'Constraints' },
            decisions: { icon: '⚖️', label: 'Decisions' },
            tech_debt: { icon: '🔧', label: 'Tech Debt' },
            roadmap: { icon: '🗓️', label: 'Roadmap' },
            risks: { icon: '⚠️', label: 'Risks' },
            politics: { icon: '🤝', label: 'Politics' },
            glossary: { icon: '📖', label: 'Glossary' }
        };
        
        const orgFileConfig = {
            principles: { icon: '📜', label: 'Principles' },
            standards: { icon: '📊', label: 'Standards' },
            glossary: { icon: '📖', label: 'Glossary' },
            governance: { icon: '🏛️', label: 'Governance' }
        };
        
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + '-panel').classList.add('active');
                if (tab.dataset.tab === 'organization' && Object.keys(orgData).length === 0) {
                    vscode.postMessage({ command: 'getOrganizationData' });
                }
            });
        });
        
        document.getElementById('project-select').addEventListener('change', (e) => {
            currentProject = e.target.value;
            if (currentProject) {
                vscode.postMessage({ command: 'getProjectData', project: currentProject });
            } else {
                document.getElementById('project-content').style.display = 'none';
            }
        });
        
        document.getElementById('refresh-btn').addEventListener('click', () => vscode.postMessage({ command: 'getProjects' }));
        
        document.getElementById('create-btn').addEventListener('click', () => {
            const name = document.getElementById('new-project-name').value.trim();
            if (name) {
                vscode.postMessage({ command: 'createProject', projectName: name });
                document.getElementById('new-project-name').value = '';
            }
        });
        
        document.getElementById('save-btn').addEventListener('click', saveCurrentFile);
        
        function saveCurrentFile() {
            const activeTab = document.querySelector('.tab.active').dataset.tab;
            if (activeTab === 'projects' && currentProject && projectData[currentFile]) {
                collectFormData();
                vscode.postMessage({ command: 'saveProjectData', project: currentProject, fileType: currentFile, data: projectData[currentFile] });
            } else if (activeTab === 'organization' && orgData[currentOrgFile]) {
                collectOrgFormData();
                vscode.postMessage({ command: 'saveOrganizationData', fileType: currentOrgFile, data: orgData[currentOrgFile] });
            }
        }
        
        function renderFileNav() {
            const nav = document.getElementById('file-nav');
            nav.innerHTML = Object.entries(fileConfig).map(([key, cfg]) => 
                '<button class="file-btn ' + (key === currentFile ? 'active' : '') + '" data-file="' + key + '">' + cfg.icon + ' ' + cfg.label + '</button>'
            ).join('');
            nav.querySelectorAll('.file-btn').forEach(btn => {
                btn.addEventListener('click', () => { currentFile = btn.dataset.file; renderFileNav(); renderEditor(); });
            });
        }
        
        function renderOrgFileNav() {
            const nav = document.getElementById('org-file-nav');
            nav.innerHTML = Object.entries(orgFileConfig).map(([key, cfg]) => 
                '<button class="file-btn ' + (key === currentOrgFile ? 'active' : '') + '" data-file="' + key + '">' + cfg.icon + ' ' + cfg.label + '</button>'
            ).join('');
            nav.querySelectorAll('.file-btn').forEach(btn => {
                btn.addEventListener('click', () => { currentOrgFile = btn.dataset.file; renderOrgFileNav(); renderOrgEditor(); });
            });
        }
        
        function renderEditor() {
            const area = document.getElementById('editor-area');
            const data = projectData[currentFile];
            if (!data) { area.innerHTML = '<div class="empty-state">No data available</div>'; return; }
            
            switch (currentFile) {
                case 'context': area.innerHTML = renderContextEditor(data); break;
                case 'risks': area.innerHTML = renderRisksEditor(data); break;
                case 'tech_debt': area.innerHTML = renderTechDebtEditor(data); break;
                case 'decisions': area.innerHTML = renderDecisionsEditor(data); break;
                case 'glossary': area.innerHTML = renderGlossaryEditor(data); break;
                case 'constraints': area.innerHTML = renderConstraintsEditor(data); break;
                case 'capabilities': area.innerHTML = renderCapabilitiesEditor(data); break;
                case 'roadmap': area.innerHTML = renderRoadmapEditor(data); break;
                case 'politics': area.innerHTML = renderPoliticsEditor(data); break;
                default: area.innerHTML = '<div class="empty-state">Editor not available</div>';
            }
            attachEditorEvents();
        }
        
        function renderOrgEditor() {
            const area = document.getElementById('org-editor-area');
            const data = orgData[currentOrgFile];
            if (!data) { area.innerHTML = '<div class="empty-state">No data available</div>'; return; }
            
            switch (currentOrgFile) {
                case 'principles': area.innerHTML = renderPrinciplesEditor(data); break;
                case 'standards': area.innerHTML = renderStandardsEditor(data); break;
                case 'glossary': area.innerHTML = renderGlossaryEditor(data); break;
                case 'governance': area.innerHTML = renderGovernanceEditor(data); break;
                default: area.innerHTML = '<div class="empty-state">Editor not available</div>';
            }
            attachEditorEvents();
        }
        
        function esc(str) { return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
        
        function renderContextEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div>' +
                '<div class="form-group"><label>Overview</label><textarea id="overview" rows="4">' + esc(data.overview) + '</textarea></div>' +
                '<div class="form-group"><label>Technical Stack</label><textarea id="techStack" rows="3">' + esc(data.techStack) + '</textarea></div>' +
                '<div class="form-group"><label>Sites / Locations</label><textarea id="sites" rows="2">' + esc(data.sites) + '</textarea></div>' +
                '<h3>Stakeholders</h3><div id="stakeholders-list">' +
                (data.stakeholders || []).map((s, i) => 
                    '<div class="card" data-index="' + i + '"><div class="form-row">' +
                    '<div class="form-group"><label>Name</label><input type="text" class="stakeholder-name" value="' + esc(s.Stakeholder || s.stakeholder) + '"></div>' +
                    '<div class="form-group"><label>Role</label><input type="text" class="stakeholder-role" value="' + esc(s.Role || s.role) + '"></div>' +
                    '<div class="form-group"><label>Interest</label><input type="text" class="stakeholder-interest" value="' + esc(s.Interest || s.interest) + '"></div>' +
                    '<button class="small danger remove-item" data-list="stakeholders" data-index="' + i + '">✕</button>' +
                    '</div></div>'
                ).join('') + '</div><div class="add-section" onclick="addStakeholder()">+ Add Stakeholder</div>';
        }
        
        function renderRisksEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Risks</h3><div id="risks-list">' +
                (data.risks || []).map((r, i) => 
                    '<div class="card" data-index="' + i + '"><div class="card-header"><span class="card-title">' + esc(r.id) + ': ' + esc(r.title) + '</span>' +
                    '<button class="small danger remove-item" data-list="risks" data-index="' + i + '">✕ Remove</button></div>' +
                    '<div class="form-row"><div class="form-group"><label>ID</label><input type="text" class="risk-id" value="' + esc(r.id) + '"></div>' +
                    '<div class="form-group"><label>Title</label><input type="text" class="risk-title" value="' + esc(r.title) + '"></div></div>' +
                    '<div class="form-group"><label>Description</label><textarea class="risk-description" rows="2">' + esc(r.description) + '</textarea></div>' +
                    '<div class="form-row"><div class="form-group"><label>Likelihood</label><select class="risk-likelihood">' +
                    ['Low','Medium','High','Critical'].map(o => '<option value="' + o + '"' + (r.likelihood === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
                    '<div class="form-group"><label>Impact</label><select class="risk-impact">' +
                    ['Low','Medium','High','Critical'].map(o => '<option value="' + o + '"' + (r.impact === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
                    '<div class="form-group"><label>Status</label><select class="risk-status">' +
                    ['Open','Mitigating','Accepted','Closed'].map(o => '<option value="' + o + '"' + (r.status === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
                    '<div class="form-group"><label>Owner</label><input type="text" class="risk-owner" value="' + esc(r.owner) + '"></div></div>' +
                    '<div class="form-group"><label>Mitigation</label><textarea class="risk-mitigation" rows="2">' + esc(r.mitigation) + '</textarea></div></div>'
                ).join('') + '</div><div class="add-section" onclick="addRisk()">+ Add Risk</div>';
        }
        
        function renderTechDebtEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Technical Debt Items</h3><div id="items-list">' +
                (data.items || []).map((item, i) => 
                    '<div class="card" data-index="' + i + '"><div class="card-header"><span class="card-title">' + esc(item.id) + ': ' + esc(item.title) + '</span>' +
                    '<button class="small danger remove-item" data-list="items" data-index="' + i + '">✕ Remove</button></div>' +
                    '<div class="form-row"><div class="form-group"><label>ID</label><input type="text" class="item-id" value="' + esc(item.id) + '"></div>' +
                    '<div class="form-group"><label>Title</label><input type="text" class="item-title" value="' + esc(item.title) + '"></div></div>' +
                    '<div class="form-group"><label>Description</label><textarea class="item-description" rows="2">' + esc(item.description) + '</textarea></div>' +
                    '<div class="form-row"><div class="form-group"><label>Type</label><select class="item-type">' +
                    ['Code','Architecture','Infrastructure','Documentation','Testing'].map(o => '<option value="' + o + '"' + (item.type === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
                    '<div class="form-group"><label>Severity</label><select class="item-severity">' +
                    ['Low','Medium','High','Critical'].map(o => '<option value="' + o + '"' + (item.severity === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
                    '<div class="form-group"><label>Effort</label><select class="item-effort">' +
                    ['Low','Medium','High'].map(o => '<option value="' + o + '"' + (item.effort === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div></div>' +
                    '<div class="form-group"><label>Impact</label><textarea class="item-impact" rows="2">' + esc(item.impact) + '</textarea></div>' +
                    '<div class="form-group"><label>Recommendation</label><textarea class="item-recommendation" rows="2">' + esc(item.recommendation) + '</textarea></div></div>'
                ).join('') + '</div><div class="add-section" onclick="addTechDebtItem()">+ Add Tech Debt Item</div>';
        }
        
        function renderDecisionsEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Decisions</h3><div id="decisions-list">' +
                (data.decisions || []).map((d, i) => 
                    '<div class="card" data-index="' + i + '"><div class="card-header"><span class="card-title">' + esc(d.id) + ': ' + esc(d.title) + '</span>' +
                    '<button class="small danger remove-item" data-list="decisions" data-index="' + i + '">✕ Remove</button></div>' +
                    '<div class="form-row"><div class="form-group"><label>ID</label><input type="text" class="decision-id" value="' + esc(d.id) + '"></div>' +
                    '<div class="form-group"><label>Title</label><input type="text" class="decision-title" value="' + esc(d.title) + '"></div>' +
                    '<div class="form-group"><label>Status</label><select class="decision-status">' +
                    ['Pending','Approved','Rejected','Superseded'].map(o => '<option value="' + o + '"' + (d.status === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
                    '<div class="form-group"><label>Date</label><input type="text" class="decision-date" value="' + esc(d.date) + '"></div></div>' +
                    '<div class="form-group"><label>Context</label><textarea class="decision-context" rows="2">' + esc(d.context) + '</textarea></div>' +
                    '<div class="form-group"><label>Options Considered</label><textarea class="decision-options" rows="2">' + esc(d.options) + '</textarea></div>' +
                    '<div class="form-group"><label>Decision</label><textarea class="decision-decision" rows="2">' + esc(d.decision) + '</textarea></div>' +
                    '<div class="form-group"><label>Consequences</label><textarea class="decision-consequences" rows="2">' + esc(d.consequences) + '</textarea></div></div>'
                ).join('') + '</div><div class="add-section" onclick="addDecision()">+ Add Decision</div>';
        }
        
        function renderGlossaryEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Terms</h3>' +
                '<table><thead><tr><th>Term</th><th>Definition</th><th class="actions">Actions</th></tr></thead><tbody id="terms-list">' +
                (data.terms || []).map((t, i) => 
                    '<tr data-index="' + i + '"><td><input type="text" class="term-term" value="' + esc(t.term) + '" style="width: 100%;"></td>' +
                    '<td><input type="text" class="term-definition" value="' + esc(t.definition) + '" style="width: 100%;"></td>' +
                    '<td class="actions"><button class="small danger remove-item" data-list="terms" data-index="' + i + '">✕</button></td></tr>'
                ).join('') + '</tbody></table><div class="add-section" onclick="addTerm()">+ Add Term</div>';
        }
        
        function renderConstraintsEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Constraints</h3><div id="constraints-list">' +
                (data.constraints || []).map((c, i) => 
                    '<div class="card" data-index="' + i + '"><div class="form-row">' +
                    '<div class="form-group"><label>Type</label><select class="constraint-type">' +
                    ['Technical','Regulatory','Organizational','Budget'].map(o => '<option value="' + o + '"' + (c.type === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
                    '<div class="form-group"><label>Name</label><input type="text" class="constraint-name" value="' + esc(c.name) + '"></div>' +
                    '<button class="small danger remove-item" data-list="constraints" data-index="' + i + '">✕</button></div>' +
                    '<div class="form-group"><label>Description</label><textarea class="constraint-description" rows="2">' + esc(c.description) + '</textarea></div></div>'
                ).join('') + '</div><div class="add-section" onclick="addConstraint()">+ Add Constraint</div>';
        }
        
        function renderCapabilitiesEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Capabilities</h3><div id="capabilities-list">' +
                (data.capabilities || []).map((cap, i) => 
                    '<div class="card" data-index="' + i + '"><div class="card-header">' +
                    '<input type="text" class="capability-name" value="' + esc(cap.name) + '" style="font-weight: bold;">' +
                    '<button class="small danger remove-item" data-list="capabilities" data-index="' + i + '">✕</button></div>' +
                    '<div class="form-group"><label>Description</label><textarea class="capability-description" rows="2">' + esc(cap.description) + '</textarea></div>' +
                    '<div class="form-group"><label>Systems (one per line)</label><textarea class="capability-systems" rows="3">' + (cap.systems || []).join('\\n') + '</textarea></div></div>'
                ).join('') + '</div><div class="add-section" onclick="addCapability()">+ Add Capability</div>';
        }
        
        function renderRoadmapEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Milestones</h3><div id="milestones-list">' +
                (data.milestones || []).map((m, i) => 
                    '<div class="card" data-index="' + i + '"><div class="card-header">' +
                    '<input type="text" class="milestone-title" value="' + esc(m.title) + '" style="font-weight: bold;">' +
                    '<button class="small danger remove-item" data-list="milestones" data-index="' + i + '">✕</button></div>' +
                    '<div class="form-row"><div class="form-group"><label>Timeframe</label><input type="text" class="milestone-timeframe" value="' + esc(m.timeframe) + '" placeholder="e.g., Q2 2024"></div>' +
                    '<div class="form-group"><label>Status</label><select class="milestone-status">' +
                    ['Planned','In Progress','Completed','Delayed'].map(o => '<option value="' + o + '"' + (m.status === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div></div>' +
                    '<div class="form-group"><label>Goals (one per line)</label><textarea class="milestone-goals" rows="3">' + (m.goals || []).join('\\n') + '</textarea></div></div>'
                ).join('') + '</div><div class="add-section" onclick="addMilestone()">+ Add Milestone</div>';
        }
        
        function renderPoliticsEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div>' +
                '<p style="opacity: 0.7; margin-bottom: 15px;">⚠️ This information is confidential</p><h3>Stakeholders</h3><div id="stakeholders-list">' +
                (data.stakeholders || []).map((s, i) => 
                    '<div class="card" data-index="' + i + '"><div class="card-header">' +
                    '<input type="text" class="pol-name" value="' + esc(s.name) + '" style="font-weight: bold;">' +
                    '<button class="small danger remove-item" data-list="stakeholders" data-index="' + i + '">✕</button></div>' +
                    '<div class="form-row"><div class="form-group"><label>Role</label><input type="text" class="pol-role" value="' + esc(s.role) + '"></div>' +
                    '<div class="form-group"><label>Influence</label><select class="pol-influence">' +
                    ['Low','Medium','High'].map(o => '<option value="' + o + '"' + (s.influence === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
                    '<div class="form-group"><label>Stance</label><select class="pol-stance">' +
                    ['Champion','Supporter','Neutral','Skeptic','Blocker'].map(o => '<option value="' + o + '"' + (s.stance === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div></div>' +
                    '<div class="form-group"><label>Interests</label><textarea class="pol-interests" rows="2">' + esc(s.interests) + '</textarea></div>' +
                    '<div class="form-group"><label>Concerns</label><textarea class="pol-concerns" rows="2">' + esc(s.concerns) + '</textarea></div>' +
                    '<div class="form-group"><label>Strategy</label><textarea class="pol-strategy" rows="2">' + esc(s.strategy) + '</textarea></div></div>'
                ).join('') + '</div><div class="add-section" onclick="addPoliticalStakeholder()">+ Add Stakeholder</div>';
        }
        
        function renderPrinciplesEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Principles</h3><div id="principles-list">' +
                (data.principles || []).map((p, i) => 
                    '<div class="card" data-index="' + i + '"><div class="card-header"><span class="card-title">' + esc(p.id) + ': ' + esc(p.name) + '</span>' +
                    '<button class="small danger remove-item" data-list="principles" data-index="' + i + '">✕</button></div>' +
                    '<div class="form-row"><div class="form-group"><label>ID</label><input type="text" class="principle-id" value="' + esc(p.id) + '"></div>' +
                    '<div class="form-group"><label>Name</label><input type="text" class="principle-name" value="' + esc(p.name) + '"></div></div>' +
                    '<div class="form-group"><label>Statement</label><textarea class="principle-statement" rows="2">' + esc(p.statement) + '</textarea></div>' +
                    '<div class="form-group"><label>Rationale</label><textarea class="principle-rationale" rows="2">' + esc(p.rationale) + '</textarea></div>' +
                    '<div class="form-group"><label>Implications</label><textarea class="principle-implications" rows="2">' + esc(p.implications) + '</textarea></div></div>'
                ).join('') + '</div><div class="add-section" onclick="addPrinciple()">+ Add Principle</div>';
        }
        
        function renderStandardsEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div><h3>Technology Categories</h3><div id="categories-list">' +
                (data.categories || []).map((cat, i) => 
                    '<div class="card" data-index="' + i + '"><div class="card-header">' +
                    '<input type="text" class="category-name" value="' + esc(cat.category) + '" style="font-weight: bold;">' +
                    '<button class="small danger remove-item" data-list="categories" data-index="' + i + '">✕</button></div>' +
                    '<table><thead><tr><th>Technology</th><th>Status</th><th>Notes</th></tr></thead><tbody class="tech-list" data-cat="' + i + '">' +
                    (cat.technologies || []).map((t, j) => 
                        '<tr><td><input type="text" class="tech-name" value="' + esc(t.Technology || t.technology || Object.values(t)[0]) + '"></td>' +
                        '<td><select class="tech-status">' + ['Adopt','Trial','Assess','Hold'].map(o => '<option value="' + o + '"' + ((t.Status || t.status) === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></td>' +
                        '<td><input type="text" class="tech-notes" value="' + esc(t.Notes || t.notes || Object.values(t)[2] || '') + '"></td></tr>'
                    ).join('') + '</tbody></table>' +
                    '<button class="small secondary" onclick="addTechnology(' + i + ')" style="margin-top: 8px;">+ Add Technology</button></div>'
                ).join('') + '</div><div class="add-section" onclick="addCategory()">+ Add Category</div>';
        }
        
        function renderGovernanceEditor(data) {
            return '<div class="form-group"><label>Title</label><input type="text" id="title" value="' + esc(data.title) + '" style="width: 100%;"></div>' +
                '<div class="form-group"><label>CAB Process</label><textarea id="cabProcess" rows="5">' + esc(data.cabProcess) + '</textarea></div>' +
                '<div class="form-group"><label>ARB Process</label><textarea id="arbProcess" rows="5">' + esc(data.arbProcess) + '</textarea></div>' +
                '<div class="form-group"><label>Exception Process</label><textarea id="exceptions" rows="4">' + esc(data.exceptions) + '</textarea></div>' +
                '<div class="form-group"><label>Escalation Path</label><textarea id="escalation" rows="4">' + esc(data.escalation) + '</textarea></div>';
        }
        
        // Add item functions
        window.addStakeholder = function() { if (!projectData[currentFile]) return; if (!projectData[currentFile].stakeholders) projectData[currentFile].stakeholders = []; projectData[currentFile].stakeholders.push({ stakeholder: '', role: '', interest: '' }); renderEditor(); };
        window.addRisk = function() { if (!projectData[currentFile]) return; if (!projectData[currentFile].risks) projectData[currentFile].risks = []; var n = projectData[currentFile].risks.length + 1; projectData[currentFile].risks.push({ id: 'RISK-' + n, title: 'New Risk', description: '', likelihood: 'Medium', impact: 'Medium', status: 'Open', owner: '', mitigation: '' }); renderEditor(); };
        window.addTechDebtItem = function() { if (!projectData[currentFile]) return; if (!projectData[currentFile].items) projectData[currentFile].items = []; var n = projectData[currentFile].items.length + 1; projectData[currentFile].items.push({ id: 'TD-' + n, title: 'New Item', description: '', type: 'Code', severity: 'Medium', effort: 'Medium', impact: '', recommendation: '' }); renderEditor(); };
        window.addDecision = function() { if (!projectData[currentFile]) return; if (!projectData[currentFile].decisions) projectData[currentFile].decisions = []; var n = projectData[currentFile].decisions.length + 1; projectData[currentFile].decisions.push({ id: 'DEC-' + n, title: 'New Decision', status: 'Pending', context: '', options: '', decision: '', consequences: '', date: '' }); renderEditor(); };
        window.addTerm = function() { var data = document.querySelector('.tab.active').dataset.tab === 'projects' ? projectData[currentFile] : orgData[currentOrgFile]; if (!data) return; if (!data.terms) data.terms = []; data.terms.push({ term: '', definition: '' }); document.querySelector('.tab.active').dataset.tab === 'projects' ? renderEditor() : renderOrgEditor(); };
        window.addConstraint = function() { if (!projectData[currentFile]) return; if (!projectData[currentFile].constraints) projectData[currentFile].constraints = []; projectData[currentFile].constraints.push({ type: 'Technical', name: '', description: '' }); renderEditor(); };
        window.addCapability = function() { if (!projectData[currentFile]) return; if (!projectData[currentFile].capabilities) projectData[currentFile].capabilities = []; projectData[currentFile].capabilities.push({ name: 'New Capability', description: '', systems: [] }); renderEditor(); };
        window.addMilestone = function() { if (!projectData[currentFile]) return; if (!projectData[currentFile].milestones) projectData[currentFile].milestones = []; projectData[currentFile].milestones.push({ title: 'New Milestone', timeframe: '', status: 'Planned', goals: [] }); renderEditor(); };
        window.addPoliticalStakeholder = function() { if (!projectData[currentFile]) return; if (!projectData[currentFile].stakeholders) projectData[currentFile].stakeholders = []; projectData[currentFile].stakeholders.push({ name: 'Name', role: '', influence: 'Medium', stance: 'Neutral', interests: '', concerns: '', strategy: '' }); renderEditor(); };
        window.addPrinciple = function() { if (!orgData[currentOrgFile]) return; if (!orgData[currentOrgFile].principles) orgData[currentOrgFile].principles = []; var n = orgData[currentOrgFile].principles.length + 1; orgData[currentOrgFile].principles.push({ id: 'AP-' + n, name: 'New Principle', statement: '', rationale: '', implications: '' }); renderOrgEditor(); };
        window.addCategory = function() { if (!orgData[currentOrgFile]) return; if (!orgData[currentOrgFile].categories) orgData[currentOrgFile].categories = []; orgData[currentOrgFile].categories.push({ category: 'New Category', technologies: [] }); renderOrgEditor(); };
        window.addTechnology = function(catIndex) { if (!orgData[currentOrgFile] || !orgData[currentOrgFile].categories[catIndex]) return; orgData[currentOrgFile].categories[catIndex].technologies.push({ Technology: '', Status: 'Assess', Notes: '' }); renderOrgEditor(); };
        
        function attachEditorEvents() {
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    var list = btn.dataset.list, index = parseInt(btn.dataset.index);
                    var activeTab = document.querySelector('.tab.active').dataset.tab;
                    if (activeTab === 'projects' && projectData[currentFile] && projectData[currentFile][list]) { projectData[currentFile][list].splice(index, 1); renderEditor(); }
                    else if (activeTab === 'organization' && orgData[currentOrgFile] && orgData[currentOrgFile][list]) { orgData[currentOrgFile][list].splice(index, 1); renderOrgEditor(); }
                });
            });
        }
        
        function collectFormData() {
            var data = projectData[currentFile]; if (!data) return;
            data.title = document.getElementById('title')?.value || data.title;
            
            if (currentFile === 'context') {
                data.overview = document.getElementById('overview')?.value || '';
                data.techStack = document.getElementById('techStack')?.value || '';
                data.sites = document.getElementById('sites')?.value || '';
                data.stakeholders = [];
                document.querySelectorAll('#stakeholders-list .card').forEach(card => {
                    data.stakeholders.push({ stakeholder: card.querySelector('.stakeholder-name')?.value || '', role: card.querySelector('.stakeholder-role')?.value || '', interest: card.querySelector('.stakeholder-interest')?.value || '' });
                });
            } else if (currentFile === 'risks') {
                data.risks = [];
                document.querySelectorAll('#risks-list .card').forEach(card => {
                    data.risks.push({ id: card.querySelector('.risk-id')?.value || '', title: card.querySelector('.risk-title')?.value || '', description: card.querySelector('.risk-description')?.value || '', likelihood: card.querySelector('.risk-likelihood')?.value || 'Medium', impact: card.querySelector('.risk-impact')?.value || 'Medium', status: card.querySelector('.risk-status')?.value || 'Open', owner: card.querySelector('.risk-owner')?.value || '', mitigation: card.querySelector('.risk-mitigation')?.value || '' });
                });
            } else if (currentFile === 'tech_debt') {
                data.items = [];
                document.querySelectorAll('#items-list .card').forEach(card => {
                    data.items.push({ id: card.querySelector('.item-id')?.value || '', title: card.querySelector('.item-title')?.value || '', description: card.querySelector('.item-description')?.value || '', type: card.querySelector('.item-type')?.value || 'Code', severity: card.querySelector('.item-severity')?.value || 'Medium', effort: card.querySelector('.item-effort')?.value || 'Medium', impact: card.querySelector('.item-impact')?.value || '', recommendation: card.querySelector('.item-recommendation')?.value || '' });
                });
            } else if (currentFile === 'decisions') {
                data.decisions = [];
                document.querySelectorAll('#decisions-list .card').forEach(card => {
                    data.decisions.push({ id: card.querySelector('.decision-id')?.value || '', title: card.querySelector('.decision-title')?.value || '', status: card.querySelector('.decision-status')?.value || 'Pending', date: card.querySelector('.decision-date')?.value || '', context: card.querySelector('.decision-context')?.value || '', options: card.querySelector('.decision-options')?.value || '', decision: card.querySelector('.decision-decision')?.value || '', consequences: card.querySelector('.decision-consequences')?.value || '' });
                });
            } else if (currentFile === 'glossary') {
                data.terms = [];
                document.querySelectorAll('#terms-list tr').forEach(row => {
                    data.terms.push({ term: row.querySelector('.term-term')?.value || '', definition: row.querySelector('.term-definition')?.value || '' });
                });
            } else if (currentFile === 'constraints') {
                data.constraints = [];
                document.querySelectorAll('#constraints-list .card').forEach(card => {
                    data.constraints.push({ type: card.querySelector('.constraint-type')?.value || 'Technical', name: card.querySelector('.constraint-name')?.value || '', description: card.querySelector('.constraint-description')?.value || '' });
                });
            } else if (currentFile === 'capabilities') {
                data.capabilities = [];
                document.querySelectorAll('#capabilities-list .card').forEach(card => {
                    data.capabilities.push({ name: card.querySelector('.capability-name')?.value || '', description: card.querySelector('.capability-description')?.value || '', systems: (card.querySelector('.capability-systems')?.value || '').split('\\n').filter(s => s.trim()) });
                });
            } else if (currentFile === 'roadmap') {
                data.milestones = [];
                document.querySelectorAll('#milestones-list .card').forEach(card => {
                    data.milestones.push({ title: card.querySelector('.milestone-title')?.value || '', timeframe: card.querySelector('.milestone-timeframe')?.value || '', status: card.querySelector('.milestone-status')?.value || 'Planned', goals: (card.querySelector('.milestone-goals')?.value || '').split('\\n').filter(g => g.trim()) });
                });
            } else if (currentFile === 'politics') {
                data.stakeholders = [];
                document.querySelectorAll('#stakeholders-list .card').forEach(card => {
                    data.stakeholders.push({ name: card.querySelector('.pol-name')?.value || '', role: card.querySelector('.pol-role')?.value || '', influence: card.querySelector('.pol-influence')?.value || 'Medium', stance: card.querySelector('.pol-stance')?.value || 'Neutral', interests: card.querySelector('.pol-interests')?.value || '', concerns: card.querySelector('.pol-concerns')?.value || '', strategy: card.querySelector('.pol-strategy')?.value || '' });
                });
            }
        }
        
        function collectOrgFormData() {
            var data = orgData[currentOrgFile]; if (!data) return;
            data.title = document.getElementById('title')?.value || data.title;
            
            if (currentOrgFile === 'principles') {
                data.principles = [];
                document.querySelectorAll('#principles-list .card').forEach(card => {
                    data.principles.push({ id: card.querySelector('.principle-id')?.value || '', name: card.querySelector('.principle-name')?.value || '', statement: card.querySelector('.principle-statement')?.value || '', rationale: card.querySelector('.principle-rationale')?.value || '', implications: card.querySelector('.principle-implications')?.value || '' });
                });
            } else if (currentOrgFile === 'standards') {
                data.categories = [];
                document.querySelectorAll('#categories-list .card').forEach((card, i) => {
                    var techs = [];
                    card.querySelectorAll('.tech-list tr').forEach(row => {
                        techs.push({ Technology: row.querySelector('.tech-name')?.value || '', Status: row.querySelector('.tech-status')?.value || 'Assess', Notes: row.querySelector('.tech-notes')?.value || '' });
                    });
                    data.categories.push({ category: card.querySelector('.category-name')?.value || '', technologies: techs });
                });
            } else if (currentOrgFile === 'glossary') {
                data.terms = [];
                document.querySelectorAll('#terms-list tr').forEach(row => {
                    data.terms.push({ term: row.querySelector('.term-term')?.value || '', definition: row.querySelector('.term-definition')?.value || '' });
                });
            } else if (currentOrgFile === 'governance') {
                data.cabProcess = document.getElementById('cabProcess')?.value || '';
                data.arbProcess = document.getElementById('arbProcess')?.value || '';
                data.exceptions = document.getElementById('exceptions')?.value || '';
                data.escalation = document.getElementById('escalation')?.value || '';
            }
        }
        
        function showToast(msg, type) { var toast = document.getElementById('toast'); toast.textContent = msg; toast.className = 'toast ' + (type || 'success') + ' show'; setTimeout(function() { toast.classList.remove('show'); }, 3000); }
        
        window.addEventListener('message', event => {
            var msg = event.data;
            if (msg.command === 'projects') {
                var select = document.getElementById('project-select');
                select.innerHTML = '<option value="">Select a project...</option>' + msg.projects.map(p => '<option value="' + p + '">' + p + '</option>').join('');
                if (currentProject && msg.projects.includes(currentProject)) select.value = currentProject;
            } else if (msg.command === 'projectData') {
                projectData = msg.data; currentFile = 'context';
                document.getElementById('project-content').style.display = 'block';
                renderFileNav(); renderEditor();
            } else if (msg.command === 'organizationData') {
                orgData = msg.data; currentOrgFile = 'principles';
                renderOrgFileNav(); renderOrgEditor();
            } else if (msg.command === 'saveResult') {
                showToast(msg.message, msg.success ? 'success' : 'error');
            } else if (msg.command === 'projectCreated') {
                if (msg.success) { showToast('Project "' + msg.projectName + '" created!'); currentProject = msg.projectName; vscode.postMessage({ command: 'getProjectData', project: msg.projectName }); }
                else showToast(msg.message, 'error');
            }
        });
        
        document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveCurrentFile(); } });
        
        vscode.postMessage({ command: 'getProjects' });
    </script>
</body>
</html>`;
    }

    public dispose() {
        AdminDashboard.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) { const x = this._disposables.pop(); if (x) x.dispose(); }
    }
}
