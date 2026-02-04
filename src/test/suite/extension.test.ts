import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

suite('Archi Copilot Extension Tests', () => {
    
    suite('Architecture Memory Structure', () => {
        const memoryPath = path.join(__dirname, '../../architecture_memory');
        
        test('architecture_memory folder exists', () => {
            assert.ok(fs.existsSync(memoryPath), 'architecture_memory folder should exist');
        });

        test('organization folder exists', () => {
            const orgPath = path.join(memoryPath, 'organization');
            assert.ok(fs.existsSync(orgPath), 'organization folder should exist');
        });

        test('projects folder exists', () => {
            const projectsPath = path.join(memoryPath, 'projects');
            assert.ok(fs.existsSync(projectsPath), 'projects folder should exist');
        });

        test('at least one project exists', () => {
            const projectsPath = path.join(memoryPath, 'projects');
            if (fs.existsSync(projectsPath)) {
                const projects = fs.readdirSync(projectsPath).filter(f => 
                    fs.statSync(path.join(projectsPath, f)).isDirectory()
                );
                assert.ok(projects.length > 0, 'Should have at least one project');
            }
        });

        test('sample-ecommerce project has required files', () => {
            const sampleProject = path.join(memoryPath, 'projects', 'sample-ecommerce');
            if (fs.existsSync(sampleProject)) {
                const requiredFiles = ['context.md', 'risks.md', 'decisions.md'];
                requiredFiles.forEach(file => {
                    assert.ok(
                        fs.existsSync(path.join(sampleProject, file)),
                        `sample-ecommerce should have ${file}`
                    );
                });
            }
        });
    });

    suite('Source Files', () => {
        const srcPath = path.join(__dirname, '../../src');

        test('extension.ts exists', () => {
            assert.ok(fs.existsSync(path.join(srcPath, 'extension.ts')), 'extension.ts should exist');
        });

        test('prompts.ts exists', () => {
            assert.ok(fs.existsSync(path.join(srcPath, 'prompts.ts')), 'prompts.ts should exist');
        });

        test('contextLoader.ts exists', () => {
            assert.ok(fs.existsSync(path.join(srcPath, 'contextLoader.ts')), 'contextLoader.ts should exist');
        });

        test('adminDashboard.ts exists', () => {
            assert.ok(fs.existsSync(path.join(srcPath, 'adminDashboard.ts')), 'adminDashboard.ts should exist');
        });
    });

    suite('Package Configuration', () => {
        const packageJson = require('../../package.json');

        test('package.json has correct name', () => {
            assert.strictEqual(packageJson.name, 'archi-copilot');
        });

        test('package.json has chat participant', () => {
            assert.ok(packageJson.contributes.chatParticipants, 'Should have chatParticipants');
            const participant = packageJson.contributes.chatParticipants[0];
            assert.strictEqual(participant.id, 'archi-copilot.archi');
            assert.strictEqual(participant.name, 'archi');
        });

        test('package.json has required commands', () => {
            const commands = packageJson.contributes.commands;
            const commandIds = commands.map((c: any) => c.command);
            assert.ok(commandIds.includes('archi-copilot.openAdmin'), 'Should have openAdmin command');
        });

        test('package.json has slash commands', () => {
            const participant = packageJson.contributes.chatParticipants[0];
            assert.ok(participant.commands, 'Should have commands');
            const slashCommands = participant.commands.map((c: any) => c.name);
            assert.ok(slashCommands.includes('decision'), 'Should have /decision command');
            assert.ok(slashCommands.includes('adr'), 'Should have /adr command');
            assert.ok(slashCommands.includes('risks'), 'Should have /risks command');
        });
    });

    suite('Compiled Output', () => {
        const outPath = path.join(__dirname, '..');

        test('compiled extension.js exists', () => {
            assert.ok(fs.existsSync(path.join(outPath, 'extension.js')), 'extension.js should exist after compilation');
        });
    });
});
