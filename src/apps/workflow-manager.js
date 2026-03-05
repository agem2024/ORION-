/**
 * 🛠️ Workflow Manager Module - JHON Central Brain
 * Handles listing and triggering of .agent/workflows.
 */

const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIR = 'c:\\Users\\alexp\\OneDrive\\Documentos\\.agent\\workflows';

/**
 * List all available workflows in the .agent directory.
 */
function listWorkflows() {
    try {
        if (!fs.existsSync(WORKFLOWS_DIR)) return [];

        const items = fs.readdirSync(WORKFLOWS_DIR);
        const workflows = items.filter(file => file.endsWith('.md')).map(file => {
            const fullPath = path.join(WORKFLOWS_DIR, file);
            const content = fs.readFileSync(fullPath, 'utf8');

            // Basic metadata extraction from YAML frontmatter
            const descriptionMatch = content.match(/description:\s*(.*)/);

            return {
                id: file.replace('.md', ''),
                name: file,
                description: descriptionMatch ? descriptionMatch[1] : 'No description',
                path: fullPath
            };
        });

        return workflows;
    } catch (e) {
        console.error('Workflow Manager Error:', e.message);
        return [];
    }
}

module.exports = {
    listWorkflows
};
