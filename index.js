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

// 🔌 APPS
const youtubeApp = require('./src/apps/youtube');
const searchApp = require('./src/apps/search');
const calendarApp = require('./src/apps/calendar');
const extras = require('./src/apps/extras');
const memoria = require('./src/apps/memoria');
const i601a = require('./src/apps/i601a-commands');
const professional = require('./src/apps/professional');

// 📞 URLS FIREBASE (ACUTOR)
const MANUAL_URL = 'https://neon-agent-hub.web.app/jarvis_manual.html';
const NEKON_URL = 'https://neon-agent-hub.web.app/nekon_ai.html';

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
        app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/manual.html')));
        app.get('/manual', (req, res) => res.sendFile(path.join(__dirname, 'public/manual.html')));
        app.get('/manual.html', (req, res) => res.sendFile(path.join(__dirname, 'public/manual.html')));
        app.get('/landing', (req, res) => res.sendFile(path.join(__dirname, 'public/landing.html')));

        // Static files (images, etc)
        app.use(express.static(path.join(__dirname, 'public')));

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
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message) continue;

            const from = msg.key.remoteJid;
            const isMe = msg.key.fromMe;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

            // 🛑 ONLY PROCESS MESSAGES SENT BY USER (ignore incoming from others)
            if (!isMe) continue;

            logger.info(`📩 Msg from ${from}: ${text}`);

            if (!userState.has(from)) {
                userState.set(from, { mode: 'orion', history: [] });
                saveState();
            }
            const currentUser = userState.get(from);
            const cleanText = text.trim().toLowerCase();

            // 📖 ACUTOR - MANUAL (FIREBASE URL)
            if (cleanText === 'acutor' || cleanText === '!acutor' || cleanText === 'manual') {
                await sock.sendMessage(from, { text: `📖 *MANUAL J.A.R.V.I.S. v5.3*\n\n🌍 *Acceso Global (Firebase):*\n${MANUAL_URL}\n\n✅ Link Público.\n💡 Guárdalo en favoritos.` });
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
                await sock.sendMessage(from, { text: `✅ *Landing Page neKon AI*\n\n🌐 ${NEKON_URL}\n\n📱 WhatsApp: +1 (669) 234-2444\n📧 Email: jarvisasistente47@gmail.com\n\n💡 Accesible Globalmente` });
                continue;
            }

            // 🗣️ VOZ TTS
            if (cleanText.startsWith('!say ') || cleanText.startsWith('di ')) {
                const phrase = text.replace(/^(!say|di)\s+/i, '');
                try {
                    const url = googleTTS.getAudioUrl(phrase, { lang: 'es', slow: false, host: 'https://translate.google.com' });
                    await sock.sendMessage(from, { audio: { url: url }, mimetype: 'audio/mp4', ptt: true });
                } catch (e) { await sock.sendMessage(from, { text: '❌ Voice Error: ' + e.message }); }
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
                await sock.sendMessage(from, { text: `❓ *AYUDA ORION*\n\n📖 *Comandos principales:*\n• acutor - Manual completo\n• menu - Ver todos los comandos\n• di [texto] - Texto a voz\n• busca [tema] - Google\n• descargar video [url] - YouTube\n• descargar audio [url] - MP3\n• enviar a [num] diciendo [msg]\n• or [mensaje] - Chat con IA\n\n📱 WhatsApp: +1 (669) 234-2444` });
                continue;
            }

            // MENU
            if (cleanText === 'menu' || cleanText === '!menu') {
                const list = Object.keys(settings.PERSONAS).map(k => `• *${k.toUpperCase()}*: ${settings.PERSONAS[k].name}`).join('\n');
                await sock.sendMessage(from, { text: `🌌 *ORION SYSTEMS*\n\nCurrent Mode: *${currentUser.mode.toUpperCase()}*\n\nPersonas:\n${list}\n\n🔧 *COMANDOS:*\n• !acutor - Manual\n• !links - Orion Apps 🔗\n• !say <texto> - Voz\n• !yt <url> - YouTube\n• !search <query> - Buscar\n• !cal - Calendario\n• !captura - Screenshot\n• !qr <texto> - QR\n• !noticias - News\n• !portapapeles - Clipboard\n• !memoria <query> - Buscar memoria\n• !recuerda <x> es <y> - Guardar\n• !contactos - Agenda\n• !ag <tarea> - Antigravity\n• !tareas - Ver tareas\n• !estado - Sistema\n\n_Escribe un nombre de persona para cambiar modo._` });
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

            // 🎭 PERSONA SWITCH
            const personaKeys = Object.keys(settings.PERSONAS);
            if (personaKeys.includes(cleanText)) {
                currentUser.mode = cleanText;
                saveState();
                if (!hasTrigger) {
                    // No trigger - ignore message (don't consume API)
                    logger.info('📭 No trigger word - ignoring message');
                    continue;
                }

                // 📸 VISION HANDLING
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

                // Remove trigger word from text for AI processing
                const aiText = text.replace(/^(or\s+|orion\s+)/i, '').trim();

                const persona = settings.PERSONAS[currentUser.mode] || settings.PERSONAS.orion;

                // Log history
                const historyEntry = { role: 'user', parts: [{ text: aiText }] };
                if (imageBuffer) {
                    historyEntry.parts.push({
                        inlineData: {
                            data: imageBuffer.toString('base64'),
                            mimeType: 'image/jpeg'
                        }
                    });
                }
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

                // 🎭 PERSONA SWITCH
                const personaKeys = Object.keys(settings.PERSONAS);
                if (personaKeys.includes(cleanText)) {
                    currentUser.mode = cleanText;
                    saveState();
                    if (!hasTrigger) {
                        // No trigger - ignore message (don't consume API)
                        logger.info('📭 No trigger word - ignoring message');
                        continue;
                    }

                    // 📸 VISION HANDLING
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

                    // Remove trigger word from text for AI processing
                    const aiText = text.replace(/^(or\s+|orion\s+)/i, '').trim();

                    const persona = settings.PERSONAS[currentUser.mode] || settings.PERSONAS.orion;

                    // Log history
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
                        // Pass imageBuffer to generateResponse
                        const response = await ai.generateResponse(aiText || "Describe this image", currentUser.history, persona.prompt, imageBuffer);
                        currentUser.history.push({ role: 'model', parts: [{ text: response }] });
                        saveState();
                        await sock.sendMessage(from, { text: response });
                    } catch (e) {
                        await sock.sendMessage(from, { text: '⚠️ AI Error: ' + e.message });
                    }
                }
            }
        });

    // Start the socket
    console.log('⚡ ORION CORE (vClean) - All Commands Loaded\n');
}

startOrion();
