/**
 * 🎬 WAN 2.1 VIDEO GENERATOR - ORION Integration
 * Generador de videos IA usando Wan 2.1 (Alibaba)
 * 
 * Opciones de backend:
 * 1. Replicate.com (gratuito limitado)
 * 2. Fal.ai (económico ~$0.03/video)
 * 3. Local (requiere GPU NVIDIA 24GB+)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const REPLICATE_API = process.env.REPLICATE_API_TOKEN;
const FAL_API = process.env.FAL_KEY;

// Directorio de salida
const OUTPUT_DIR = path.join(__dirname, '../../downloads/videos');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 🎬 Genera video con Wan 2.1 via Replicate (GRATUITO con límites)
 */
async function generateVideoReplicate(prompt, options = {}) {
    if (!REPLICATE_API) {
        throw new Error('❌ REPLICATE_API_TOKEN no configurado en .env');
    }

    console.log('🎬 Generando video con Wan 2.1 (Replicate)...');
    console.log(`📝 Prompt: ${prompt}`);

    try {
        // Crear predicción
        const response = await axios.post('https://api.replicate.com/v1/predictions', {
            // Wan 2.1 model on Replicate
            version: "wan-ai/wan2.1:latest",
            input: {
                prompt: prompt,
                num_frames: options.frames || 16,
                fps: options.fps || 8,
                guidance_scale: options.guidance || 6.0,
                num_inference_steps: options.steps || 30
            }
        }, {
            headers: {
                'Authorization': `Bearer ${REPLICATE_API}`,
                'Content-Type': 'application/json'
            }
        });

        const predictionId = response.data.id;
        console.log(`⏳ Predicción creada: ${predictionId}`);

        // Esperar resultado (polling)
        let result = await pollForResult(predictionId);

        if (result.output) {
            const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            const localPath = await downloadVideo(videoUrl, `wan_${Date.now()}.mp4`);
            return {
                success: true,
                url: videoUrl,
                localPath: localPath,
                prompt: prompt
            };
        }

        throw new Error('No se recibió output del modelo');

    } catch (error) {
        console.error('❌ Error Replicate:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 🎬 Genera video con Wan 2.1 via Fal.ai (MUY ECONÓMICO)
 */
async function generateVideoFal(prompt, options = {}) {
    if (!FAL_API) {
        throw new Error('❌ FAL_KEY no configurado en .env');
    }

    console.log('🎬 Generando video con Wan 2.1 (Fal.ai)...');
    console.log(`📝 Prompt: ${prompt}`);

    try {
        const response = await axios.post('https://fal.run/fal-ai/wan', {
            prompt: prompt,
            num_frames: options.frames || 16,
            fps: options.fps || 8,
            aspect_ratio: options.aspect || "16:9",
            resolution: options.resolution || "480p"
        }, {
            headers: {
                'Authorization': `Key ${FAL_API}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.video?.url) {
            const localPath = await downloadVideo(response.data.video.url, `wan_fal_${Date.now()}.mp4`);
            return {
                success: true,
                url: response.data.video.url,
                localPath: localPath,
                prompt: prompt
            };
        }

        throw new Error('No se recibió video del modelo');

    } catch (error) {
        console.error('❌ Error Fal.ai:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * 🎥 Genera video de Imagen a Video (I2V)
 */
async function imageToVideo(imagePath, prompt, options = {}) {
    if (!REPLICATE_API) {
        throw new Error('❌ REPLICATE_API_TOKEN no configurado en .env');
    }

    console.log('🎬 Generando video desde imagen con Wan 2.1...');

    // Leer imagen como base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    try {
        const response = await axios.post('https://api.replicate.com/v1/predictions', {
            version: "wan-ai/wan2.1-i2v:latest",
            input: {
                image: imageBase64,
                prompt: prompt || "Animate this image with subtle motion",
                num_frames: options.frames || 16,
                fps: options.fps || 8
            }
        }, {
            headers: {
                'Authorization': `Bearer ${REPLICATE_API}`,
                'Content-Type': 'application/json'
            }
        });

        const predictionId = response.data.id;
        let result = await pollForResult(predictionId);

        if (result.output) {
            const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            const localPath = await downloadVideo(videoUrl, `wan_i2v_${Date.now()}.mp4`);
            return {
                success: true,
                url: videoUrl,
                localPath: localPath,
                prompt: prompt
            };
        }

        throw new Error('No se recibió output del modelo');

    } catch (error) {
        console.error('❌ Error I2V:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * ⏳ Poll para esperar resultado de Replicate
 */
async function pollForResult(predictionId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
        await sleep(5000); // Esperar 5 segundos entre checks

        const response = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Bearer ${REPLICATE_API}` }
        });

        const status = response.data.status;
        console.log(`⏳ Status: ${status} (intento ${i + 1}/${maxAttempts})`);

        if (status === 'succeeded') {
            return response.data;
        } else if (status === 'failed' || status === 'canceled') {
            throw new Error(`Predicción ${status}: ${response.data.error || 'Error desconocido'}`);
        }
    }

    throw new Error('Timeout esperando video');
}

/**
 * 📥 Descargar video a disco local
 */
async function downloadVideo(url, filename) {
    const localPath = path.join(OUTPUT_DIR, filename);

    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            console.log(`✅ Video guardado: ${localPath}`);
            resolve(localPath);
        });
        writer.on('error', reject);
    });
}

/**
 * 💤 Sleep helper
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🎬 Función principal - Auto-selecciona el mejor backend disponible
 */
async function generateVideo(prompt, options = {}) {
    // Intentar con Replicate primero (gratis)
    if (REPLICATE_API) {
        try {
            return await generateVideoReplicate(prompt, options);
        } catch (e) {
            console.log('⚠️ Replicate falló, intentando Fal.ai...');
        }
    }

    // Fallback a Fal.ai
    if (FAL_API) {
        return await generateVideoFal(prompt, options);
    }

    throw new Error('❌ No hay API configurada. Añade REPLICATE_API_TOKEN o FAL_KEY a .env');
}

/**
 * 📋 Formatea respuesta para WhatsApp
 */
function formatResponse(result) {
    return `🎬 *Video Generado con Wan 2.1*

📝 *Prompt:* ${result.prompt}

✅ *Status:* Completado
📍 *Archivo:* ${result.localPath}
🔗 *URL:* ${result.url}

_Powered by Alibaba Wan 2.1 AI_`;
}

module.exports = {
    generateVideo,
    generateVideoReplicate,
    generateVideoFal,
    imageToVideo,
    formatResponse,
    OUTPUT_DIR
};
