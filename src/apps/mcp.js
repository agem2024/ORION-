/**
 * 🔌 MCP Client - Connect to ORION MCP Server
 * Provides search and fetch capabilities via MCP protocol
 */

const axios = require('axios');

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8000';

/**
 * Search ORION knowledge base via MCP
 */
async function search(query) {
    try {
        const response = await axios.post(`${MCP_SERVER_URL}/tools/search`, {
            query: query
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        // Parse MCP response format
        const content = response.data.content?.[0]?.text;
        if (content) {
            return JSON.parse(content);
        }
        return { results: [] };
    } catch (e) {
        console.error('MCP Search Error:', e.message);

        // Fallback to static data
        return {
            results: [
                { id: 'price-book', title: 'ORION Price Book', url: 'https://agem2024.github.io/SEGURITI-USC/pricebook-index.html' },
                { id: 'orion-bots', title: 'ORION Bots Platform', url: 'https://agem2024.github.io/SEGURITI-USC/orion-bots.html' }
            ]
        };
    }
}

/**
 * Fetch document content via MCP
 */
async function fetch(id) {
    try {
        const response = await axios.post(`${MCP_SERVER_URL}/tools/fetch`, {
            id: id
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        const content = response.data.content?.[0]?.text;
        if (content) {
            return JSON.parse(content);
        }
        return null;
    } catch (e) {
        console.error('MCP Fetch Error:', e.message);
        return null;
    }
}

/**
 * Local fallback data when MCP server is unavailable
 */
const ORION_KNOWLEDGE = {
    'price-book': {
        title: 'ORION Price Book',
        text: `ORION Tech Pricing:
        
LABOR: $185/hr standard, $285/hr emergency
        
AI PACKAGES (monthly):
- Individual: $89
- Salons: $299
- Retail: $299
- Liquor Stores: $389
- Restaurants: $449
- Contractors: $449
- Enterprise: $1,499+

Contact: (669) 234-2444`,
        url: 'https://agem2024.github.io/SEGURITI-USC/pricebook-index.html'
    },
    'orion-bots': {
        title: 'ORION Bots',
        text: `XONA AI - Voice & Chat Assistant
CRONOS - Operations (Colombia)
ORION WhatsApp - AI Bot

Features: Multilingual, Voice TTS, Lead capture, Scheduling`,
        url: 'https://agem2024.github.io/SEGURITI-USC/orion-bots.html'
    }
};

/**
 * Search with fallback
 */
async function searchWithFallback(query) {
    try {
        return await search(query);
    } catch (e) {
        // Return static results matching query
        const results = Object.entries(ORION_KNOWLEDGE)
            .filter(([id, doc]) =>
                doc.title.toLowerCase().includes(query.toLowerCase()) ||
                doc.text.toLowerCase().includes(query.toLowerCase())
            )
            .map(([id, doc]) => ({
                id,
                title: doc.title,
                url: doc.url
            }));
        return { results };
    }
}

/**
 * Fetch with fallback  
 */
async function fetchWithFallback(id) {
    try {
        const result = await fetch(id);
        if (result) return result;
    } catch (e) { }

    // Fallback to local knowledge
    if (ORION_KNOWLEDGE[id]) {
        return {
            id,
            ...ORION_KNOWLEDGE[id],
            metadata: { source: 'local' }
        };
    }
    return null;
}

module.exports = {
    search,
    fetch,
    searchWithFallback,
    fetchWithFallback,
    ORION_KNOWLEDGE
};
