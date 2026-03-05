/**
 * 🎬 OVI VIDEO GENERATOR - ORION Integration
 * Generador de video + voz sincronizada usando Ovi (Character.AI)
 * 
 * Backend: Replicate.com
 * Modelo: character-ai/ovi-i2v
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const REPLICATE_API = process.env.REPLICATE_API_TOKEN;
const OUTPUT_DIR = path.join(__dirname, '../../downloads/videos');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 🎬 Genera video con Ovi via Replicate
 * @param {string} prompt - Descripción del video
 * @param {string} imagePath - (Opcional) Ruta de imagen para I2V
 */
async function generateOviVideo(prompt, imagePath = null, options = {}) {
    if (!REPLICATE_API) {
        throw new Error('❌ REPLICATE_API_TOKEN no configurado en .env');
    }

    console.log('🎬 Generando video con Ovi (Character.AI)...');
    console.log(`📝 Prompt: ${prompt}`);

    const input = {
        prompt: prompt,
        aspect_ratio: options.aspect || "1:1",
        num_frames: options.frames || 121,
        fps: options.fps || 24
    };

    if (imagePath) {
        const imageBuffer = fs.readFileSync(imagePath);
        input.image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    }

    try {
        const response = await axios.post('https://api.replicate.com/v1/predictions', {
            version: "character-ai/ovi-i2v",
            input: input
        }, {
            headers: {
                'Authorization': `Bearer ${REPLICATE_API}`,
                'Content-Type': 'application/json'
            }
        });

        const predictionId = response.data.id;
        console.log(`⏳ Predicción Ovi creada: ${predictionId}`);

        let result = await pollForResult(predictionId);

        if (result.output) {
            const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            const localPath = await downloadVideo(videoUrl, `ovi_${Date.now()}.mp4`);
            return {
                success: true,
                url: videoUrl,
                localPath: localPath,
                prompt: prompt
            };
        }

        throw new Error('No se recibió output del modelo Ovi');

    } catch (error) {
        console.error('❌ Error Ovi:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * ⏳ Poll para esperar resultado
 */
async function pollForResult(predictionId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const response = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Bearer ${REPLICATE_API}` }
        });

        const status = response.data.status;
        console.log(`⏳ Status Ovi: ${status} (${i + 1}/${maxAttempts})`);

        if (status === 'succeeded') return response.data;
        if (status === 'failed' || status === 'canceled') {
            throw new Error(`Predicción Ovi ${status}: ${response.data.error || 'Error desconocido'}`);
        }
    }
    throw new Error('Timeout esperando video Ovi');
}

/**
 * 📥 Descargar video
 */
async function downloadVideo(url, filename) {
    const localPath = path.join(OUTPUT_DIR, filename);
    const response = await axios({ method: 'get', url: url, responseType: 'stream' });
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(localPath));
        writer.on('error', reject);
    });
}

/**
 * 📋 Formatea respuesta para WhatsApp
 */
function formatOviResponse(result) {
    return `🎬 *Video Generado con Ovi (Character.AI)*
    
📝 *Prompt:* ${result.prompt}
✅ *Status:* Completado con Audio Sincronizado
📍 *Archivo:* ${result.localPath}

_Powered by Character.AI Ovi_`;
}

module.exports = {
    generateOviVideo,
    formatOviResponse
};
