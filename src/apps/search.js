const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Load legacy config.json
const configPath = path.join(__dirname, '../config/config.json');
let config = {};
try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
    logger.error('Failed to load config.json for Search: ' + e.message);
}

async function buscarWeb(query) {
    if (!config.googleSearchKey || !config.googleSearchId) {
        throw new Error('Missing Google Search credentials in config.json');
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${config.googleSearchKey}&cx=${config.googleSearchId}&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        if (!data.items || data.items.length === 0) {
            return [];
        }

        return data.items.slice(0, 3).map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
        }));

    } catch (error) {
        logger.error('Web Search Error:', error);
        throw error;
    }
}

module.exports = { buscarWeb };
