const googleTTS = require('google-tts-api');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SCRIPT_PATH = path.join(__dirname, 'script_the_farce_extended.json');
const AUDIO_DIR = path.join(__dirname, '..', 'clicks', 'audio', 'farce_extended_v2');

// Ensure output dir exists
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Load script
const script = JSON.parse(fs.readFileSync(SCRIPT_PATH, 'utf8'));

// Helper to download text to speech
async function generateAudio(text, filename) {
    console.log(`Generating: ${filename}...`);
    try {
        // split text if too long (google-tts-api limitation is 200 chars usually, but library handles splitting typically or we need to be careful)
        // actually google-tts-api returns a URL. We need to download it.
        // It also has a 'getAllAudioBase64' for long text.

        const results = await googleTTS.getAllAudioBase64(text, {
            lang: 'es',
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        // results is array of { base64, shortText }. Concatenate them.
        let combinedBuffer = Buffer.concat(results.map(r => Buffer.from(r.base64, 'base64')));

        fs.writeFileSync(path.join(AUDIO_DIR, filename), combinedBuffer);
        console.log(`✅ Saved ${filename}`);
    } catch (err) {
        console.error(`❌ Error generating ${filename}:`, err.message);
    }
}

async function processScenes() {
    console.log(`Processing ${script.scenes.length} scenes...`);

    for (const scene of script.scenes) {
        const filename = `scene_${scene.id}.mp3`;
        // Delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
        await generateAudio(scene.text, filename);
    }
    console.log('🎉 Done!');
}

processScenes();
