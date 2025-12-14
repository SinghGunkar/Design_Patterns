import fs from 'fs';
import tree from 'tree-node-cli';

async function generateTrees() {
    const LEVEL = 10;
    const README_FILE_NAME = 'readme.md';

    if (fs.existsSync(README_FILE_NAME)) {
        fs.unlinkSync(README_FILE_NAME);
    }

    const sections = [
        {
            base: 'src/factory_method_1',
            title: 'Factory Method 1: Simple Notification System',
            description: 'Demonstrates the Factory Method pattern with different notification types (Email, SMS, Push, Slack, Delayed Email).',
            runCommand: 'npx tsx src/factory_method_1/index.ts'
        },
        {
            base: 'src/factory_method_2',
            title: 'Factory Method 2: Event Storage with Multiple Databases',
            description: 'Shows the pattern for creating database connections and storing events in SQLite, JSON, PostgreSQL, and MongoDB.',
            runCommand: 'npx tsx src/factory_method_2/index.ts'
        }
    ];

    function buildGenerationSection(): string {
        return '## Generating the README\n\nTo regenerate this README with updated directory structures:\n\n```bash\nnpx tsx generate-readme.ts\n```\n\nThis script uses `tree-node-cli` to generate clean directory trees.\n';
    }

    let readmeContent = '# Factory Method Pattern Examples\n\n' + buildGenerationSection() + '\n';


    function buildSectionContent(section: typeof sections[0], cleanedTree: string): string {
        const title = `## ${section.title}`;
        const desc = section.description;
        const runCmd = `\`\`\`bash\n${section.runCommand}\n\`\`\``;
        const dirStruct = `\`\`\`\n${cleanedTree}\n\`\`\``;
        return `${title}\n\n${desc}\n\n### How to Run\n\n${runCmd}\n\n### Directory Structure\n\n${dirStruct}\n\n`;
    }

    for (const section of sections) {
        console.log(`Processing ${section.base}...`);
        const treeString = tree(section.base, { maxDepth: LEVEL });
        console.log(treeString)
        const sectionContent = buildSectionContent(section, treeString);
        readmeContent += sectionContent;
        console.log(`Section added for ${section.base}`);
    }

    fs.writeFileSync(README_FILE_NAME, readmeContent);
    console.log('README generated.');
    process.exit(0);
}

generateTrees().catch(console.error);

