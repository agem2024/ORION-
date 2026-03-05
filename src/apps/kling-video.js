/**
 * 🎬 KLING 2.6 VIDEO GENERATOR - ORION Integration
 * Generador de video de alta calidad con audio nativo usando Kling 2.6
 * 
 * Backend: Fal.ai
 * Modelo: fal-ai/kling-video/v2.6/pro/image-to-video
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const FAL_API = process.env.FAL_KEY;
const OUTPUT_DIR = path.join(__dirname, '../../downloads/videos');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 🎬 Genera video con Kling 2.6 via Fal.ai
 */
async function generateKlingVideo(prompt, imagePath = null, options = {}) {
    if (!FAL_API) {
        throw new Error('❌ FAL_KEY no configurado en .env');
    }

    const mode = imagePath ? 'image-to-video' : 'text-to-video';
    const endpoint = `https://fal.run/fal-ai/kling-video/v2.6/pro/${mode}`;

    console.log(`🎬 Generando video con Kling 2.6 (${mode})...`);
    console.log(`📝 Prompt: ${prompt}`);

    const payload = {
        prompt: prompt,
        duration: options.duration || "5",
        aspect_ratio: options.aspect || "16:9",
        audio_enabled: options.audio !== false
    };

    if (imagePath) {
        const imageBuffer = fs.readFileSync(imagePath);
        payload.image_url = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    }

    try {
        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Key ${FAL_API}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.video?.url) {
            const videoUrl = response.data.video.url;
            const localPath = await downloadVideo(videoUrl, `kling_${Date.now()}.mp4`);
            return {
                success: true,
                url: videoUrl,
                localPath: localPath,
                prompt: prompt
            };
        }

        throw new Error('No se recibió video de Kling 2.6');

    } catch (error) {
        console.error('❌ Error Kling:', error.response?.data || error.message);
        throw error;
    }
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
function formatKlingResponse(result) {
    return `🎬 *Video Generado con Kling 2.6 Pro*
    
📝 *Prompt:* ${result.prompt}
✅ *Status:* Máxima Calidad + Audio Nativo
📍 *Archivo:* ${result.localPath}

_Powered by Kuaishou Kling AI_`;
}

module.exports = {
    generateKlingVideo,
    formatKlingResponse
};
