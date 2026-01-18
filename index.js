const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    downloadMediaMessage
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const settings = require('./src/config/settings');
const logger = require('./src/utils/logger');
let freeai;
try { freeai = require('./src/apps/freeai'); console.log('✅ FreeAI Loaded'); } catch (e) { console.log('⚠️ FreeAI Missing'); }

// 🔌 MCP CLIENT
let mcp;
try { mcp = require('./src/apps/mcp'); console.log('✅ MCP Client Loaded'); } catch (e) { console.log('⚠️ MCP Missing'); }
const ai = require('./src/core/ai');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const googleTTS = require('google-tts-api');
const tts = require('./src/core/tts');

// 🔌 APPS
const youtubeApp = require('./src/apps/youtube');
const searchApp = require('./src/apps/search');
const calendarApp = require('./src/apps/calendar');
const extras = require('./src/apps/extras');
const memoria = require('./src/apps/memoria');
// const i601a = require('./src/apps/i601a-commands'); // DISABLED
const professional = require('./src/apps/professional');

// 🆕 NEW AI TOOLS
const serper = require('./src/apps/serper');
const scraper = require('./src/apps/scraper');

// 🎬 WAN 2.1 VIDEO AI (Alibaba)
let wanVideo;
try { wanVideo = require('./src/apps/wan-video'); console.log('✅ Wan 2.1 Video AI Loaded'); } catch (e) { console.log('⚠️ Wan Video Missing:', e.message); }

// 🔌 MCP CLIENT
let mcpClient;
try { mcpClient = require('./src/apps/mcp'); console.log('✅ MCP Client Loaded'); } catch (e) { console.log('⚠️ MCP Missing'); }

// ⚠️🔴 WARNING: ESTE ES ORION CLEAN - NO JARVIS 🔴⚠️
// ⚠️🔴 El watcher, auto-encendido y control son para ORION CLEAN 🔴⚠️
// ⚠️🔴 JARVIS está ligado pero el bot activo es ORION CLEAN 🔴⚠️

// 📞 URLS FIREBASE (ACUTOR)
const MANUAL_URL = 'https://neon-agent-hub.web.app/jarvis_manual.html';
const NEKON_URL = 'https://neon-agent-hub.web.app/nekon_ai.html';

// 💰 PRICE BOOK URL
const PRICEBOOK_URL = 'https://agem2024.github.io/SEGURITI-USC/docs/pricebook-index.html';

// 🤖 ORION BOTS URL
const ORIONBOTS_URL = 'https://agem2024.github.io/SEGURITI-USC/docs/orion-bots.html';

// 🎄 CHRISTMAS CARDS URL
const CHRISTMAS_URL = 'https://agem2024.github.io/tarjetas-y-mesj/';

// 🔗 ORION APPS (App Mode Links) - Con nombres descriptivos
const ORION_APPS = [
    { name: 'AdVortex Pro', desc: 'Generador de Videos Ads', url: 'https://ai.studio/apps/drive/1vikKncwaJRxWOANGeEcnchTAM96CqmnZ?fullscreenApplet=true' },
    { name: 'EP Estimator', desc: 'Cotizador de Plomería', url: 'https://ai.studio/apps/drive/1bMGhzGDqLL_aDfnSC78Ie_HnsF7b691I?fullscreenApplet=true' },
    { name: 'MP PRO', desc: 'Estimados Profesionales', url: 'https://ai.studio/apps/drive/1BKOJ2-29twcjdG1BooF6-Nh82VpXm6Hi?fullscreenApplet=true' },
    { name: 'Business Suite', desc: 'Suite Empresarial', url: 'https://ai.studio/apps/drive/1x_ibj0UepSYSNZyv6w83UQCk2GFTjJvG?fullscreenApplet=true' },
    { name: 'Neon Hub', desc: 'Hub de Agentes IA', url: 'https://ai.studio/apps/drive/1BF2Sl5I48Zh843mnJQAo_mrQLLDUd48J?fullscreenApplet=true' },
    { name: 'neKon AI', desc: 'Asistente Avanzado', url: 'https://ai.studio/apps/drive/1u71t_S_8Cp27aEuUcT0Sffws8tEVQ2pw?fullscreenApplet=true' },
    { name: 'Code Assistant', desc: 'Ayudante de Código', url: 'https://ai.studio/apps/drive/1k_9YBvyIRIWIrSEZuIzoHRSH5Qauhpd_?fullscreenApplet=true' },
    { name: 'Content Creator', desc: 'Creador de Contenido', url: 'https://ai.studio/apps/drive/1NNlIz45X8Pr8waX5P5p90CHzJ5uJv2WN?fullscreenApplet=true' }
];

// 🔗 LINKS ESENCIALES (Para comando 'links')
const ESSENTIAL_LINKS = [
    { name: 'ORION Bots', desc: 'Página principal de venta', url: 'https://agem2024.github.io/SEGURITI-USC/docs/orion-bots.html' },
    { name: 'Price Book PRO', desc: 'Catálogo de precios plomería', url: 'https://agem2024.github.io/SEGURITI-USC/docs/pricebook-index.html' },
    { name: 'Manual ORION', desc: 'Manual de comandos', url: 'https://neon-agent-hub.web.app/jarvis_manual.html' },
    { name: 'neKon Landing', desc: 'Landing page IA', url: 'https://neon-agent-hub.web.app/nekon_ai.html' },
    { name: 'JHON Command Center', desc: 'Centro de control', url: 'file:///c:/Users/alexp/OneDrive/Documentos/_Proyectos/acwater/02_Projects/AI_Development/AI_Media/PROYECTOS/AI_Impact_Bay_Area/orion-clean/public/jhon-command-center.html' },
    { name: 'Tarjetas Navidad', desc: 'Cards de navidad', url: 'https://agem2024.github.io/tarjetas-y-mesj/' },
    { name: 'CV Alex', desc: 'CV profesional', url: 'https://agem2024.github.io/SEGURITI-USC/docs/cv_pro.html' },
    { name: 'Tarjeta Alex', desc: 'Digital card CEO', url: 'https://agem2024.github.io/SEGURITI-USC/docs/card.html' }
];

// 💾 PERSISTENT STATE
const STATE_FILE = path.join(__dirname, 'user_state.json');
const TAREAS_FILE = path.join(__dirname, 'tareas_antigravity.json');
const CONTACTOS_FILE = path.join(__dirname, 'contactos.json');

let userState = new Map();

// Init files
if (!fs.existsSync(TAREAS_FILE)) fs.writeFileSync(TAREAS_FILE, '[]');
if (!fs.existsSync(CONTACTOS_FILE)) fs.writeFileSync(CONTACTOS_FILE, '{"clientes":{}}');

// Load State
if (fs.existsSync(STATE_FILE)) {
    try {
        const raw = fs.readFileSync(STATE_FILE, 'utf8');
        userState = new Map(JSON.parse(raw));
        logger.info('💾 Loaded Persistent State');
    } catch (e) {
        logger.error('Failed to load state: ' + e.message);
    }
}

function saveState() {
    try { fs.writeFileSync(STATE_FILE, JSON.stringify([...userState])); } catch (e) { }
}

function cargarTareas() {
    try { return JSON.parse(fs.readFileSync(TAREAS_FILE, 'utf8')); } catch (e) { return []; }
}

function guardarTareas(t) {
    fs.writeFileSync(TAREAS_FILE, JSON.stringify(t, null, 2));
}

function cargarContactos() {
    try { return JSON.parse(fs.readFileSync(CONTACTOS_FILE, 'utf8')); } catch (e) { return {}; }
}

// 📅 ENVIAR REPORTE MATUTINO DE CITAS
async function enviarReporteManana(sock) {
    try {
        const reporte = await calendarApp.generarReporteManana();
        const ALEX_PHONE = settings.owner + '@s.whatsapp.net';
        await sock.sendMessage(ALEX_PHONE, { text: `🌅 *BUENOS DÍAS ALEX*\n\n${reporte}\n\n_ORION CLEAN v2.0_` });
        logger.info('📅 Reporte matutino enviado');
    } catch (e) {
        logger.error('Error reporte matutino: ' + e.message);
    }
}

// 📤 ANTIGRAVITY INBOX (The User's Requested Feature)
const ANTIGRAVITY_INBOX = path.join(__dirname, 'antigravity_inbox.json');
const FIRMA = "\n\n— Orion System";

async function enviarMensajeAntigravity(sock) {
    try {
        if (!fs.existsSync(ANTIGRAVITY_INBOX)) return;
        const mensajes = JSON.parse(fs.readFileSync(ANTIGRAVITY_INBOX, 'utf8'));
        if (!mensajes.length) return;

        let huboCambios = false;

        for (const msg of mensajes) {
            if (!msg.enviado) {
                let destino = msg.to;
                // Add suffix if missing
                if (!destino.includes('@s.whatsapp.net')) destino = `${destino}@s.whatsapp.net`;

                // Logic to send file or text
                if (msg.file && fs.existsSync(msg.file)) {
                    const ext = path.extname(msg.file).toLowerCase();
                    const buffer = fs.readFileSync(msg.file);
                    const filename = path.basename(msg.file);

                    if (['.mp4', '.mov', '.avi'].includes(ext)) {
                        await sock.sendMessage(destino, { video: buffer, caption: (msg.mensaje || filename) + FIRMA, mimetype: 'video/mp4' });
                    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                        await sock.sendMessage(destino, { image: buffer, caption: (msg.mensaje || filename) + FIRMA });
                    } else if (['.mp3', '.ogg', '.m4a'].includes(ext)) {
                        await sock.sendMessage(destino, { audio: buffer, mimetype: 'audio/mp4' });
                    } else {
                        await sock.sendMessage(destino, { document: buffer, fileName: filename, caption: (msg.mensaje || '') + FIRMA });
                    }
                    logger.info(`📤 [AG] File sent: ${filename}`);
                } else if (msg.mensaje) {
                    await sock.sendMessage(destino, { text: msg.mensaje + FIRMA });
                    logger.info(`📤 [AG] Message sent to ${msg.to}`);
                }

                msg.enviado = true;
                msg.fecha_envio = new Date().toISOString();
                huboCambios = true;
            }
        }

        if (huboCambios) {
            fs.writeFileSync(ANTIGRAVITY_INBOX, JSON.stringify(mensajes, null, 2));
        }
    } catch (e) { logger.error('Error sending AG message: ' + e.message); }
}

