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

// ⚠️🔴 WARNING: ESTE ES ORION CLEAN - NO JARVIS 🔴⚠️
// ⚠️🔴 El watcher, auto-encendido y control son para ORION CLEAN 🔴⚠️
// ⚠️🔴 JARVIS está ligado pero el bot activo es ORION CLEAN 🔴⚠️

// 📞 URLS FIREBASE (ACUTOR)
const MANUAL_URL = 'https://neon-agent-hub.web.app/jarvis_manual.html';
const NEKON_URL = 'https://neon-agent-hub.web.app/nekon_ai.html';

// 💰 PRICE BOOK URL
const PRICEBOOK_URL = 'https://agem2024.github.io/SEGURITI-USC/pricebook-index.html';

// 🤖 ORION BOTS URL
const ORIONBOTS_URL = 'https://agem2024.github.io/SEGURITI-USC/orion-bots.html';

// 🔗 ORION APPS (App Mode Links)
const ORION_APPS = [
    'https://ai.studio/apps/drive/1vikKncwaJRxWOANGeEcnchTAM96CqmnZ?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1bMGhzGDqLL_aDfnSC78Ie_HnsF7b691I?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1BKOJ2-29twcjdG1BooF6-Nh82VpXm6Hi?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1x_ibj0UepSYSNZyv6w83UQCk2GFTjJvG?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1BF2Sl5I48Zh843mnJQAo_mrQLLDUd48J?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1u71t_S_8Cp27aEuUcT0Sffws8tEVQ2pw?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1k_9YBvyIRIWIrSEZuIzoHRSH5Qauhpd_?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1NNlIz45X8Pr8waX5P5p90CHzJ5uJv2WN?fullscreenApplet=true'
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
                    ? `Eres XONA, asistente de ventas AI de ORION Tech (Bay Area, CA).

SERVICIOS ORION TECH - Automatización con IA:
INDIVIDUAL ($297-$497): Asistente WhatsApp personal para freelancers, coaches, influencers
STARTER ($997): Bot de servicio + menú + 500 convos/mes para pequeños negocios  
BUSINESS ($1,997): Sistema de reservas + analytics + 2000 convos + soporte 24/7
ENTERPRISE ($4,997+): IA conversacional, múltiples números, integraciones CRM

INDUSTRIAS: Restaurantes, salones de belleza, tiendas de licores, contratistas, retail

REGLAS:
- Máximo 3 oraciones por respuesta
- Si preguntan precio: "desde $X dependiendo de tus necesidades"
- Ofrece demo o llamada con el equipo
- NUNCA compartas datos de clientes
- WhatsApp: (669) 234-2444

Personalidad: Futurista, profesional, amigable. Usa: "optimizar tu negocio", "desplegar soluciones", "potenciado por IA".`
                    : `You are XONA, AI sales assistant for ORION Tech (Bay Area, CA).

ORION TECH SERVICES - AI Automation:
INDIVIDUAL ($297-$497): Personal WhatsApp assistant for freelancers, coaches, influencers
STARTER ($997): Service bot + menu + 500 convos/month for small businesses
BUSINESS ($1,997): Booking system + analytics + 2000 convos + 24/7 support  
ENTERPRISE ($4,997+): Conversational AI, multiple numbers, CRM integrations

INDUSTRIES: Restaurants, beauty salons, liquor stores, contractors, retail

RULES:
- Maximum 3 sentences per response
- If asked price: "starting from $X depending on your needs"
- Offer demo or call with the team
- NEVER share customer data
- WhatsApp: (669) 234-2444

Personality: Futuristic, professional, friendly. Use: "optimize your business", "deploy solutions", "AI-powered".`;

                const response = await ai.generateResponse(message, [], systemPrompt);
                res.json({ response, timestamp: new Date().toISOString() });
            } catch (e) {
                logger.error('Chat API error: ' + e.message);
                res.status(500).json({ error: 'AI temporarily unavailable' });
            }
        });

        // CORS preflight
        app.options('/api/chat', (req, res) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.sendStatus(200);
        });

        app.listen(3030, () => logger.info('🌐 Web Server running at http://localhost:3030'));
    } catch (e) { logger.error('Server error: ' + e.message); }

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: logger.child({ module: 'baileys', level: 'silent' }),
        browser: settings.WHATSAPP.BROWSER
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
            try {
                const QRCodeFile = require('qrcode');
                QRCodeFile.toFile('./qr.png', qr, { scale: 10 }, () => exec('start qr.png'));
            } catch (e) { }
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ?
                lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut : true;
            if (shouldReconnect) setTimeout(startOrion, 3000);
            else logger.error('⛔ Logged out. Delete auth_info to re-scan.');
        } else if (connection === 'open') {
            logger.info('✅ ORION CONNECTED AND ONLINE');

            // Start Antigravity Inbox Watcher
            setInterval(() => enviarMensajeAntigravity(sock), 5000); // Check every 5s
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
            if (['!apps', 'apps', '!links', 'links', 'orion apps'].includes(cleanText)) {
                let msg = '🔗 *ORION APP LINKS (Modo App)*\n\n';
                ORION_APPS.forEach((link, i) => {
                    msg += `*App ${i + 1}:*\n${link}\n\n`;
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
                await sock.sendMessage(from, { text: `❓ *AYUDA ORION*\n\n📖 *Comandos principales:*\n• acutor - Manual completo\n• pb - Price Book v6.0 PRO 💰\n• menu - Ver todos los comandos\n• di [texto] - Texto a voz\n• busca [tema] - Google\n• descargar video [url] - YouTube\n• descargar audio [url] - MP3\n• enviar a [num] diciendo [msg]\n• or [mensaje] - Chat con IA\n\n📱 WhatsApp: +1(669) 234-2444` });
                continue;
            }

            // MENU
            if (cleanText === 'menu' || cleanText === '!menu') {
                const list = Object.keys(settings.PERSONAS).map(k => `• *${k.toUpperCase()}*: ${settings.PERSONAS[k].name}`).join('\n');
                await sock.sendMessage(from, { text: `🌌 *ORION SYSTEMS*\n\nCurrent Mode: *${currentUser.mode.toUpperCase()}*\n\nPersonas:\n${list}\n\n🔧 *COMANDOS:*\n• !acutor - Manual\n• !pb - Price Book 💰\n• !links - Orion Apps 🔗\n• !say <texto> - Voz\n• !yt <url> - YouTube\n• !search <query> - Buscar\n• !cal - Calendario\n• !captura - Screenshot\n• !qr <texto> - QR\n• !noticias - News\n• !portapapeles - Clipboard\n• !memoria <query> - Buscar memoria\n• !recuerda <x> es <y> - Guardar\n• !contactos - Agenda\n• !ag <tarea> - Antigravity\n• !tareas - Ver tareas\n• !estado - Sistema\n\n_Escribe un nombre de persona para cambiar modo._` });
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
