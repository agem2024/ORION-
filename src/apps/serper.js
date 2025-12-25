/**
 * 🔍 SERPER - Google Search API for AI Agents
 * Free tier: 2,500 queries
 * Sign up: https://serper.dev
 */

const axios = require('axios');

const SERPER_API_KEY = process.env.SERPER_API_KEY || '';

async function searchGoogle(query, numResults = 5) {
    if (!SERPER_API_KEY) {
        throw new Error('SERPER_API_KEY not configured. Get free key at https://serper.dev');
    }

    try {
        const response = await axios.post('https://google.serper.dev/search', {
            q: query,
            num: numResults
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const results = response.data.organic || [];
        return results.map(r => ({
            title: r.title,
            link: r.link,
            snippet: r.snippet
        }));
    } catch (e) {
        console.error('Serper Search Error:', e.message);
        throw e;
    }
}

async function searchNews(query, numResults = 5) {
    if (!SERPER_API_KEY) {
        throw new Error('SERPER_API_KEY not configured');
    }

    try {
        const response = await axios.post('https://google.serper.dev/news', {
            q: query,
            num: numResults
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        return response.data.news || [];
    } catch (e) {
        console.error('Serper News Error:', e.message);
        throw e;
    }
}

async function searchImages(query, numResults = 5) {
    if (!SERPER_API_KEY) {
        throw new Error('SERPER_API_KEY not configured');
    }

    try {
        const response = await axios.post('https://google.serper.dev/images', {
            q: query,
            num: numResults
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        return response.data.images || [];
    } catch (e) {
        console.error('Serper Images Error:', e.message);
        throw e;
    }
}

module.exports = {
    searchGoogle,
    searchNews,
    searchImages
};
