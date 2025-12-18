/**
 * OpenAI Text-to-Speech Module - ORION CLEAN
 * Modelo: gpt-4o-mini-tts (2025)
 * Voces: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Voces recomendadas por idioma
const VOICES = {
    es: 'nova',      // Femenina, cálida - ideal español
    en: 'alloy',     // Neutral, clara - ideal inglés
    formal: 'onyx',  // Masculina, profunda - presentaciones
    friendly: 'shimmer', // Femenina, suave
    narrator: 'echo'     // Masculina - narraciones
};

/**
 * Genera audio speech desde texto usando OpenAI TTS
 * @param {string} text - Texto a convertir (máx 4096 caracteres)
 * @param {string} voice - Voz a usar (nova, alloy, shimmer, echo, onyx, etc)
 * @param {string} instructions - Instrucciones de tono (opcional, ej: "habla alegre")
 * @returns {Promise<string>} - Ruta al archivo MP3 generado
 */
async function generateSpeech(text, voice = 'nova', instructions = null) {
    if (!OPENAI_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    // Truncar si excede límite
    const maxLength = 4096;
    if (text.length > maxLength) {
        text = text.substring(0, maxLength - 3) + '...';
        logger.warn(`⚠️ TTS text truncated to ${maxLength} chars`);
    }

    try {
        const requestBody = {
            model: 'gpt-4o-mini-tts',
            input: text,
            voice: voice,
            response_format: 'mp3'
        };

        // Agregar instrucciones si se proporcionan
        if (instructions) {
            requestBody.instructions = instructions;
        }

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenAI TTS Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        // Guardar audio en archivo temporal
        const buffer = Buffer.from(await response.arrayBuffer());
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const filename = `tts_${Date.now()}.mp3`;
        const filepath = path.join(tempDir, filename);
        fs.writeFileSync(filepath, buffer);

        logger.info(`🔊 TTS Generated: ${filepath} (${(buffer.length / 1024).toFixed(1)} KB)`);
        return filepath;

    } catch (error) {
        logger.error(`❌ TTS Error: ${error.message}`);
        throw error;
    }
}

/**
 * Genera speech con voz automática según idioma detectado
 * @param {string} text - Texto a convertir
 * @param {string} lang - Idioma ('es' o 'en')
 * @returns {Promise<string>} - Ruta al archivo MP3
 */
async function generateSpeechAuto(text, lang = 'es') {
    const voice = VOICES[lang] || VOICES.es;
    const instructions = lang === 'es'
        ? 'Habla con acento latinoamericano natural y amigable'
        : 'Speak with a friendly, natural American accent';

    return generateSpeech(text, voice, instructions);
}

/**
 * Limpia archivos TTS antiguos (más de 1 hora)
 */
function cleanupOldFiles() {
    try {
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) return;

        const files = fs.readdirSync(tempDir);
        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        files.forEach(file => {
            if (file.startsWith('tts_')) {
                const filepath = path.join(tempDir, file);
                const stats = fs.statSync(filepath);
                if (stats.mtimeMs < oneHourAgo) {
                    fs.unlinkSync(filepath);
                    logger.info(`🗑️ Cleaned up old TTS file: ${file}`);
                }
            }
        });
    } catch (e) {
        // Ignore cleanup errors
    }
}

// Limpiar archivos antiguos cada hora
setInterval(cleanupOldFiles, 60 * 60 * 1000);

module.exports = {
    generateSpeech,
    generateSpeechAuto,
    VOICES,
    cleanupOldFiles
};
