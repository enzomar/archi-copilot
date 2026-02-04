/**
 * Confluence Loader - Fetches architecture context from Confluence spaces
 */
import * as vscode from 'vscode';

export interface ConfluenceConfig {
    baseUrl: string;
    spaceKey: string;
    username?: string;
    apiToken?: string;
    parentPageId?: string;  // Optional: only fetch pages under this parent
    labels?: string[];      // Optional: only fetch pages with these labels
}

interface ConfluencePage {
    id: string;
    title: string;
    body: {
        storage: {
            value: string;
        };
    };
}

interface ConfluenceSearchResult {
    results: Array<{
        content: {
            id: string;
            title: string;
        };
    }>;
}

export class ConfluenceLoader {
    private config: ConfluenceConfig | undefined;

    constructor() {
        this.loadConfig();
    }

    private loadConfig(): void {
        const config = vscode.workspace.getConfiguration('archi-copilot.confluence');
        
        const baseUrl = config.get<string>('baseUrl');
        const spaceKey = config.get<string>('spaceKey');
        
        if (baseUrl && spaceKey) {
            this.config = {
                baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
                spaceKey,
                username: config.get<string>('username'),
                apiToken: config.get<string>('apiToken'),
                parentPageId: config.get<string>('parentPageId'),
                labels: config.get<string[]>('labels')
            };
        }
    }

    isConfigured(): boolean {
        return this.config !== undefined && 
               this.config.baseUrl !== '' && 
               this.config.spaceKey !== '';
    }

    private getAuthHeader(): string | undefined {
        if (!this.config?.username || !this.config?.apiToken) {
            return undefined;
        }
        const credentials = Buffer.from(`${this.config.username}:${this.config.apiToken}`).toString('base64');
        return `Basic ${credentials}`;
    }

    private async fetchFromConfluence(endpoint: string): Promise<any> {
        if (!this.config) {
            throw new Error('Confluence not configured');
        }

        const url = `${this.config.baseUrl}/wiki/rest/api${endpoint}`;
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const authHeader = this.getAuthHeader();
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        try {
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                throw new Error(`Confluence API error: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Confluence fetch error:', error);
            throw error;
        }
    }

    /**
     * Convert Confluence storage format (HTML-like) to plain text
     */
    private convertToPlainText(html: string): string {
        return html
            // Remove CDATA sections
            .replace(/<!\[CDATA\[|\]\]>/g, '')
            // Convert headers
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
            .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n')
            // Convert lists
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
            .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
            // Convert paragraphs and line breaks
            .replace(/<p[^>]*>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            // Convert bold and italic
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
            // Convert code blocks
            .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
            .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '\n```\n$1\n```\n')
            // Convert tables (simplified)
            .replace(/<tr[^>]*>/gi, '\n')
            .replace(/<td[^>]*>(.*?)<\/td>/gi, '| $1 ')
            .replace(/<th[^>]*>(.*?)<\/th>/gi, '| **$1** ')
            // Convert links
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            // Remove remaining tags
            .replace(/<[^>]+>/g, '')
            // Decode HTML entities
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            // Clean up whitespace
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    /**
     * Fetch all pages from the configured space
     */
    async fetchSpacePages(): Promise<string> {
        if (!this.isConfigured()) {
            return '';
        }

        try {
            let cql = `space = "${this.config!.spaceKey}" AND type = page`;
            
            // Add parent page filter if configured
            if (this.config!.parentPageId) {
                cql += ` AND ancestor = ${this.config!.parentPageId}`;
            }
            
            // Add label filter if configured
            if (this.config!.labels && this.config!.labels.length > 0) {
                const labelQuery = this.config!.labels.map(l => `label = "${l}"`).join(' OR ');
                cql += ` AND (${labelQuery})`;
            }

            const searchResult = await this.fetchFromConfluence(
                `/content/search?cql=${encodeURIComponent(cql)}&limit=20&expand=body.storage`
            ) as { results: ConfluencePage[] };

            const pages: string[] = [];

            for (const page of searchResult.results || []) {
                const title = page.title;
                const content = this.convertToPlainText(page.body?.storage?.value || '');
                
                // Truncate large pages
                const truncated = content.length > 6000
                    ? content.substring(0, 6000) + '\n\n[... truncated ...]'
                    : content;

                pages.push(`## ${title}\n\n${truncated}`);
            }

            if (pages.length > 0) {
                return `# Confluence Context (Space: ${this.config!.spaceKey})\n\n` + 
                       pages.join('\n\n---\n\n');
            }

            return '';

        } catch (error) {
            console.error('Error fetching Confluence pages:', error);
            vscode.window.showWarningMessage(
                `Could not fetch Confluence content: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            return '';
        }
    }

    /**
     * Search Confluence for pages related to a query
     */
    async searchRelevantPages(query: string): Promise<string[]> {
        if (!this.isConfigured()) {
            return [];
        }

        try {
            const cql = `space = "${this.config!.spaceKey}" AND type = page AND text ~ "${query.replace(/"/g, '\\"')}"`;
            
            const searchResult = await this.fetchFromConfluence(
                `/content/search?cql=${encodeURIComponent(cql)}&limit=5&expand=body.storage`
            ) as { results: ConfluencePage[] };

            const results: string[] = [];

            for (const page of searchResult.results || []) {
                const title = page.title;
                const content = this.convertToPlainText(page.body?.storage?.value || '');
                
                // Take first 2000 chars of relevant content
                const excerpt = content.substring(0, 2000);
                results.push(`[Confluence: ${title}]\n${excerpt}`);
            }

            return results;

        } catch (error) {
            console.error('Error searching Confluence:', error);
            return [];
        }
    }

    /**
     * Fetch a specific page by ID
     */
    async fetchPage(pageId: string): Promise<string> {
        if (!this.isConfigured()) {
            return '';
        }

        try {
            const page = await this.fetchFromConfluence(
                `/content/${pageId}?expand=body.storage`
            ) as ConfluencePage;

            const content = this.convertToPlainText(page.body?.storage?.value || '');
            return `## ${page.title}\n\n${content}`;

        } catch (error) {
            console.error(`Error fetching Confluence page ${pageId}:`, error);
            return '';
        }
    }
}
