require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const settings = require('../config/settings');
const logger = require('../utils/logger');

// API KEY ROTATION SYSTEM
const API_KEYS = [
    process.env.GEMINI_KEY,
    process.env.GEMINI_KEY_BACKUP
].filter(Boolean);

logger.info(`🔑 Loaded ${API_KEYS.length} API Keys`);

let currentKeyIndex = 0;

function getAI() {
    const key = API_KEYS[currentKeyIndex];
    logger.info(`Using key index ${currentKeyIndex}: ${key ? key.substring(0, 10) + '...' : 'MISSING'}`);
    return new GoogleGenerativeAI(key);
}

function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    logger.warn(`🔄 Rotating API Key to index ${currentKeyIndex}`);
}

async function generateResponse(userMessage, history = [], systemPrompt, imageBuffer = null) {
    let attempts = 0;
    const maxAttempts = API_KEYS.length;

    while (attempts < maxAttempts) {
        try {
            const genAI = getAI();
            const model = genAI.getGenerativeModel({ model: settings.GEMINI.MODEL });

            let parts = [{ text: userMessage }];

            // VISION SUPPORT
            if (imageBuffer) {
                parts.push({
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: 'image/jpeg'
                    }
                });
                logger.info('👁️ Added image to AI request');
            }

            const chat = model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Understood. I am ready.' }]
                    },
                    ...history
                ]
            });

            const result = await chat.sendMessage(parts);
            const response = result.response;
            return response.text();

        } catch (error) {
            logger.error(`❌ AI Error (Key ${currentKeyIndex}): ${error.message}`);
            logger.error(`Full error: ${JSON.stringify(error)}`);

            // Rotate on any error to try the next key
            rotateKey();
            attempts++;
        }
    }

    return "⚠️ All API keys exhausted. Please try again later.";
}

module.exports = { generateResponse };