async function startOrion() {
    const { state, saveCreds } = await useMultiFileAuthState(settings.WHATSAPP.AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    logger.info(`🚀 Starting ORION CORE (vClean) on Baileys v${version.join('.')}`);

    // 🌐 LOCAL SERVER (Port 3030)
    try {
        const express = require('express');
        const app = express();

        // Explicit routes
        app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/landing.html')));
        app.get('/manual', (req, res) => res.sendFile(path.join(__dirname, 'public/manual.html')));
        app.get('/manual.html', (req, res) => res.sendFile(path.join(__dirname, 'public/manual.html')));
        app.get('/landing', (req, res) => res.sendFile(path.join(__dirname, 'public/landing.html')));

        // Static files (images, etc)
        app.use(express.static(path.join(__dirname, 'public')));

        // 🤖 API CHAT ENDPOINT (For web chatbot - uses Gemini)
        app.use(express.json());
        app.post('/api/chat', async (req, res) => {
            // CORS for external requests
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');

            try {
                const { message, lang } = req.body;
                if (!message) {
                    return res.status(400).json({ error: 'Message required' });
                }

                const systemPrompt = lang === 'es'
                    ? `Eres XONA (pronunciado "CHO-na"), asistente de ventas AI de ORION Tech.

🏢 ORION TECH - Automatización con IA para PYMEs
Sede: San José, California | También en Colombia: +57 324 514 3926

💰 PRECIOS USA (USD/mes):
- INDIVIDUAL: $297-$497 (freelancers, coaches, influencers)
- SALONES DE BELLEZA: $997 (citas, recordatorios, catálogo)
- RETAIL/TIENDAS: $1,197 (catálogo, inventario, ofertas)
- TIENDAS DE LICORES: $1,297 (inventario, pedidos, horarios)
- RESTAURANTES: $1,497 (menú, pedidos, reservas, delivery)
- CONTRATISTAS: $1,497 (cotizaciones, citas, seguimiento)
- ENTERPRISE: $4,997+ (multi-ubicación, CRM, API custom)

💰 PRECIOS COLOMBIA (COP/mes):
- Individual: $890,000 | Salones: $2,990,000 | Restaurantes: $4,490,000 | Enterprise: $14,990,000+

📦 TODOS LOS PAQUETES INCLUYEN:
✅ Bot WhatsApp personalizado 24/7
✅ Respuestas automáticas a FAQs
✅ Menú de productos/servicios
✅ Setup en 3-10 días
✅ Soporte técnico continuo

🎯 PROTOCOLO DE VENTAS:
1. Pregunta: "¿Qué tipo de negocio tienes?"
2. Da precio RANGO: "Para [industria], el precio es desde $X/mes"
3. Ofrece: "¿Te gustaría que un especialista te contacte para una demo personalizada?"
4. Si acepta, pide: nombre, teléfono, mejor horario

📞 Contacto: WhatsApp (669) 234-2444 | Colombia: +57 324 514 3926

⚠️ REGLAS:
- Máximo 3 oraciones por respuesta
- Siempre da RANGOS, no precios exactos
- Ofrece demo/llamada después de 2-3 mensajes
- NUNCA compartas datos de clientes

📅 AGENDADO: Cuando acepten demo, recoge: Nombre, Negocio, WhatsApp, Horario, Ciudad.
Confirma: "¡Listo [NOMBRE]! Te contactaremos para tu demo en 24 horas."

🎭 Personalidad: Futurista, profesional, amigable. Usa emojis moderadamente.`
                    : `You are XONA (pronounced "ZOH-nah"), AI sales assistant for ORION Tech.

🏢 ORION TECH - AI Automation for SMBs
HQ: San José, California | Also in Colombia: +57 324 514 3926

💰 USA PRICING (USD/month):
- INDIVIDUAL: $297-$497 (freelancers, coaches, influencers)
- BEAUTY SALONS: $997 (appointments, reminders, catalog)
- RETAIL STORES: $1,197 (catalog, inventory, offers)
- LIQUOR STORES: $1,297 (inventory, orders, hours)
- RESTAURANTS: $1,497 (menu, orders, reservations, delivery)
- CONTRACTORS: $1,497 (quotes, appointments, follow-up)
- ENTERPRISE: $4,997+ (multi-location, CRM, custom API)

💰 OTHER COUNTRIES:
- Colombia (COP): Individual $890K | Salons $2.99M | Restaurants $4.49M
- Mexico (MXN): Individual $5,297 | Salons $17,997 | Restaurants $26,997
- Peru, Ecuador, Canada: Ask for local pricing

📦 ALL PACKAGES INCLUDE:
✅ Custom WhatsApp bot 24/7
✅ Automatic FAQ responses
✅ Product/service menu
✅ Setup in 3-10 days
✅ Ongoing tech support

🎯 SALES PROTOCOL:
1. Ask: "What type of business do you have?"
2. Give price RANGE: "For [industry], pricing starts from $X/month"
3. Offer: "Would you like a specialist to contact you for a personalized demo?"
4. If yes, collect: name, phone, best time to call

📞 Contact: WhatsApp (669) 234-2444 | Colombia: +57 324 514 3926

⚠️ RULES:
- Maximum 3 sentences per response
- Always give RANGES, not exact prices
- Offer demo/call after 2-3 messages
- NEVER share customer data

📅 LEAD CAPTURE: When they accept demo, collect: Name, Business, WhatsApp, Time, City.
Confirm: "Great [NAME]! We'll contact you for your demo within 24 hours!"

🎭 Personality: Futuristic, professional, friendly. Use emojis moderately.`;

                const response = await ai.generateResponse(message, [], systemPrompt);
                res.json({ response, timestamp: new Date().toISOString() });
            } catch (e) {
                logger.error('Chat API error: ' + e.message);
                res.status(500).json({ error: 'AI temporarily unavailable' });
            }
        });

        // 🔊 TTS API ENDPOINT (OpenAI High Quality Voice)
        app.post('/api/tts', async (req, res) => {
            // CORS
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');

            try {
                const { text, lang } = req.body;
                if (!text) return res.status(400).json({ error: 'Text required' });

                // Generate Audio File
                const audioPath = await tts.generateSpeechAuto(text, lang || 'es');

                // Stream file to client
                if (fs.existsSync(audioPath)) {
                    res.setHeader('Content-Type', 'audio/mpeg');
                    const readStream = fs.createReadStream(audioPath);
                    readStream.pipe(res);

                    // Cleanup after sending (using 'finish' event implies successfully sent)
                    readStream.on('close', () => {
                        try { fs.unlinkSync(audioPath); } catch (e) { }
                    });
                } else {
                    res.status(500).json({ error: 'Failed to generate audio' });
                }
            } catch (e) {
                logger.error('TTS API Error: ' + e.message);
                res.status(500).json({ error: e.message });
            }
        });

        // CORS preflight for TTS
        app.options('/api/tts', (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.sendStatus(200);
        });

        // 🎨 IMAGE GENERATION API ENDPOINT (DALL-E 3)
        app.post('/api/image', async (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');

            try {
                const { prompt } = req.body;
                if (!prompt) return res.status(400).json({ error: 'Prompt required' });

                logger.info(`🎨 Image Request: ${prompt}`);
                const url = await ai.generateImage(prompt);

                if (url) {
                    res.json({ success: true, url });
                } else {
                    res.status(500).json({ error: 'Failed to generate image' });
                }
            } catch (e) {
                logger.error('Image API Error: ' + e.message);
                res.status(500).json({ error: e.message });
            }
        });

        // CORS preflight for Image
        app.options('/api/image', (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.sendStatus(200);
        });

        // 🎬 SORA VIDEO GENERATION API ENDPOINT
        app.post('/api/video', async (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');

            try {
                const { prompt, duration, aspectRatio } = req.body;
                if (!prompt) return res.status(400).json({ error: 'Prompt required' });

                logger.info(`🎬 Sora Video Request: ${prompt.substring(0, 50)}...`);

                // Dynamic import for OpenAI (ESM compatibility)
                const OpenAI = require('openai').default;
                const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                // Generate video with Sora
                const video = await client.videos.createAndPoll({
                    model: 'sora-2',
                    prompt: prompt,
                    duration: duration || 5,
                    aspect_ratio: aspectRatio || '16:9'
                });

                logger.info(`🎬 Sora Video Generated: ${video.id}`);

                res.json({
                    success: true,
                    videoId: video.id,
                    url: video.url || video.output_url,
                    status: video.status,
                    timestamp: new Date().toISOString()
                });

            } catch (e) {
                logger.error('Sora Video API Error: ' + e.message);
                res.status(500).json({
                    error: e.message,
                    hint: 'Sora API may require special access. Check your OpenAI account.'
                });
            }
        });

        // CORS preflight for Video
        app.options('/api/video', (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.sendStatus(200);
        });

        // CORS preflight
        app.options('/api/chat', (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.sendStatus(200);
        });

        // 🎤 REALTIME API TOKEN ENDPOINT (For WebRTC clients)
        app.post('/api/realtime-token', async (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');

            try {
                const fetch = (await import('node-fetch')).default;
                const config = req.body?.config || {};

                const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: config.model || 'gpt-4o-realtime-preview',
                        voice: config.voice || 'shimmer',
                        instructions: config.instructions || `Eres XONA (pronunciado "CHO-nah"), asistente de ventas AI de ORION Tech.
Hablas español paisa colombiano - cálido, amigable, profesional.
Respuestas CORTAS (máximo 2 oraciones).
Servicios: Bots WhatsApp con IA, automatización para negocios.
Precios: Individual $297-$497, Salones $997, Restaurantes $1,497, Enterprise $4,997+
Contacto: WhatsApp (669) 234-2444`
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    logger.error('Realtime token error: ' + errorText);
                    return res.status(500).json({ error: 'Failed to generate token' });
                }

                const tokenData = await response.json();
                res.json(tokenData);
                logger.info('🎤 Realtime token generated');
            } catch (e) {
                logger.error('Realtime token error: ' + e.message);
                res.status(500).json({ error: 'Failed to generate token' });
            }
        });

        // CORS preflight for realtime
        app.options('/api/realtime-token', (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.sendStatus(200);
        });

        app.listen(3030, () => logger.info('🌐 Web Server running at http://localhost:3030 (Realtime API enabled)'));
    } catch (e) { logger.error('Server error: ' + e.message); }

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: logger.child({ module: 'baileys', level: 'silent' }),
        browser: settings.WHATSAPP.BROWSER
    });

    sock.ev.on('creds.update', saveCreds);

    let isWaitingForQR = false;
    let qrTimeout = null;

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            // Solo mostrar QR si no estamos ya esperando uno
            if (!isWaitingForQR) {
                isWaitingForQR = true;
                logger.info('📱 ESCANEA EL QR - Tienes 60 segundos...');
                qrcode.generate(qr, { small: true });
                try {
                    const QRCodeFile = require('qrcode');
                    QRCodeFile.toFile('./qr.png', qr, { scale: 10 }, () => exec('start qr.png'));
                } catch (e) { }

                // Dar 60 segundos para escanear
                qrTimeout = setTimeout(() => {
                    isWaitingForQR = false;
                    logger.warn('⏰ QR expirado. Reiniciando...');
                }, 60000);
            }
        }
        if (connection === 'close') {
            // Limpiar timeout si existe
            if (qrTimeout) clearTimeout(qrTimeout);
            isWaitingForQR = false;

            const statusCode = (lastDisconnect?.error instanceof Boom) ?
                lastDisconnect.error.output?.statusCode : 0;
            const errorMessage = lastDisconnect?.error?.message || '';

            // Check for conflict error - another session took over
            if (errorMessage.includes('conflict') || statusCode === 440) {
                logger.warn('⚠️ Sesión en conflicto - otra instancia activa. Esperando 60s...');
                setTimeout(startOrion, 60000); // Wait 60 seconds before retry
            } else if (statusCode !== DisconnectReason.loggedOut) {
                logger.info('🔄 Reconectando en 10 segundos...');
                setTimeout(startOrion, 10000);
            } else {
                logger.error('⛔ Logged out. Delete auth_info to re-scan.');
            }
        } else if (connection === 'open') {
            if (qrTimeout) clearTimeout(qrTimeout);
            isWaitingForQR = false;
            logger.info('✅ ORION CONNECTED AND ONLINE');

            // Start Antigravity Inbox Watcher
            setInterval(() => enviarMensajeAntigravity(sock), 5000); // Check every 5s

            // 📅 SYNC APPOINTMENTS FROM PHONE BOT (Every 30 seconds)
            setInterval(async () => {
                try {
                    const fetch = (await import('node-fetch')).default;
                    const response = await fetch('https://orion-cloud.onrender.com/api/appointments');
                    const data = await response.json();

                    if (data.appointments && data.appointments.length > 0) {
                        for (const apt of data.appointments) {
                            if (!apt.confirmed && apt.phone) {
                                // Format phone number
                                let phone = apt.phone.replace(/\D/g, '');
                                if (phone.length === 10) phone = '1' + phone;
                                const whatsappId = phone + '@s.whatsapp.net';

                                // Send confirmation message
                                const msg = `📅 *Cita Agendada - ORION Tech*\n\n` +
                                    `👤 Nombre: ${apt.name}\n` +
                                    `📞 Teléfono: ${apt.phone}\n` +
                                    `🕐 Horario: ${apt.time_slot}\n` +
                                    `📱 Fuente: ${apt.source}\n\n` +
                                    `✅ Te contactaremos pronto para confirmar.\n\n` +
                                    `_ORION Tech - WhatsApp: (669) 234-2444_`;

                                await sock.sendMessage(whatsappId, { text: msg });
                                logger.info(`📅 Appointment confirmation sent to ${apt.phone}`);

                                // Mark as confirmed (by adding to local tracked list)
                                apt.confirmed = true;
                            }
                        }
                    }
                } catch (e) { /* Silent fail - phone bot may be sleeping */ }
            }, 30000); // Every 30 seconds
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        logger.info(`📨 RAW MESSAGE RECEIVED - Type: ${type}, Count: ${messages.length}`);
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message) continue;

            const from = msg.key.remoteJid;
            const isMe = msg.key.fromMe;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

            // 🎤 AUDIO MESSAGE TRANSCRIPTION (OpenAI Whisper)
            const isAudio = msg.message.audioMessage || msg.message.pttMessage;
            if (isAudio && isMe) {
                logger.info('🎤 Audio message detected, transcribing...');
                try {
                    // Download audio
                    const buffer = await downloadMediaMessage(msg, 'buffer', {});

                    // Save temp file
                    const tempPath = path.join(__dirname, `temp_audio_${Date.now()}.ogg`);
                    fs.writeFileSync(tempPath, buffer);

                    // OpenAI Whisper API
                    const FormData = require('form-data');
                    const formData = new FormData();
                    formData.append('file', fs.createReadStream(tempPath), 'audio.ogg');
                    formData.append('model', 'whisper-1');
                    formData.append('language', 'es'); // Spanish priority

                    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                            ...formData.getHeaders()
                        },
                        body: formData
                    });

                    const whisperData = await whisperResponse.json();

                    // Cleanup temp file
                    fs.unlinkSync(tempPath);

                    if (whisperData.text) {
                        logger.info(`🎤 Transcription: ${whisperData.text}`);
                        await sock.sendMessage(from, {
                            text: `🎤 *Transcripción:*\n\n"${whisperData.text}"\n\n_— OpenAI Whisper_`
                        });
                    } else {
                        logger.error('Whisper error:', whisperData);
                        await sock.sendMessage(from, { text: '🎤 Error transcribiendo audio' });
                    }
                } catch (e) {
                    logger.error('Audio transcription error:', e.message);
                    await sock.sendMessage(from, { text: `🎤 Error: ${e.message}` });
                }
                continue;
            }

            // 🎯 LEAD CAPTURE HANDLER (Process leads from website modals)
            if (text.includes('🤖 LEAD_CAPTURE') || text.includes('LEAD_CAPTURE')) {
                logger.info(`🎯 LEAD DETECTED from ${from}`);

                // Parse lead data
                const lines = text.split('\n');
                const leadData = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    from: from.replace('@s.whatsapp.net', ''),
                    package: '',
                    name: '',
                    contact: '',
                    action: '',
                    status: 'NEW'
                };

                lines.forEach(line => {
                    if (line.startsWith('Package:')) leadData.package = line.replace('Package:', '').trim();
                    if (line.startsWith('Name:')) leadData.name = line.replace('Name:', '').trim();
                    if (line.startsWith('Contact:')) leadData.contact = line.replace('Contact:', '').trim();
                    if (line.startsWith('Action:')) leadData.action = line.replace('Action:', '').trim();
                });

                // Save lead to JSON file
                const LEADS_FILE = path.join(__dirname, 'leads_capture.json');
                let leads = [];
                try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch (e) { leads = []; }
                leads.push(leadData);
                fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

                // Notify Alex (owner) - WhatsApp
                const ALEX_PHONE = settings.owner + '@s.whatsapp.net';
                const notification = `🎯 *NUEVO LEAD CAPTURADO*\n\n📦 Package: ${leadData.package}\n👤 Nombre: ${leadData.name}\n📱 Contacto: ${leadData.contact}\n📞 WhatsApp: ${leadData.from}\n⏰ ${new Date().toLocaleString('es-MX')}\n\n🔔 Action: ${leadData.action}`;

                await sock.sendMessage(ALEX_PHONE, { text: notification });
                logger.info(`✅ Lead saved and Alex notified via WhatsApp: ${leadData.name}`);

                // 📱 TELEGRAM FALLBACK - Also notify via Telegram
                try {
                    const axios = require('axios');
                    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
                    const TELEGRAM_OWNER = process.env.TELEGRAM_OWNER_ID || 5989183300;
                    if (TELEGRAM_TOKEN) {
                        const telegramMsg = `🎯 *LEAD WEB CAPTURADO*\n\n📦 ${leadData.package}\n👤 ${leadData.name}\n📱 ${leadData.contact}\n📞 WA: ${leadData.from}\n⏰ ${new Date().toLocaleString('es-MX')}`;
                        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                            chat_id: TELEGRAM_OWNER,
                            text: telegramMsg,
                            parse_mode: 'Markdown'
                        });
                        logger.info(`✅ Lead also notified via Telegram`);
                    }
                } catch (tgErr) { logger.warn('⚠️ Telegram notification failed (fallback): ' + tgErr.message); }

                // Auto-reply to lead
                await sock.sendMessage(from, {
                    text: `✅ *RECEIVED*\n\nThank you ${leadData.name}!\n\nWe've received your request for the ${leadData.package} package.\n\n📞 Our team will contact you within 24 hours via ${leadData.contact}.\n\n— ORION Tech`
                });

                continue;
            }

            // 🛑 COMMAND PROCESSING LOGIC:
            // Only process as commands if:
            // 1. Message is from ME (isMe = true) AND
            // 2. Message is sent TO MYSELF (self-chat) - not to other contacts
            // This prevents treating messages to friends/clients as commands

            const myNumber = settings.owner || settings.AUTHORIZED_NUMBERS?.[0] || '16692342444';
            // Check both phone number format AND LID format (after QR reconnect)
            const myLID = '181015809122484'; // Alex's LID
            const isToMyself = from.includes(myNumber) || from.includes(myLID) || from === 'status@broadcast';

            logger.info(`🔍 DEBUG: from=${from}, myNumber=${myNumber}, isMe=${isMe}, isToMyself=${isToMyself}, text="${text.substring(0, 30)}"`);

            // If I'm sending to someone else, ignore (don't process as command)
            if (isMe && !isToMyself) {
                logger.info('⏭️ SKIP: Sending to someone else');
                continue; // Skip - this is a normal message to another person
            }

            // If message is FROM someone else TO me, ignore for now (no auto-reply mode)
            if (!isMe) {
                logger.info('⏭️ SKIP: Message from someone else');
                continue; // Skip incoming messages from others
            }

            // At this point: isMe=true AND isToMyself=true → Process as command
            logger.info(`📩 [SELF-CMD] ${text}`);

            if (!userState.has(from)) {
                userState.set(from, { mode: 'orion', history: [] });
                saveState();
            }
            const currentUser = userState.get(from);
            const cleanText = text.trim().toLowerCase();

            // 📖 ACUTOR - MANUAL (FIREBASE URL)
            if (cleanText === 'acutor' || cleanText === '!acutor' || cleanText === 'manual') {
                await sock.sendMessage(from, { text: `📖 *MANUAL ORION SYSTEM v5.4*\n\n🌍 *Acceso Global (Firebase):*\n${MANUAL_URL}\n\n✅ Link Público.\n💡 Guárdalo en favoritos.` });
                continue;
            }

            // 🔗 ORION APPS LINKS
            if (['!apps', 'apps', '!links', 'links', 'orion apps', 'dame los links', 'mis links'].includes(cleanText)) {
                let msg = '🔗 *ORION LINKS*\n\n';

                msg += '📱 *APPS IA:*\n';
                ORION_APPS.forEach((app, i) => {
                    msg += `${i + 1}. *${app.name}* - ${app.desc}\n   ${app.url}\n\n`;
                });

                msg += '🌐 *LINKS ESENCIALES:*\n';
                ESSENTIAL_LINKS.forEach((link) => {
                    msg += `• *${link.name}* - ${link.desc}\n  ${link.url}\n\n`;
                });

                await sock.sendMessage(from, { text: msg });
                continue;
            }

            // 🌐 ACUTOR 2 - NEKON LANDING
            if (cleanText === 'acutor 2' || cleanText === 'acutor2' || cleanText === '!acutor2' || cleanText === 'nekon landing') {
                await sock.sendMessage(from, { text: `✅ *Landing Page neKon AI*\n\n🌐 ${NEKON_URL}\n\n📱 WhatsApp: +1 (669) 234-2444\n📧 Email: orion.system.ai@gmail.com\n\n💡 Accesible Globalmente` });
                continue;
            }

            // 💰 PRICE BOOK v6.0 PRO
            if (cleanText === 'pb' || cleanText === '!pb' || cleanText === 'pricebook' || cleanText === 'price book') {
                await sock.sendMessage(from, { text: `💰 *PRICE BOOK v6.0 PRO*\n\n🔗 ${PRICEBOOK_URL}\n\n✅ 100 Servicios Profesionales\n💵 Precios: Estándar / Miembro / Emergencia\n📐 Metodología de Cálculo\n🎯 Sistema Good/Better/Best\n💡 Upsells con Scripts\n🎁 Promociones Activas\n📜 Términos y Garantías\n\n🏆 Cumple estándares ServiceTitan | Profit Rhino` });
                continue;
            }

            // 🤖 ORION BOTS - Landing Page
            if (cleanText === 'otp' || cleanText === '!otp' || cleanText === 'orion bots') {
                await sock.sendMessage(from, { text: `🤖 *ORION BOTS - Landing Page*\n\n🔗 ${ORIONBOTS_URL}\n\n✨ Servicios de Automatización WhatsApp\n🚀 Bots Personalizados\n💼 Soluciones Empresariales` });
                continue;
            }

            // 🎄 TJNAV / TLINV - Asistente de Tarjetas Navideñas (Nelson AI)
            if (['/tjnav', '!tjnav', 'tjnav', '/tlinv', '!tlinv', 'tlinv'].includes(cleanText)) {
                const response = `🚀 *Hello! I'm Nelson.* \n\nStarting your Christmas card assistant. \n\n🌐 *Access here:* \n${CHRISTMAS_URL}\n\n_Tell me:_ *Who is the card for?* \n(Eg: My mother, A friend, My boss, etc.)`;
                await sock.sendMessage(from, { text: response });
                continue;
            }

            // 📱 ENVIAR MENSAJE A CUALQUIER NÚMERO
            if (cleanText.startsWith('/enviar ') || cleanText.startsWith('/msg ') || cleanText.startsWith('/send ') ||
                cleanText.startsWith('envia mensaje a ') || cleanText.startsWith('manda mensaje a ')) {
                const parts = text.replace(/^(\/enviar|\/msg|\/send)\s+/i, '').trim();
                const match = parts.match(/^(\+?\d+)\s+(.+)$/s);

                if (!match) {
                    await sock.sendMessage(from, { text: '📱 *Uso:* /enviar [número] [mensaje]\n\nEjemplos:\n/enviar 14082063896 Hola, este es un mensaje de prueba\n/enviar +573245143926 Feliz Navidad!\n\n💡 El número debe incluir código de país sin espacios.' });
                    continue;
                }

                const numero = match[1].replace(/^\+/, ''); // Remove + if present
                const mensaje = match[2].trim();
                const destino = `${numero}@s.whatsapp.net`;

                try {
                    await sock.sendMessage(destino, { text: mensaje + FIRMA });
                    await sock.sendMessage(from, { text: `✅ *Mensaje enviado*\n\n📱 A: +${numero}\n💬 Mensaje: ${mensaje.substring(0, 100)}${mensaje.length > 100 ? '...' : ''}\n\n_Enviado vía ORION Clean_` });
                    logger.info(`📤 [SEND CMD] Message sent to ${numero}`);
                } catch (e) {
                    await sock.sendMessage(from, { text: `❌ Error enviando mensaje: ${e.message}\n\n💡 Verifica que el número sea correcto y tenga WhatsApp.` });
                    logger.error(`Error sending to ${numero}: ${e.message}`);
                }
                continue;
            }




            // 🎬 GENERAR VIDEO CON SORA AI
            if (cleanText.startsWith('/video ') || cleanText.startsWith('!video ') ||
                cleanText.startsWith('genera video ') || cleanText.startsWith('crea video ')) {
                const prompt = text.replace(/^(\/video|!video)\s+/i, '').trim();
                if (!prompt) {
                    await sock.sendMessage(from, { text: '🎬 *Uso:* /video [descripción del video]\n\nEjemplo: /video Futuristic city with flying cars and neon lights' });
                    continue;
                }

                try {
                    await sock.sendMessage(from, { text: '🎬 *Generando video con Sora AI...*\n\n⏳ Esto puede tomar 1-3 minutos.\n\n📝 Prompt: ' + prompt.substring(0, 100) + '...' });

                    // Call Sora API
                    const OpenAI = require('openai').default;
                    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                    const video = await client.videos.createAndPoll({
                        model: 'sora-2',
                        prompt: prompt,
                        duration: 5,
                        aspect_ratio: '16:9'
                    });

                    logger.info(`🎬 Sora Video Generated: ${video.id}`);

                    const videoUrl = video.url || video.output_url || 'URL no disponible';
                    await sock.sendMessage(from, {
                        text: `🎬 *¡Video Generado!*\n\n🆔 ID: ${video.id}\n🔗 URL: ${videoUrl}\n⏱️ Duración: 5s\n📐 Ratio: 16:9\n\n_Generado con Sora AI_`
                    });

                } catch (e) {
                    logger.error('Sora Video Error: ' + e.message);
                    await sock.sendMessage(from, {
                        text: `❌ *Error generando video:*\n\n${e.message}\n\n💡 Nota: Sora API requiere acceso especial de OpenAI.`
                    });
                }
                continue;
            }

            // 🎬 WAN 2.1 - VIDEO AI CHINA (Alibaba Open Source)
            if (cleanText.startsWith('/wan ') || cleanText.startsWith('!wan ') ||
                cleanText.startsWith('wan video ') || cleanText.startsWith('genera video wan ')) {
                const prompt = text.replace(/^(\/wan|!wan|wan video|genera video wan)\s+/i, '').trim();
                if (!prompt) {
                    await sock.sendMessage(from, {
                        text: `🎬 *WAN 2.1 - Video AI (Alibaba)*

📝 *Uso:* /wan [descripción del video]

🎯 *Ejemplos:*
• /wan Un gato jugando con una pelota en el parque
• /wan Astronauta caminando en Marte, cinematográfico
• /wan Ciudad futurista con carros voladores, noche, neon

📀 *Configuración:*
Requiere configurar en .env:
• REPLICATE_API_TOKEN (gratis en replicate.com)
• FAL_KEY (económico en fal.ai)

💡 El video se guarda automáticamente en downloads/videos/`
                    });
                    continue;
                }

                // Verificar si el módulo está cargado
                if (!wanVideo) {
                    await sock.sendMessage(from, { text: '❌ Módulo Wan 2.1 no cargado. Revisa la consola.' });
                    continue;
                }

                try {
                    await sock.sendMessage(from, {
                        text: `🎬 *Generando video con Wan 2.1...*

⏳ Esto puede tomar 2-5 minutos.
📝 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}

_Powered by Alibaba Wan 2.1 AI_`
                    });

                    const result = await wanVideo.generateVideo(prompt, {
                        frames: 16,
                        fps: 8,
                        resolution: '480p'
                    });

                    if (result.success) {
                        // Enviar confirmación
                        await sock.sendMessage(from, {
                            text: wanVideo.formatResponse(result)
                        });

                        // Intentar enviar el video directamente
                        if (result.localPath && fs.existsSync(result.localPath)) {
                            const videoBuffer = fs.readFileSync(result.localPath);
                            await sock.sendMessage(from, {
                                video: videoBuffer,
                                caption: `🎬 *${prompt.substring(0, 50)}*\n\n_Generado con Wan 2.1 AI_`,
                                mimetype: 'video/mp4'
                            });
                            logger.info(`🎬 Wan video sent: ${result.localPath}`);
                        }
                    } else {
                        throw new Error('No se pudo generar el video');
                    }

                } catch (e) {
                    logger.error('Wan Video Error: ' + e.message);
                    await sock.sendMessage(from, {
                        text: `❌ *Error generando video:*

${e.message}

💡 *Soluciones:*
1. Configura REPLICATE_API_TOKEN en .env (gratis en replicate.com)
2. O configura FAL_KEY en .env (económico en fal.ai)

📖 Ver: /wan (sin parámetros) para instrucciones`
                    });
                }
                continue;
            }

            // 🎥 WAN I2V - Imagen a Video
            if (cleanText === '/wan-i2v' || cleanText === '/wani2v' || cleanText === 'wan imagen a video') {
                await sock.sendMessage(from, {
                    text: `🎥 *WAN 2.1 - Imagen a Video*

📝 *Instrucciones:*
1. Envía una imagen
2. Responde a la imagen con: /wan-animate [descripción del movimiento]

🎯 *Ejemplo:*
[Envía foto de un perro]
Responde: /wan-animate El perro corre feliz por el parque

💡 También puedes usar:
• /wan-animate La imagen cobra vida con movimiento suave
• /wan-animate Efecto cinematográfico con zoom lento

_Powered by Wan 2.1 I2V_`
                });
                continue;
            }

            // 🔍 BÚSQUEDA GOOGLE CON SERPER
            if (cleanText.startsWith('/buscar ') || cleanText.startsWith('/search ') ||
                cleanText.startsWith('buscar ') || cleanText.startsWith('busca en google ') || cleanText.startsWith('googlea ')) {
                const query = text.replace(/^(\/buscar|\/search)\s+/i, '').trim();
                if (!query) {
                    await sock.sendMessage(from, { text: '🔍 *Uso:* /buscar [consulta]\n\nEjemplo: /buscar mejores restaurantes en Bogotá' });
                    continue;
                }

                try {
                    await sock.sendMessage(from, { text: '🔍 Buscando en Google...' });
                    const results = await serper.searchGoogle(query, 5);

                    if (results.length === 0) {
                        await sock.sendMessage(from, { text: '❌ No se encontraron resultados.' });
                    } else {
                        let response = `🔍 *Resultados para:* "${query}"\n\n`;
                        results.forEach((r, i) => {
                            response += `*${i + 1}. ${r.title}*\n${r.snippet}\n🔗 ${r.link}\n\n`;
                        });
                        await sock.sendMessage(from, { text: response });
                    }
                } catch (e) {
                    await sock.sendMessage(from, { text: `❌ Error buscando: ${e.message}\n\n💡 Configura SERPER_API_KEY (gratis en serper.dev)` });
                }
                continue;
            }

            // 🕷️ WEB SCRAPING
            if (cleanText.startsWith('/scrape ') || cleanText.startsWith('/leer ') ||
                cleanText.startsWith('lee la web ') || cleanText.startsWith('extrae de ') || cleanText.startsWith('scrape ')) {
                const url = text.replace(/^(\/scrape|\/leer)\s+/i, '').trim();
                if (!url || !url.startsWith('http')) {
                    await sock.sendMessage(from, { text: '🕷️ *Uso:* /scrape [URL]\n\nEjemplo: /scrape https://ejemplo.com' });
                    continue;
                }

                try {
                    await sock.sendMessage(from, { text: '🕷️ Extrayendo contenido...' });
                    const result = await scraper.scrapeUrl(url);

                    if (result.success) {
                        const response = `🕷️ *Contenido extraído:*\n\n📰 *${result.title}*\n\n${result.content.substring(0, 2000)}...`;
                        await sock.sendMessage(from, { text: response });
                    } else {
                        await sock.sendMessage(from, { text: `❌ Error: ${result.error}` });
                    }
                } catch (e) {
                    await sock.sendMessage(from, { text: `❌ Error scraping: ${e.message}` });
                }
                continue;
            }

            // 🆓 GROQ FREE AI (Backup)
            if (cleanText.startsWith('/groq ') || cleanText.startsWith('/free ') ||
                cleanText.startsWith('pregunta gratis ') || cleanText.startsWith('ia gratis ') || cleanText.startsWith('groq ')) {
                const prompt = text.replace(/^(\/groq|\/free)\s+/i, '').trim();
                if (!prompt) {
                    await sock.sendMessage(from, { text: '🆓 *Uso:* /groq [pregunta]\n\nEjemplo: /groq Explica la relatividad en términos simples' });
                    continue;
                }

                try {
                    await sock.sendMessage(from, { text: '🆓 Consultando AI gratuita (Groq)...' });
                    const result = await freeai.queryFreeAI(prompt);
                    await sock.sendMessage(from, { text: `🤖 *${result.provider}:*\n\n${result.response}` });
                } catch (e) {
                    await sock.sendMessage(from, { text: `❌ Error: ${e.message}\n\n💡 Configura GROQ_API_KEY (gratis en console.groq.com)` });
                }
                continue;
            }

            // 🦙 OLLAMA - IA LOCAL (Gemma/Llama) - Lenguaje Natural
            const ollamaPatterns = ['/ollama ', '/gemma ', '/local ', 'gemma ', 'ollama ', 'pregunta a gemma ', 'preguntale a gemma ', 'ask gemma ', 'ia local '];
            const matchedOllama = ollamaPatterns.find(p => cleanText.startsWith(p));
            if (matchedOllama) {
                const prompt = text.substring(matchedOllama.length).trim();
                if (!prompt) {
                    await sock.sendMessage(from, { text: '🦙 *IA Local (Gemma2)*\n\nEscribe: gemma [tu pregunta]\n\nEjemplo: gemma Explica qué es machine learning' });
                    continue;
                }

                try {
                    await sock.sendMessage(from, { text: '🦙 Consultando IA local (Gemma2)...' });
                    const { exec } = require('child_process');

                    exec(`ollama run gemma2 "${prompt.replace(/"/g, '\\"')}"`, { timeout: 60000 }, async (error, stdout, stderr) => {
                        if (error) {
                            await sock.sendMessage(from, { text: `❌ Error: ${error.message}\n\n💡 Asegúrate de que Ollama esté corriendo.` });
                        } else {
                            const response = stdout.trim() || 'Sin respuesta';
                            await sock.sendMessage(from, { text: `🦙 *Gemma2 (Local):*\n\n${response.substring(0, 3000)}` });
                        }
                    });
                } catch (e) {
                    await sock.sendMessage(from, { text: `❌ Error: ${e.message}` });
                }
                continue;
            }

            // 🎙️ VOZ - Clonación de Voz Local - Lenguaje Natural
            if (['/voz', '/voice', '/tts-local', 'clonar voz', 'clona mi voz', 'voice clone', 'voz local'].includes(cleanText)) {
                await sock.sendMessage(from, { text: `🎙️ *Clonación de Voz Local*\n\n📋 *Herramientas instaladas:*\n• Chatterbox TTS\n• F5-TTS\n\n🚀 *Para usar:*\n\`\`\`\nf5-tts_infer-gradio\n\`\`\`\n\n🌐 Abrirá interfaz en http://localhost:7860\n\n📝 *Pasos:*\n1. Sube audio de referencia (30 seg)\n2. Escribe el texto a generar\n3. Click en Generate\n\n_— ORION AI Tools_` });
                continue;
            }

            // 🧑‍🎤 AVATAR - Crear Avatar Animado - Lenguaje Natural
            if (['/avatar', '/sadtalker', '/talking', 'crear avatar', 'avatar animado', 'talking head', 'animar foto'].includes(cleanText)) {
                await sock.sendMessage(from, { text: `🧑‍🎤 *Crear Avatar Animado*\n\n📋 *Herramientas instaladas:*\n• SadTalker\n• LivePortrait\n\n🚀 *Para usar:*\n\`\`\`\npython crear_avatar.py\n\`\`\`\n\n📝 *Necesitas:*\n1. Una foto (JPG/PNG)\n2. Un audio (WAV/MP3)\n\n🎯 *Resultado:* Video del avatar hablando\n\n💡 También disponible en Pinokio:\n• EchoMimic\n• MuseTalk\n• Linly-Talker\n\n_— ORION AI Tools_` });
                continue;
            }

            // 🎬 PINOKIO - Generación de Video - Lenguaje Natural
            if (['/pinokio', '/video-local', 'pinokio', 'video local', 'generar video', 'crear video'].includes(cleanText)) {
                await sock.sendMessage(from, { text: `🎬 *Generación de Video Local*\n\n📋 *Pinokio instalado:* ✅\n\n🚀 *Modelos disponibles (1-click install):*\n• LTX Video (rápido)\n• HunyuanVideo (calidad)\n• ComfyUI (avanzado)\n• Stable Video Diffusion\n\n💻 *Compatibilidad:*\n• NVIDIA (CUDA) ✅\n• AMD (ROCm) ✅\n\n📍 Abrir desde menú inicio: *Pinokio*\n\n_— ORION AI Tools_` });
                continue;
            }

            // 🤖 AI-TOOLS - Lista de todas las herramientas IA - Lenguaje Natural
            if (['/ai', '/ia', '/tools', '/herramientas', 'ai', 'ia', 'herramientas', 'tools', 'que puedes hacer', 'ayuda ia', 'comandos'].includes(cleanText)) {
                await sock.sendMessage(from, { text: `🤖 *ORION AI Suite Completa*\n\n🏠 *IA LOCAL (Offline):*\n• gemma [pregunta] - Chat IA\n• imagen [prompt] - Generar imagen\n• musica [descripción] - Crear música\n• transcribir - Audio→Texto\n• ocr - Imagen→Texto\n\n🎨 *CREATIVOS:*\n• clonar voz - Tu voz clonada\n• crear avatar - Foto animada\n• pinokio - Videos IA\n• fooocus - Imágenes pro\n\n📡 *ONLINE:*\n• buscar [query] - Google\n• groq [pregunta] - IA gratis\n\n📋 *UTILIDADES:*\n• enviar [num] [msg]\n• acutor - Manual\n\n_Todo offline y gratis_` });
                continue;
            }

            // 🎨 IMAGEN - Generador de Imágenes Local
            if (cleanText.startsWith('imagen ') || cleanText.startsWith('/imagen ') || cleanText.startsWith('genera imagen ')) {
                await sock.sendMessage(from, { text: `🎨 *Generación de Imágenes*\n\n📋 *Herramientas instaladas:*\n• Fooocus (como Midjourney, gratis)\n• Stable Diffusion XL\n• Diffusers (Python)\n\n🚀 *Para usar Fooocus:*\n\`\`\`\ncd C:\\Users\\alexp\\Fooocus\npython run.py\n\`\`\`\n\n🌐 Abrirá http://localhost:7865\n\n💡 También disponible en Pinokio` });
                continue;
            }

            // 🎵 MÚSICA - Generador de Música Local
            if (cleanText.startsWith('musica ') || cleanText.startsWith('/musica ') || cleanText.startsWith('crear musica') || cleanText === 'musicgen') {
                await sock.sendMessage(from, { text: `🎵 *Generación de Música*\n\n📋 *MusicGen (Meta) instalado* ✅\n\n🚀 *Uso en Python:*\n\`\`\`python\nfrom audiocraft.models import MusicGen\nmodel = MusicGen.get_pretrained('small')\nmodel.generate(['rock energético'])\n\`\`\`\n\n💡 Modelos: small (300MB), medium (1.5GB), large (3.3GB)` });
                continue;
            }

            // 🎤 TRANSCRIBIR - Audio a Texto
            if (cleanText === 'transcribir' || cleanText === '/transcribir' || cleanText === 'whisper' || cleanText === 'audio a texto') {
                await sock.sendMessage(from, { text: `🎤 *Transcripción de Audio*\n\n📋 *Herramientas instaladas:*\n• Whisper (OpenAI) - El mejor\n• Vosk - Ligero y rápido\n\n🚀 *Uso Whisper:*\n\`\`\`\nwhisper audio.mp3 --language Spanish\n\`\`\`\n\n🚀 *Uso en Python:*\n\`\`\`python\nimport whisper\nmodel = whisper.load_model("base")\nresult = model.transcribe("audio.mp3")\nprint(result["text"])\n\`\`\`\n\n💡 Modelos: tiny, base, small, medium, large` });
                continue;
            }

            // 📄 OCR - Imagen a Texto
            if (cleanText === 'ocr' || cleanText === '/ocr' || cleanText === 'leer imagen' || cleanText === 'extraer texto') {
                await sock.sendMessage(from, { text: `📄 *OCR - Texto de Imágenes*\n\n📋 *Herramientas instaladas:*\n• EasyOCR (80+ idiomas)\n• PyTesseract (100+ idiomas)\n\n🚀 *Uso EasyOCR:*\n\`\`\`python\nimport easyocr\nreader = easyocr.Reader(['es','en'])\nresult = reader.readtext('imagen.png')\nprint(result)\n\`\`\`\n\n💡 Soporta español, inglés, y muchos más` });
                continue;
            }

            // 🖥️ PC CONTROL - Captura de pantalla
            if (['!captura', '/captura', 'captura', 'screenshot', 'captura de pantalla'].includes(cleanText)) {
                try {
                    const screenshot = require('screenshot-desktop');
                    const img = await screenshot();
                    const imgPath = path.join(__dirname, 'temp_screenshot.png');
                    fs.writeFileSync(imgPath, img);
                    await sock.sendMessage(from, { image: fs.readFileSync(imgPath), caption: '📸 Captura de pantalla' });
                    fs.unlinkSync(imgPath);
                } catch (e) {
                    await sock.sendMessage(from, { text: `📸 *Captura de Pantalla*\n\n⚠️ Requiere: npm install screenshot-desktop\n\nError: ${e.message}` });
                }
                continue;
            }

            // 🖥️ PC CONTROL - Portapapeles (leer)
            if (['!portapapeles', '/portapapeles', 'portapapeles', 'clipboard', 'leer portapapeles'].includes(cleanText)) {
                try {
                    const { exec } = require('child_process');
                    exec('powershell Get-Clipboard', (err, stdout) => {
                        if (err) {
                            sock.sendMessage(from, { text: '📋 Error leyendo portapapeles' });
                        } else {
                            sock.sendMessage(from, { text: `📋 *Portapapeles:*\n\n${stdout.trim() || '(vacío)'}` });
                        }
                    });
                } catch (e) {
                    await sock.sendMessage(from, { text: `📋 Error: ${e.message}` });
                }
                continue;
            }

            // 🖥️ PC CONTROL - Copiar al portapapeles
            if (cleanText.startsWith('!copiar ') || cleanText.startsWith('/copiar ') || cleanText.startsWith('copiar ')) {
                const textToCopy = text.replace(/^(!copiar|\/copiar|copiar)\s+/i, '').trim();
                try {
                    const { exec } = require('child_process');
                    exec(`powershell Set-Clipboard -Value "${textToCopy.replace(/"/g, '\\"')}"`, (err) => {
                        if (err) {
                            sock.sendMessage(from, { text: '📋 Error copiando al portapapeles' });
                        } else {
                            sock.sendMessage(from, { text: `📋 ✅ Copiado al portapapeles:\n"${textToCopy}"` });
                        }
                    });
                } catch (e) {
                    await sock.sendMessage(from, { text: `📋 Error: ${e.message}` });
                }
                continue;
            }

            // 🖥️ PC CONTROL - Estado del sistema
            if (['!estado', '/estado', 'estado', 'estado pc', 'system status', 'status'].includes(cleanText)) {
                try {
                    const os = require('os');
                    const cpuUsage = os.loadavg()[0].toFixed(2);
                    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
                    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
                    const usedMem = (totalMem - freeMem).toFixed(1);
                    const uptime = Math.floor(os.uptime() / 3600);

                    await sock.sendMessage(from, { text: `🖥️ *Estado del Sistema*\n\n💻 CPU Load: ${cpuUsage}\n💾 RAM: ${usedMem}GB / ${totalMem}GB (${((usedMem / totalMem) * 100).toFixed(0)}%)\n⏱️ Uptime: ${uptime} horas\n🖥️ OS: ${os.platform()} ${os.release()}\n💿 Hostname: ${os.hostname()}` });
                } catch (e) {
                    await sock.sendMessage(from, { text: `🖥️ Error: ${e.message}` });
                }
                continue;
            }

            // 🖥️ PC CONTROL - Apagar PC
            if (['!apagar pc', '/apagar pc', 'apagar pc', 'apagar computadora', 'shutdown'].includes(cleanText)) {
                await sock.sendMessage(from, { text: '⚠️ *APAGANDO PC EN 10 SEGUNDOS*\n\nEscribe "cancelar" para abortar' });
                const { exec } = require('child_process');
                exec('shutdown /s /t 10');
                continue;
            }

            // 🖥️ PC CONTROL - Reiniciar PC
            if (['!reiniciar pc', '/reiniciar pc', 'reiniciar pc', 'reiniciar computadora', 'restart'].includes(cleanText)) {
                await sock.sendMessage(from, { text: '⚠️ *REINICIANDO PC EN 10 SEGUNDOS*\n\nEscribe "cancelar" para abortar' });
                const { exec } = require('child_process');
                exec('shutdown /r /t 10');
                continue;
            }

            // 🖥️ PC CONTROL - Cancelar shutdown
            if (['cancelar', 'cancel', 'abortar', 'abort'].includes(cleanText)) {
                const { exec } = require('child_process');
                exec('shutdown /a', (err) => {
                    if (!err) {
                        sock.sendMessage(from, { text: '✅ Apagado/reinicio cancelado' });
                    }
                });
                continue;
            }

            // 🧠 MEMORIA - Guardar
            if (cleanText.startsWith('!recuerda ') || cleanText.startsWith('recuerda ') || cleanText.startsWith('/recuerda ')) {
                const memText = text.replace(/^(!recuerda|recuerda|\/recuerda)\s+/i, '').trim();
                const MEMORIA_FILE = path.join(__dirname, 'memoria.json');
                let memoria = {};
                if (fs.existsSync(MEMORIA_FILE)) {
                    memoria = JSON.parse(fs.readFileSync(MEMORIA_FILE, 'utf8'));
                }
                const match = memText.match(/(.+?)\s+(es|son|significa|=)\s+(.+)/i);
                if (match) {
                    const key = match[1].toLowerCase().trim();
                    const value = match[3].trim();
                    memoria[key] = value;
                    fs.writeFileSync(MEMORIA_FILE, JSON.stringify(memoria, null, 2));
                    await sock.sendMessage(from, { text: `🧠 *Guardado en memoria:*\n\n"${key}" = "${value}"` });
                } else {
                    await sock.sendMessage(from, { text: '🧠 *Formato:* recuerda [X] es [Y]\n\nEjemplo: recuerda mi cumpleaños es 15 de marzo' });
                }
                continue;
            }

            // 🧠 MEMORIA - Buscar
            if (cleanText.startsWith('!memoria ') || cleanText.startsWith('memoria ') || cleanText.startsWith('/memoria ')) {
                const query = text.replace(/^(!memoria|memoria|\/memoria)\s+/i, '').trim().toLowerCase();
                const MEMORIA_FILE = path.join(__dirname, 'memoria.json');
                if (fs.existsSync(MEMORIA_FILE)) {
                    const memoria = JSON.parse(fs.readFileSync(MEMORIA_FILE, 'utf8'));
                    const results = Object.entries(memoria).filter(([k]) => k.includes(query));
                    if (results.length > 0) {
                        let response = '🧠 *Memoria encontrada:*\n\n';
                        results.forEach(([k, v]) => { response += `• "${k}" = "${v}"\n`; });
                        await sock.sendMessage(from, { text: response });
                    } else {
                        await sock.sendMessage(from, { text: `🧠 No encontré "${query}" en la memoria` });
                    }
                } else {
                    await sock.sendMessage(from, { text: '🧠 La memoria está vacía' });
                }
                continue;
            }

            // 🎭 PERSONAS - Cambiar modo/personalidad
            const personas = ['orion', 'estimator', 'mppro', 'nekon', 'advortex', 'neonhub', 'business suite'];
            if (personas.includes(cleanText)) {
                const currentUser = userState.get(from) || { mode: 'orion', history: [] };
                currentUser.mode = cleanText;
                currentUser.history = [];
                userState.set(from, currentUser);
                saveState();
                await sock.sendMessage(from, { text: `🎭 *Modo activado:* ${cleanText.toUpperCase()}\n\nLa personalidad ha cambiado. Historial limpiado.` });
                continue;
            }

            // 📰 NOTICIAS - Tech news
            if (['!noticias', '/noticias', 'noticias', 'news', 'noticias tech'].includes(cleanText)) {
                await sock.sendMessage(from, { text: '📰 *Noticias Tech*\n\nUsa /buscar [tema] para buscar noticias específicas\n\nO visita:\n• TechCrunch: techcrunch.com\n• The Verge: theverge.com\n• Xataka: xataka.com' });
                continue;
            }

            // 📧 EMAIL - Enviar correo (natural language)
            if (cleanText.startsWith('enviar email a ') || cleanText.startsWith('enviar correo a ') ||
                cleanText.startsWith('manda email a ') || cleanText.startsWith('email a ')) {
                // Format: enviar email a email@ejemplo.com asunto Hola mensaje Contenido del email
                const emailMatch = text.match(/(?:enviar email a|enviar correo a|manda email a|email a)\s+(\S+@\S+)\s+(?:asunto|subject)\s+(.+?)\s+(?:mensaje|message|body)\s+(.+)/i);
                if (emailMatch) {
                    const [, toEmail, subject, body] = emailMatch;
                    try {
                        const emailModule = require('./src/apps/email');
                        const result = await emailModule.sendEmail(toEmail, subject, body);
                        if (result.success) {
                            await sock.sendMessage(from, { text: `📧 ✅ Email enviado a ${toEmail}\n\nAsunto: ${subject}` });
                        } else {
                            await sock.sendMessage(from, { text: `📧 ❌ Error: ${result.error}` });
                        }
                    } catch (e) {
                        await sock.sendMessage(from, { text: `📧 Error: ${e.message}` });
                    }
                } else {
                    await sock.sendMessage(from, { text: '📧 *Formato de email:*\n\nenviar email a email@ejemplo.com asunto Mi Asunto mensaje Contenido del email' });
                }
                continue;
            }

            // 📹 YOUTUBE - Descargar video/audio (natural language)
            if (cleanText.startsWith('descarga de youtube ') || cleanText.startsWith('descarga youtube ') ||
                cleanText.startsWith('bajar de youtube ') || cleanText.startsWith('youtube ')) {
                const ytUrl = text.match(/(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+)/i);
                if (ytUrl) {
                    const isAudio = cleanText.includes('audio') || cleanText.includes('mp3') || cleanText.includes('musica');
                    await sock.sendMessage(from, { text: `📹 Descargando ${isAudio ? 'audio' : 'video'}...` });
                    try {
                        const filePath = await youtubeApp.descargarVideo(ytUrl[1], isAudio ? 'audio' : 'video');
                        const buffer = fs.readFileSync(filePath);
                        if (isAudio) {
                            await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mp4' });
                        } else {
                            await sock.sendMessage(from, { video: buffer, caption: '📹 Descargado de YouTube' });
                        }
                    } catch (e) {
                        await sock.sendMessage(from, { text: `📹 Error: ${e.message}` });
                    }
                } else {
                    await sock.sendMessage(from, { text: '📹 *Formato:*\n\ndescarga youtube [URL]\n\nPara audio: descarga youtube audio [URL]' });
                }
                continue;
            }

            // 🧠 MEMORIA AVANZADA - Por contacto
            const MEMORIA_CONTACTOS_FILE = path.join(__dirname, 'memoria_contactos.json');

            // Guardar sobre un contacto
            if (cleanText.match(/^(recuerda que|recuerda sobre|guarda sobre|anota sobre)\s+(.+?)\s+(que|es|son|tiene|esta)\s+(.+)/i)) {
                const match = cleanText.match(/^(?:recuerda que|recuerda sobre|guarda sobre|anota sobre)\s+(.+?)\s+(?:que|es|son|tiene|esta)\s+(.+)/i);
                if (match) {
                    let memoriaContactos = {};
                    if (fs.existsSync(MEMORIA_CONTACTOS_FILE)) {
                        memoriaContactos = JSON.parse(fs.readFileSync(MEMORIA_CONTACTOS_FILE, 'utf8'));
                    }
                    const contacto = match[1].toLowerCase().trim();
                    const info = match[2].trim();
                    if (!memoriaContactos[contacto]) memoriaContactos[contacto] = [];
                    memoriaContactos[contacto].push({ info, fecha: new Date().toISOString() });
                    fs.writeFileSync(MEMORIA_CONTACTOS_FILE, JSON.stringify(memoriaContactos, null, 2));
                    await sock.sendMessage(from, { text: `🧠 Guardado sobre "${contacto}":\n"${info}"` });
                    continue;
                }
            }

            // Buscar sobre un contacto
            if (cleanText.startsWith('que sabes de ') || cleanText.startsWith('que sabes sobre ') ||
                cleanText.startsWith('info de ') || cleanText.startsWith('información de ')) {
                const query = cleanText.replace(/^(que sabes de|que sabes sobre|info de|información de)\s+/i, '').trim().toLowerCase();
                if (fs.existsSync(MEMORIA_CONTACTOS_FILE)) {
                    const memoriaContactos = JSON.parse(fs.readFileSync(MEMORIA_CONTACTOS_FILE, 'utf8'));
                    const results = Object.entries(memoriaContactos).filter(([k]) => k.includes(query));
                    if (results.length > 0) {
                        let response = `🧠 *Información sobre "${query}":*\n\n`;
                        results.forEach(([contacto, datos]) => {
                            response += `📌 *${contacto}:*\n`;
                            datos.forEach(d => { response += `  • ${d.info}\n`; });
                        });
                        await sock.sendMessage(from, { text: response });
                    } else {
                        await sock.sendMessage(from, { text: `🧠 No tengo información sobre "${query}"` });
                    }
                } else {
                    await sock.sendMessage(from, { text: '🧠 La memoria está vacía' });
                }
                continue;
            }

            // 🎨 FOOOCUS - Interfaz de imágenes
            if (cleanText === 'fooocus' || cleanText === '/fooocus' || cleanText === 'abrir fooocus') {
                await sock.sendMessage(from, { text: `🎨 *Fooocus - Generador de Imágenes*\n\n📍 Ubicación: C:\\Users\\alexp\\Fooocus\n\n🚀 *Para iniciar:*\n\`\`\`\ncd C:\\Users\\alexp\\Fooocus\npython run.py\n\`\`\`\n\n🌐 Abre http://localhost:7865\n\n✨ Es como Midjourney pero GRATIS y LOCAL\n\n💡 Primera vez descargará modelos (~7GB)` });
                continue;
            }

            // 🔌 MCP - ORION KNOWLEDGE BASE SEARCH
            if (cleanText.startsWith('/mcp ') || cleanText.startsWith('/orion ') ||
                cleanText.startsWith('consulta orion ') || cleanText.startsWith('pregunta a orion ') || cleanText.startsWith('orion busca ')) {
                const query = text.replace(/^(\/mcp|\/orion)\s+/i, '').trim();
                if (!query) {
                    await sock.sendMessage(from, { text: '🔌 *ORION MCP*\n\nUso: /mcp [consulta]\n\nEjemplo: /mcp precios de restaurantes' });
                    continue;
                }

                try {
                    await sock.sendMessage(from, { text: '🔌 Buscando en base de conocimientos ORION...' });

                    if (mcpClient) {
                        const searchResult = await mcpClient.searchWithFallback(query);

                        if (searchResult.results && searchResult.results.length > 0) {
                            let response = `🔌 *Resultados ORION MCP:*\n\n`;

                            for (const result of searchResult.results.slice(0, 3)) {
                                const doc = await mcpClient.fetchWithFallback(result.id);
                                if (doc) {
                                    response += `📄 *${doc.title}*\n${doc.text?.substring(0, 500) || 'Sin contenido'}...\n🔗 ${doc.url}\n\n`;
                                }
                            }

                            await sock.sendMessage(from, { text: response });
                        } else {
                            await sock.sendMessage(from, { text: '❌ No se encontraron resultados para: ' + query });
                        }
                    } else {
                        await sock.sendMessage(from, { text: '⚠️ MCP Client no disponible. Usa /buscar para Google Search.' });
                    }
                } catch (e) {
                    await sock.sendMessage(from, { text: `❌ Error MCP: ${e.message}` });
                }
                continue;
            }

            // 💼 PROFESSIONAL COMMANDS (CV, Skills, Landing)
            const profResponse = professional.handleProfessionalCommand(cleanText);
            if (profResponse) {
                await sock.sendMessage(from, { text: profResponse });
                continue;
            }

            // 📜 I-601A COMMANDS (DISABLED)

            // 🎤 TRANSCRIPCIÓN DE AUDIO (When user sends audio message)
            if (msg.message.audioMessage) {
                try {
                    await sock.sendMessage(from, { text: '🎤 Transcribiendo audio...' });
                    const audioBuffer = await downloadMediaMessage(
                        msg,
                        'buffer',
                        {},
                        { logger: logger.child({ module: 'baileys' }), reuploadRequest: sock.updateMediaMessage }
                    );

                    // Use Gemini for transcription
                    const transcription = await ai.generateResponse(
                        'Transcribe this audio message to text. Only return the transcription, nothing else.',
                        [],
                        'You are an audio transcription assistant. Transcribe accurately.',
                        audioBuffer
                    );

                    await sock.sendMessage(from, { text: `🎤 *Transcripción:*\n\n${transcription}` });
                } catch (e) {
                    await sock.sendMessage(from, { text: '❌ Error transcribiendo: ' + e.message });
                }
                continue;
            }

            // 🌐 TRADUCIR TEXTO
            if (cleanText.startsWith('traducir ') || cleanText.startsWith('translate ')) {
                const content = text.replace(/^(traducir|translate)\s+/i, '');
                const parts = content.split(/ a | to /i);
                const textoOriginal = parts[0].trim();
                const idiomaDestino = parts[1]?.trim() || 'inglés';

                try {
                    await sock.sendMessage(from, { text: '🌐 Traduciendo...' });
                    const traduccion = await ai.generateResponse(
                        `Translate this text to ${idiomaDestino}: "${textoOriginal}". Only return the translation, nothing else.`,
                        [],
                        'You are a professional translator. Translate accurately and naturally.'
                    );
                    await sock.sendMessage(from, { text: `🌐 *Traducción (${idiomaDestino}):*\n\n${traduccion}` });
                } catch (e) {
                    await sock.sendMessage(from, { text: '❌ Error traduciendo: ' + e.message });
                }
                continue;
            }

            // 🔊 RESPUESTA EN VOZ HD (orvoz [mensaje]) - OpenAI TTS
            if (cleanText.startsWith('orvoz ') || cleanText.startsWith('or voz ')) {
                const pregunta = text.replace(/^(orvoz|or voz)\s+/i, '').trim();
                const persona = settings.PERSONAS[currentUser.mode] || settings.PERSONAS.orion;

                try {
                    await sock.sendMessage(from, { text: '🤖🎙️ Procesando respuesta de voz HD...' });

                    // Generate AI response
                    const response = await ai.generateResponse(pregunta, currentUser.history, persona.prompt);
                    currentUser.history.push({ role: 'user', parts: [{ text: pregunta }] });
                    currentUser.history.push({ role: 'model', parts: [{ text: response }] });
                    if (currentUser.history.length > 20) currentUser.history = currentUser.history.slice(-20);
                    saveState();

                    // Send text first
                    await sock.sendMessage(from, { text: response });

                    // Send as HD voice note (OpenAI TTS)
                    try {
                        const audioPath = await tts.generateSpeechAuto(response, 'es');
                        await sock.sendMessage(from, { audio: { url: audioPath }, mimetype: 'audio/mp4', ptt: true });
                        fs.unlinkSync(audioPath); // Cleanup
                    } catch (ttsErr) {
                        // Fallback to Google TTS
                        const voiceUrl = googleTTS.getAudioUrl(response.substring(0, 200), { lang: 'es', slow: false, host: 'https://translate.google.com' });
                        await sock.sendMessage(from, { audio: { url: voiceUrl }, mimetype: 'audio/mp4', ptt: true });
                    }
                } catch (e) {
                    await sock.sendMessage(from, { text: '❌ Error: ' + e.message });
                }
                continue;
            }

            // 🗣️ VOZ TTS HD - OpenAI
            if (cleanText.startsWith('!say ') || cleanText.startsWith('di ')) {
                const phrase = text.replace(/^(!say|di)\s+/i, '');
                try {
                    // Use OpenAI TTS HD
                    const audioPath = await tts.generateSpeechAuto(phrase, 'es');
                    await sock.sendMessage(from, { audio: { url: audioPath }, mimetype: 'audio/mp4', ptt: true });
                    fs.unlinkSync(audioPath); // Cleanup
                } catch (e) {
                    // Fallback to Google TTS
                    try {
                        const url = googleTTS.getAudioUrl(phrase.substring(0, 200), { lang: 'es', slow: false, host: 'https://translate.google.com' });
                        await sock.sendMessage(from, { audio: { url: url }, mimetype: 'audio/mp4', ptt: true });
                    } catch (e2) { await sock.sendMessage(from, { text: '❌ Voice Error: ' + e.message }); }
                }
                continue;
            }

            // 📸 CAPTURA PANTALLA
            if (cleanText === '!captura' || cleanText === 'captura pantalla' || cleanText === 'screenshot') {
                try {
                    await sock.sendMessage(from, { text: '📸 Capturando pantalla...' });
                    const img = await extras.capturaPantalla();
                    await sock.sendMessage(from, { image: { url: img }, caption: '🖥️ Captura de Pantalla' });
                    fs.unlinkSync(img);
                } catch (e) { await sock.sendMessage(from, { text: '❌ Error: ' + e.message }); }
                continue;
            }

            // 🌐 CAPTURA WEB
            if (cleanText.startsWith('!web ') || cleanText.startsWith('captura web ')) {
                const url = cleanText.replace(/^(!web|captura web)\s+/i, '');
                try {
                    await sock.sendMessage(from, { text: `🌐 Visitando ${url}...` });
                    const img = await extras.capturaWeb(url);
                    await sock.sendMessage(from, { image: { url: img }, caption: `🌐 ${url}` });
                    fs.unlinkSync(img);
                } catch (e) { await sock.sendMessage(from, { text: '❌ Error: ' + e.message }); }
                continue;
            }

            // 🔳 QR CODE
            if (cleanText.startsWith('!qr ') || cleanText.startsWith('genera qr ')) {
                const txt = text.replace(/^(!qr|genera qr)\s+/i, '');
                try {
                    const img = await extras.generarQR(txt);
                    await sock.sendMessage(from, { image: { url: img }, caption: `🔳 QR: ${txt}` });
                    fs.unlinkSync(img);
                } catch (e) { await sock.sendMessage(from, { text: '❌ Error QR' }); }
                continue;
            }

            // 📰 NOTICIAS
            if (cleanText === '!noticias' || cleanText === 'noticias' || cleanText === 'news') {
                await sock.sendMessage(from, { text: '📰 Obteniendo noticias...' });
                await sock.sendMessage(from, { text: await extras.obtenerNoticias() });
                continue;
            }

            // 📋 PORTAPAPELES
            if (cleanText === '!portapapeles' || cleanText === 'portapapeles' || cleanText === 'clipboard') {
                await sock.sendMessage(from, { text: await extras.leerPortapapeles() });
                continue;
            }

            if (cleanText.startsWith('!copiar ') || cleanText.startsWith('copiar ')) {
                const txt = text.replace(/^(!copiar|copiar)\s+/i, '');
                await sock.sendMessage(from, { text: await extras.escribirPortapapeles(txt) });
                continue;
            }

            // 💻 ESTADO SISTEMA
            if (cleanText === '!estado' || cleanText === 'estado sistema' || cleanText === 'system status') {
                await sock.sendMessage(from, { text: await extras.estadoSistema() });
                continue;
            }

            // 🛑 CONTROL PC
            if (cleanText === '!apagar pc' || cleanText === 'apagar computadora') {
                try {
                    await sock.sendMessage(from, { text: '⚠️ *ATENCIÓN*: Apagando PC en 10s...' });
                    await extras.controlarPC('apagar');
                } catch (e) { await sock.sendMessage(from, { text: '❌ Error' }); }
                continue;
            }

            if (cleanText === '!reiniciar pc' || cleanText === 'reiniciar computadora') {
                try {
                    await sock.sendMessage(from, { text: '⚠️ *ATENCIÓN*: Reiniciando PC en 10s...' });
                    await extras.controlarPC('reiniciar');
                } catch (e) { await sock.sendMessage(from, { text: '❌ Error' }); }
                continue;
            }

            // 🧠 MEMORIA (Temporarily Disabled)


            // 📞 CONTACTOS
            if (cleanText === '!contactos' || cleanText === 'contactos' || cleanText === 'agenda contactos') {
                const agenda = cargarContactos();
                let msgContactos = '📞 *MI AGENDA*\n\n';
                for (const [cat, contactos] of Object.entries(agenda)) {
                    const lista = Object.entries(contactos);
                    if (lista.length > 0) {
                        msgContactos += `*${cat.toUpperCase()}:*\n`;
                        lista.forEach(([key, c]) => { msgContactos += `• ${c.nombre || key}: ${c.telefono}\n`; });
                        msgContactos += '\n';
                    }
                }
                msgContactos += '📝 Para enviar: "enviar a [nombre] diciendo [mensaje]"';
                await sock.sendMessage(from, { text: msgContactos });
                continue;
            }

            // 📤 ENVIAR MENSAJE A OTRO CONTACTO
            if (cleanText.startsWith('enviar a ') && cleanText.includes(' diciendo ')) {
                const match = text.match(/enviar a (.+?) diciendo (.+)/i);
                if (match) {
                    const destino = match[1].trim().replace(/[{}]/g, '');
                    const mensaje = match[2].trim();

                    // Format phone number
                    let numero = destino.replace(/\D/g, '');
                    if (!numero.includes('@')) {
                        numero = numero + '@s.whatsapp.net';
                    }

                    try {
                        await sock.sendMessage(numero, { text: mensaje });
                        await sock.sendMessage(from, { text: `✅ *Mensaje enviado*\n\n📱 A: ${destino}\n💬 "${mensaje}"` });
                    } catch (e) {
                        await sock.sendMessage(from, { text: `❌ Error enviando: ${e.message}` });
                    }
                } else {
                    await sock.sendMessage(from, { text: '❌ Formato: enviar a [número] diciendo [mensaje]' });
                }
                continue;
            }

            // 🚀 ANTIGRAVITY TAREAS
            if (cleanText.startsWith('!ag ') || cleanText.startsWith('ag ') || cleanText.startsWith('antigravity ')) {
                const tarea = text.replace(/^(!ag|ag|antigravity)\s+/i, '');
                const tareas = cargarTareas();
                const nueva = { id: Date.now(), tarea, estado: 'pendiente', fecha: new Date().toISOString(), from };
                tareas.push(nueva);
                guardarTareas(tareas);
                await sock.sendMessage(from, { text: `🚀 *ANTIGRAVITY*\n\n✅ Tarea registrada:\n"${tarea}"\n\n📋 ID: ${nueva.id}\n⏳ Estado: Pendiente` });
                continue;
            }

            if (cleanText === '!tareas' || cleanText === 'tareas' || cleanText === 'ver tareas') {
                const pendientes = cargarTareas().filter(t => t.estado === 'pendiente');
                if (pendientes.length > 0) {
                    let msg = '🚀 *TAREAS ANTIGRAVITY*\n\n';
                    pendientes.slice(-10).forEach((t, i) => { msg += `${i + 1}. ${t.tarea.substring(0, 40)}${t.tarea.length > 40 ? '...' : ''}\n   📅 ${new Date(t.fecha).toLocaleDateString()}\n\n`; });
                    msg += `\n📊 Total: ${pendientes.length} pendientes`;
                    await sock.sendMessage(from, { text: msg });
                } else {
                    await sock.sendMessage(from, { text: '🚀 *ANTIGRAVITY*\n\n✨ No hay tareas pendientes' });
                }
                continue;
            }

            // 🎬 PIKA VIDEO GENERATION (Natural Language)
            if (cleanText.startsWith('pika ') || cleanText.startsWith('genera video ') || cleanText.startsWith('crea video ')) {
                const prompt = text.replace(/^(pika|genera video|crea video)\s+/i, '').trim();
                await sock.sendMessage(from, { text: `🎬 *PIKA VIDEO*\n\n⏳ Generando video...\n📝 Prompt: "${prompt}"\n\n⏱️ Esto toma 1-2 minutos` });

                try {
                    const pikaScript = path.join(__dirname, '..', 'protocolos', 'pika_generator.py');

                    exec(`python "${pikaScript}" "${prompt}"`, { timeout: 180000 }, async (err, stdout, stderr) => {
                        if (err) {
                            await sock.sendMessage(from, { text: `❌ Error: ${stderr || err.message}\n\n💡 Configura DISCORD_EMAIL y DISCORD_PASSWORD en .env` });
                        } else {
                            const lines = stdout.trim().split('\n');
                            const videoPath = lines[lines.length - 1];
                            if (fs.existsSync(videoPath)) {
                                await sock.sendMessage(from, { video: { url: videoPath }, caption: `🎬 *Generado con Pika*\n📝 ${prompt}`, mimetype: 'video/mp4' });
                            } else {
                                await sock.sendMessage(from, { text: `⚠️ Video generado pero no encontrado: ${videoPath}` });
                            }
                        }
                    });
                } catch (e) {
                    await sock.sendMessage(from, { text: '❌ Error Pika: ' + e.message });
                }
                continue;
            }

            // 📥 DESCARGAR VIDEO/AUDIO (Natural)
            if (cleanText.startsWith('descargar video ') || cleanText.startsWith('bajar video ')) {
                const url = cleanText.replace(/^(descargar|bajar) video\s+/i, '');
                await sock.sendMessage(from, { text: '📥 Descargando video...' });
                try {
                    const filePath = await youtubeApp.descargarVideo(url, 'video');
                    await sock.sendMessage(from, { video: { url: filePath }, caption: '🎥 Descargado via ORION', mimetype: 'video/mp4' });
                } catch (e) { await sock.sendMessage(from, { text: '❌ Error: ' + e.message }); }
                continue;
            }

            if (cleanText.startsWith('descargar audio ') || cleanText.startsWith('bajar audio ')) {
                const url = cleanText.replace(/^(descargar|bajar) audio\s+/i, '');
                await sock.sendMessage(from, { text: '🎵 Descargando audio...' });
                try {
                    const filePath = await youtubeApp.descargarVideo(url, 'audio');
                    await sock.sendMessage(from, { audio: { url: filePath }, mimetype: 'audio/mp4', ptt: false });
                } catch (e) { await sock.sendMessage(from, { text: '❌ Error: ' + e.message }); }
                continue;
            }

            // ❓ AYUDA
            if (cleanText === 'ayuda' || cleanText === 'help' || cleanText === '?') {
                await sock.sendMessage(from, { text: `❓ *AYUDA ORION CLEAN v2.1*\n\n🧠 *IA & Voz:*\n• /say [texto] - Texto a voz\n• /orvoz [texto] - IA + voz\n• /tr [texto] a [idioma] - Traducir\n\n🔍 *AI Tools:*\n• /buscar [query] - Google Search\n• /scrape [url] - Leer web\n• /groq [query] - AI gratis\n\n📱 *Mensajes:*\n• /enviar [num] [msg] - Enviar WhatsApp\n\n💼 *Profesional:*\n• /cv /tj /skills /landing\n\n🚀 *Productividad:*\n• /ag [tarea] - Nueva tarea\n• /tareas - Ver pendientes\n• /cal - Calendario\n\n📹 *Multimedia:*\n• /yt [url] - YouTube video\n• /qr [texto] - Generar QR\n\n🔗 *Accesos:*\n• pb - Price Book\n• acutor - Manual\n• otp - Orion Bots\n• links - Apps\n\n📱 WhatsApp: +1(669) 234-2444` });
                continue;
            }

            // MENU
            if (cleanText === 'menu' || cleanText === '!menu') {
                const list = Object.keys(settings.PERSONAS).map(k => `• *${k.toUpperCase()}*: ${settings.PERSONAS[k].name}`).join('\n');
                await sock.sendMessage(from, { text: `🌌 *ORION CLEAN v2.1*\n\nMode: *${currentUser.mode.toUpperCase()}*\n\nPersonas:\n${list}\n\n📋 *COMANDOS:*\n\n🧠 *IA & Voz:*\n• /say [texto] - TTS\n• /orvoz [texto] - IA + voz\n• /tr [texto] a [idioma]\n\n🔍 *AI Tools:*\n• /buscar [q] - Google\n• /scrape [url] - Web\n• /groq [q] - AI Free\n\n📱 *Mensajes:*\n• /enviar [num] [msg]\n\n🚀 *Productividad:*\n• /ag [tarea] /tareas /cal\n\n📹 *Media:*\n• /yt [url] /qr [texto]\n\n🔗 *Links:*\n• pb / acutor / otp / links` });
                continue;
            }

            // RESET
            if (cleanText === 'reset' || cleanText === '!reset') {
                currentUser.mode = 'orion';
                currentUser.history = [];
                saveState();
                await sock.sendMessage(from, { text: '🔄 Reset to ORION mode. History cleared.' });
                continue;
            }

            // 📺 YOUTUBE
            if (cleanText.startsWith('!yt ') || cleanText.startsWith('yt ')) {
                const url = cleanText.replace(/^(!yt|yt)\s+/i, '');
                await sock.sendMessage(from, { text: '🔄 Downloading video...' });
                try {
                    const filePath = await youtubeApp.descargarVideo(url, 'video');
                    await sock.sendMessage(from, { video: { url: filePath }, caption: '🎥 Downloaded via ORION', mimetype: 'video/mp4' });
                } catch (e) { await sock.sendMessage(from, { text: '❌ Download failed: ' + e.message }); }
                continue;
            }

            // 🔍 SEARCH
            if (cleanText.startsWith('!search ') || cleanText.startsWith('busca ')) {
                const query = cleanText.replace(/^(!search|busca)\s+/i, '');
                try {
                    const results = await searchApp.buscarWeb(query);
                    if (results.length === 0) await sock.sendMessage(from, { text: '🔍 No results found.' });
                    else {
                        const txt = results.map(r => `*${r.title}*\n${r.snippet}\n🔗 ${r.link}`).join('\n\n');
                        await sock.sendMessage(from, { text: `🔍 *SEARCH RESULTS:*\n\n${txt}` });
                    }
                } catch (e) { await sock.sendMessage(from, { text: '❌ Search error: ' + e.message }); }
                continue;
            }

            // 📅 CALENDAR
            if (cleanText.startsWith('!cal') || cleanText.includes('agenda')) {
                try {
                    const events = await calendarApp.listarEventos(5);
                    if (events.length === 0) await sock.sendMessage(from, { text: '📅 No hay eventos próximos.' });
                    else {
                        const list = events.map(e => {
                            const start = e.start.dateTime || e.start.date;
                            const date = new Date(start).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            return `🗓️ *${date}*: ${e.summary}`;
                        }).join('\n');
                        await sock.sendMessage(from, { text: `📅 *Tu Agenda:*\n\n${list}` });
                    }
                } catch (e) { await sock.sendMessage(from, { text: '❌ Calendar error: ' + e.message }); }
                continue;
            }

            // 🧠 MEMORIA
            if (cleanText.startsWith('!recuerda ') || cleanText.startsWith('recuerda que ')) {
                const parts = text.replace(/^(!recuerda|recuerda que)\s+/i, '').split(' es ');
                if (parts.length >= 2) {
                    memoria.guardar('general', parts[0], parts.slice(1).join(' es '));
                    await sock.sendMessage(from, { text: `🧠 *Memoria actualizada*\nHe guardado que "${parts.slice(1).join(' es ')}" sobre "${parts[0]}".` });
                } else {
                    await sock.sendMessage(from, { text: '❌ Formato: recuerda que [clave] es [dato]' });
                }
                continue;
            }

            if (cleanText.startsWith('!memoria ') || cleanText.startsWith('que recuerdas de ') || cleanText.startsWith('qué sabes de ')) {
                const query = cleanText.replace(/^(!memoria|que recuerdas de|qué sabes de)\s+/i, '');
                const recuerdos = memoria.buscar(query);
                if (recuerdos.length > 0) {
                    const txt = recuerdos.map(r => `🔹 *${r.clave}*: ${JSON.stringify(r.valor)}`).join('\n');
                    await sock.sendMessage(from, { text: `🧠 *Lo que recuerdo sobre "${query}":*\n\n${txt}` });
                } else {
                    await sock.sendMessage(from, { text: `🧠 No tengo recuerdos sobre "${query}".` });
                }
                continue;
            }

            // 📂 ENVIAR ARCHIVO LOCAL (!dame file.pdf)
            if (cleanText.startsWith('!dame ') || cleanText.startsWith('dame ') || cleanText.startsWith('envia ') || cleanText.startsWith('envía ')) {
                const fileName = cleanText.replace(/^(!dame|dame|envia|envía)\s+/i, '').trim();
                await sock.sendMessage(from, { text: `🔍 Buscando archivo "${fileName}" en tu PC...` });

                // Carpetas donde buscar (Recursivo sería lento, buscaremos en rutas clave)
                const searchPaths = [
                    'C:\\Users\\alexp\\OneDrive\\Documentos',
                    'C:\\Users\\alexp\\Desktop',
                    'C:\\Users\\alexp\\Downloads',
                    path.join(__dirname, 'public'), // Carpeta pública del proyecto
                    path.join(__dirname, 'docs')    // Docs del proyecto
                ];

                let foundPath = null;

                // Helper para buscar
                const findFile = (dir, name) => {
                    try {
                        const files = fs.readdirSync(dir);
                        for (const file of files) {
                            if (file.toLowerCase().includes(name.toLowerCase())) {
                                return path.join(dir, file);
                            }
                        }
                    } catch (e) { } // Ignorar carpetas sin permiso
                    return null;
                };

                for (const dir of searchPaths) {
                    foundPath = findFile(dir, fileName);
                    if (foundPath) break;
                }

                if (foundPath) {
                    const stats = fs.statSync(foundPath);
                    if (stats.size > 100 * 1024 * 1024) { // Limite 100MB
                        await sock.sendMessage(from, { text: `⚠️ El archivo es muy pesado (${(stats.size / 1024 / 1024).toFixed(2)} MB).` });
                    } else {
                        await sock.sendMessage(from, { document: { url: foundPath }, fileName: path.basename(foundPath) });
                    }
                } else {
                    await sock.sendMessage(from, { text: `❌ No encontré ningún archivo llamado "${fileName}" en Documentos, Desktop o Descargas.` });
                }
                continue;
            }

            // 🎭 PERSONA SWITCH
            const personaKeys = Object.keys(settings.PERSONAS);
            if (personaKeys.includes(cleanText)) {
                currentUser.mode = cleanText;
                saveState();
                const aiText = text.replace(/^(or\s+|orion\s+)/i, '').trim();
                const persona = settings.PERSONAS[currentUser.mode] || settings.PERSONAS.orion;

                const historyEntry = { role: 'user', parts: [{ text: aiText }] };
                currentUser.history.push(historyEntry);
                if (currentUser.history.length > 20) currentUser.history = currentUser.history.slice(-20);

                try {
                    const response = await ai.generateResponse(aiText, currentUser.history, persona.prompt);
                    currentUser.history.push({ role: 'model', parts: [{ text: response }] });
                    saveState();
                    await sock.sendMessage(from, { text: response });
                } catch (e) {
                    await sock.sendMessage(from, { text: '⚠️ AI Error: ' + e.message });
                }
                continue;
            }

            // 🤖 AI RESPONSE (Trigger: or/orion)
            const hasTrigger = cleanText.startsWith('or ') || cleanText.startsWith('orion ');

            if (!hasTrigger) {
                continue;
            }

            let imageBuffer = null;
            if (msg.message.imageMessage) {
                try {
                    logger.info('📸 Downloading Image...');
                    imageBuffer = await downloadMediaMessage(
                        msg,
                        'buffer',
                        {},
                        {
                            logger: logger.child({ module: 'baileys' }),
                            reuploadRequest: sock.updateMediaMessage
                        }
                    );
                } catch (e) {
                    logger.error('Failed to download image: ' + e.message);
                }
            }

            const aiText = text.replace(/^(or\s+|orion\s+)/i, '').trim();
            const persona = settings.PERSONAS[currentUser.mode] || settings.PERSONAS.orion;

            const historyEntry = { role: 'user', parts: [{ text: aiText }] };
            if (imageBuffer) {
                historyEntry.parts.push({
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: 'image/jpeg'
                    }
                });
            }
            currentUser.history.push(historyEntry);
            if (currentUser.history.length > 20) currentUser.history = currentUser.history.slice(-20);

            try {
                const response = await ai.generateResponse(aiText || "Describe this image", currentUser.history, persona.prompt, imageBuffer);
                currentUser.history.push({ role: 'model', parts: [{ text: response }] });
                saveState();
                await sock.sendMessage(from, { text: response });
            } catch (e) {
                await sock.sendMessage(from, { text: '⚠️ AI Error: ' + e.message });
            }
        }
    });

    console.log('⚡ ORION CORE (vClean) - All Commands Loaded\n');
}

// 🚀 TELEGRAM BOT INIT - DISABLED (Now using Render Cloud)
// El bot de Telegram ahora corre en https://orion-cloud.onrender.com
// const telegramBot = require('./src/telegram/telegram-bot');
// telegramBot.initTelegramBot();

startOrion();
