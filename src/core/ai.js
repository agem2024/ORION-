require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const settings = require('../config/settings');
const logger = require('../utils/logger');

// API KEY ROTATION SYSTEM - GEMINI
const GEMINI_KEYS = [
    process.env.GEMINI_KEY,
    process.env.GEMINI_KEY_BACKUP
].filter(Boolean);

// OPENAI FALLBACK
const OPENAI_KEY = process.env.OPENAI_API_KEY;

logger.info(`🔑 Loaded ${GEMINI_KEYS.length} Gemini Keys + ${OPENAI_KEY ? '1 OpenAI Key' : 'No OpenAI'}`);

let currentKeyIndex = 0;

function getAI() {
    const key = GEMINI_KEYS[currentKeyIndex];
    logger.info(`Using Gemini key index ${currentKeyIndex}: ${key ? key.substring(0, 10) + '...' : 'MISSING'}`);
    return new GoogleGenerativeAI(key);
}

function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
    logger.warn(`🔄 Rotating Gemini Key to index ${currentKeyIndex}`);
}

// OpenAI Fallback Function
async function callOpenAI(userMessage, systemPrompt) {
    if (!OPENAI_KEY) {
        logger.error('❌ OpenAI key not available');
        return null;
    }

    logger.info('🔄 Switching to OpenAI GPT-4o-mini as fallback...');

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            logger.info('✅ OpenAI response received');
            return data.choices[0].message.content;
        } else {
            logger.error(`❌ OpenAI Error: ${JSON.stringify(data)}`);
            return null;
        }
    } catch (error) {
        logger.error(`❌ OpenAI Exception: ${error.message}`);
        return null;
    }
}

async function generateResponse(userMessage, history = [], systemPrompt, imageBuffer = null) {
    let attempts = 0;
    const maxAttempts = GEMINI_KEYS.length;

    // TRY GEMINI FIRST
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
            logger.error(`❌ Gemini Error (Key ${currentKeyIndex}): ${error.message}`);

            // Rotate on any error to try the next key
            rotateKey();
            attempts++;
        }
    }

    // FALLBACK TO OPENAI
    logger.warn('⚠️ All Gemini keys exhausted, trying OpenAI...');
    const openaiResponse = await callOpenAI(userMessage, systemPrompt);

    if (openaiResponse) {
        return openaiResponse;
    }

    return "⚠️ All AI services unavailable. Please try again later or contact via WhatsApp.";
}

// 🎨 IMAGE GENERATION (DALL-E 3)
async function generateImage(prompt, size = '1024x1024') {
    if (!OPENAI_KEY) {
        logger.error('❌ OpenAI Key missing for Image Generation');
        return null;
    }
    logger.info(`🎨 Generating DALL-E 3 Image: "${prompt}"`);

    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: size,
                quality: "standard"
            })
        });

        const data = await response.json();

        if (data.data && data.data[0]) {
            logger.info('✅ Image generated successfully');
            return data.data[0].url;
        } else {
            logger.error(`❌ DALL-E Error: ${JSON.stringify(data)}`);
            return null;
        }
    } catch (error) {
        logger.error(`❌ DALL-E Exception: ${error.message}`);
        return null;
    }
}

module.exports = { generateResponse, generateImage };
