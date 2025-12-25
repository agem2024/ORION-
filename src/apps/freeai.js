/**
 * 🆓 FREE AI APIS - Collection of free LLM endpoints
 * Backup models when OpenAI quota is exhausted
 */

const axios = require('axios');

// Groq API (Free, very fast)
async function queryGroq(prompt, model = 'llama-3.3-70b-versatile') {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not configured. Get free key at https://console.groq.com');
    }

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (e) {
        console.error('Groq API Error:', e.message);
        throw e;
    }
}

// Cloudflare Workers AI (10,000 free requests/day)
async function queryCloudflare(prompt, model = '@cf/meta/llama-3.1-8b-instruct') {
    const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
        throw new Error('Cloudflare credentials not configured');
    }

    try {
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`,
            { prompt },
            {
                headers: {
                    'Authorization': `Bearer ${CF_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.result.response;
    } catch (e) {
        console.error('Cloudflare AI Error:', e.message);
        throw e;
    }
}

// OpenRouter (Multiple free models)
async function queryOpenRouter(prompt, model = 'mistralai/mistral-7b-instruct:free') {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not configured. Get free key at https://openrouter.ai');
    }

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model,
            messages: [{ role: 'user', content: prompt }]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://orion-tech.com',
                'X-Title': 'ORION AI'
            }
        });

        return response.data.choices[0].message.content;
    } catch (e) {
        console.error('OpenRouter Error:', e.message);
        throw e;
    }
}

// Try multiple free APIs as fallbacks
async function queryFreeAI(prompt) {
    const apis = [
        { name: 'Groq', fn: () => queryGroq(prompt) },
        { name: 'OpenRouter', fn: () => queryOpenRouter(prompt) }
    ];

    for (const api of apis) {
        try {
            console.log(`Trying ${api.name}...`);
            const result = await api.fn();
            console.log(`${api.name} succeeded`);
            return { provider: api.name, response: result };
        } catch (e) {
            console.warn(`${api.name} failed: ${e.message}`);
        }
    }

    throw new Error('All free AI APIs failed');
}

module.exports = {
    queryGroq,
    queryCloudflare,
    queryOpenRouter,
    queryFreeAI
};
