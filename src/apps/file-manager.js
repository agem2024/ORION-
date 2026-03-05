/**
 * 📂 File Manager Module - JHON Central Brain
 * Responsible for scanning and managing projects and documents.
 */

const fs = require('fs');
const path = require('path');

const PROJECTS_ROOT = 'c:\\Users\\alexp\\OneDrive\\Documentos\\_Proyectos';

/**
 * List all project directories in the root folder.
 */
function listProjects() {
    try {
        if (!fs.existsSync(PROJECTS_ROOT)) return [];

        const items = fs.readdirSync(PROJECTS_ROOT);
        const projects = items.map(item => {
            const fullPath = path.join(PROJECTS_ROOT, item);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory() && !item.startsWith('.')) {
                return {
                    name: item,
                    path: fullPath,
                    modified: stats.mtime,
                    type: 'directory'
                };
            }
            return null;
        }).filter(Boolean);

        return projects;
    } catch (e) {
        console.error('File Manager Error (listProjects):', e.message);
        return [];
    }
}

/**
 * Get details of a specific project (files and subfolders).
 */
function getProjectDetails(projectName) {
    try {
        const projectPath = path.join(PROJECTS_ROOT, projectName);
        if (!fs.existsSync(projectPath)) return null;

        const items = fs.readdirSync(projectPath);
        const files = items.map(item => {
            const fullPath = path.join(projectPath, item);
            const stats = fs.statSync(fullPath);

            return {
                name: item,
                size: stats.size,
                modified: stats.mtime,
                isDir: stats.isDirectory(),
                ext: path.extname(item).toLowerCase()
            };
        });

        return {
            name: projectName,
            path: projectPath,
            files: files
        };
    } catch (e) {
        console.error('File Manager Error (getProjectDetails):', e.message);
        return null;
    }
}

module.exports = {
    listProjects,
    getProjectDetails,
    PROJECTS_ROOT
};
