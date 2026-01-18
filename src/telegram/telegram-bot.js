/**
 * 🤖 ORION TELEGRAM BOT - CLEAN VERSION
 * Comandos: IA, Voz, Profesional, Productividad, Multimedia, Memoria, Accesos, Modos
 * SIN control de PC
 */

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 🛠️ UTILS & CORE
const logger = require('../utils/logger');
const settings = require('../config/settings');
const googleTTS = require('google-tts-api');

let ai;
try { ai = require('../core/ai'); } catch (e) { console.error('⚠️ Core AI module missing'); }

let calendarApp;
try { calendarApp = require('../apps/calendar'); } catch (e) { console.error('⚠️ Calendar module missing'); }

// 📱 ORION APPS (Safe Import)
let youtubeApp, professional, memoria, searchApp, extras;
try { youtubeApp = require('../apps/youtube'); console.log('✅ YT Loaded'); } catch (e) { console.log('⚠️ YT Missing'); }
try { professional = require('../apps/professional'); console.log('✅ Pro Loaded'); } catch (e) { console.log('⚠️ Pro Missing'); }
try { memoria = require('../apps/memoria'); console.log('✅ Mem Loaded'); } catch (e) { console.log('⚠️ Mem Missing'); }
try { searchApp = require('../apps/search'); console.log('✅ Search Loaded'); } catch (e) { console.log('⚠️ Search Missing'); }
try { extras = require('../apps/extras'); console.log('✅ Extras Loaded'); } catch (e) { console.log('⚠️ Extras Missing'); }

// 🆕 NEW AI TOOLS
let serper, scraper, freeai;
try { serper = require('../apps/serper'); console.log('✅ Serper Loaded'); } catch (e) { console.log('⚠️ Serper Missing'); }
try { scraper = require('../apps/scraper'); console.log('✅ Scraper Loaded'); } catch (e) { console.log('⚠️ Scraper Missing'); }
try { freeai = require('../apps/freeai'); console.log('✅ FreeAI Loaded'); } catch (e) { console.log('⚠️ FreeAI Missing'); }

// 📂 DATA FILES
const TAREAS_FILE = path.join(__dirname, '../../tareas_antigravity.json');
const CONTACTOS_FILE = path.join(__dirname, '../../contactos.json');

// 🔑 CONFIG
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_ID = Number(process.env.TELEGRAM_OWNER_ID) || settings.TELEGRAM_OWNER_ID || 5989183300;

// 🔗 LINKS CONSTANTS
const MANUAL_URL = 'https://neon-agent-hub.web.app/jarvis_manual.html';
const PRICEBOOK_URL = 'https://agem2024.github.io/SEGURITI-USC/docs/pricebook.html';
const ORIONBOTS_URL = 'https://agem2024.github.io/SEGURITI-USC/docs/orion-bots.html';
const ORION_APPS = [
    'https://ai.studio/apps/drive/1vikKncwaJRxWOANGeEcnchTAM96CqmnZ?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1bMGhzGDqLL_aDfnSC78Ie_HnsF7b691I?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1BKOJ2-29twcjdG1BooF6-Nh82VpXm6Hi?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1x_ibj0UepSYSNZyv6w83UQCk2GFTjJvG?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1BF2Sl5I48Zh843mnJQAo_mrQLLDUd48J?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1u71t_S_8Cp27aEuUcT0Sffws8tEVQ2pw?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1k_9YBvyIRIWIrSEZuIzoHRSH5Qauhpd_?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1NNlIz45X8Pr8waX5P5p90CHzJ5uJv2WN?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1qqUcvHx_KD94VplUFjDxAiAl84Ji1jt7?fullscreenApplet=true',
    'https://ai.studio/apps/drive/1tFuWAILHDMavaoM033YMbnjlS8Ww6FVK?fullscreenApplet=true'
];

let bot = null;
const userState = new Map();

// 💾 HELPERS JSON
function cargarTareas() { try { return JSON.parse(fs.readFileSync(TAREAS_FILE, 'utf8')); } catch (e) { return []; } }
function guardarTareas(t) { fs.writeFileSync(TAREAS_FILE, JSON.stringify(t, null, 2)); }
function cargarContactos() { try { return JSON.parse(fs.readFileSync(CONTACTOS_FILE, 'utf8')); } catch (e) { return {}; } }

// 🔒 Check Authorization
function checkAuth(msg) {
    const id = msg.from?.id || msg.chat.id;
    if (id !== OWNER_ID) {
        console.warn(`[TG AUTH] ⛔ Denied: ${id} (Expected: ${OWNER_ID})`);
        return false;
    }
    return true;
}

/**
 * Initialize Telegram Bot
 */
function initTelegramBot() {
    console.log('⚡ [TG INIT] Initializing...');
    if (!TELEGRAM_TOKEN) {
        console.error('❌ [TG FATAL] Token missing in .env');
        return null;
    }

    try {
        bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

        bot.on('polling_error', (error) => {
            if (error.code === 'ETELEGRAM' && error.message.includes('401')) {
                console.error('❌ TG TOKEN 401 DENIED. Stopping.');
                bot.stopPolling();
            }
        });

        // ==========================================
        // 📋 COMANDO /start - MENÚ PRINCIPAL
        // ==========================================
        bot.onText(/\/start/, (msg) => {
            if (!checkAuth(msg)) return;
            bot.sendMessage(msg.chat.id, `🚀 *ORION TELEGRAM v2.1*

📋 *COMANDOS DISPONIBLES:*

*🧠 IA & Voz:*
/say <texto> - Texto a voz (TTS)
/orvoz <texto> - IA responde + voz
/tr <texto> a <idioma> - Traducir

*🆕 AI Tools:*
/buscar <q> - Google Search
/scrape <url> - Leer página web
/groq <q> - AI gratis (Groq)

*📱 Mensajes:*
/enviar <num> <msg> - Enviar WhatsApp

*💼 Profesional:*
/cv, /tj, /skills, /landing, /apps

*🚀 Productividad:*
/ag <tarea> - Nueva tarea
/tareas - Ver pendientes
/cal - Calendario

*📹 Multimedia:*
/yt <url> - Descargar video
/qr <texto> - Generar QR

*🔗 Accesos:*
/pb - Price Book
/acutor - Manual
/otp - Orion Bots
/links - Orion Apps

*🎭 Modos:*
/mode <nombre> - Cambiar persona
/reset - Reiniciar sesión`, { parse_mode: 'Markdown' });
        });

        // ==========================================
        // 🧠 INTELIGENCIA ARTIFICIAL & VOZ
        // ==========================================

        // /say - Text to Speech
        bot.onText(/\/(say|di) (.+)/, async (msg, match) => {
            if (!checkAuth(msg)) return;
            try {
                const url = googleTTS.getAudioUrl(match[2], { lang: 'es', slow: false, host: 'https://translate.google.com' });
                await bot.sendVoice(msg.chat.id, url);
            } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error TTS: ' + e.message); }
        });

        // /orvoz - AI + Voice Response
        bot.onText(/\/orvoz (.+)/, async (msg, match) => {
            if (!checkAuth(msg)) return;
            const query = match[1];
            bot.sendChatAction(msg.chat.id, 'record_voice');

            let state = userState.get(msg.chat.id) || { mode: 'orion', history: [] };
            const persona = settings.PERSONAS?.[state.mode] || settings.PERSONAS?.orion || { prompt: 'You are ORION.' };

            try {
                const response = await ai.generateResponse(query, state.history, persona.prompt);
                state.history.push({ role: 'user', parts: [{ text: query }] });
                state.history.push({ role: 'model', parts: [{ text: response }] });
                if (state.history.length > 20) state.history = state.history.slice(-20);
                userState.set(msg.chat.id, state);

                await bot.sendMessage(msg.chat.id, `🤖 ${response}`);
                const url = googleTTS.getAudioUrl(response.substring(0, 200), { lang: 'es', slow: false, host: 'https://translate.google.com' });
                await bot.sendVoice(msg.chat.id, url);
            } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error AI/Voz: ' + e.message); }
        });

        // /tr - Traducir
        bot.onText(/\/tr (.+) a (.+)/, async (msg, match) => {
            if (!checkAuth(msg)) return;
            const texto = match[1];
            const idioma = match[2];
            try {
                const res = await ai.generateResponse(`Translate "${texto}" to ${idioma}. Return only the translation.`, [], 'Translator');
                bot.sendMessage(msg.chat.id, `🌐 *${idioma.toUpperCase()}:* ${res}`, { parse_mode: 'Markdown' });
            } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error traducción'); }
        });

        // ==========================================
        // 💼 PROFESIONAL & VENTAS
        // ==========================================
        if (professional) {
            bot.onText(/\/(cv|tj|propuesta|skills|landing|apps|hub|list)/, (msg, match) => {
                if (!checkAuth(msg)) return;
                const res = professional.handleProfessionalCommand(match[1]);
                if (res) bot.sendMessage(msg.chat.id, res, { parse_mode: 'Markdown' });
            });
        }

        // ==========================================
        // 🚀 PRODUCTIVIDAD (Antigravity & Calendar)
        // ==========================================

        // /ag - Nueva tarea
        bot.onText(/\/(ag|tarea) (.+)/, (msg, match) => {
            if (!checkAuth(msg)) return;
            const tarea = match[2];
            const tareas = cargarTareas();
            tareas.push({ id: Date.now(), tarea, estado: 'pendiente', fecha: new Date().toISOString(), from: 'Telegram' });
            guardarTareas(tareas);
            bot.sendMessage(msg.chat.id, `🚀 *Antigravity*: Tarea guardada.\n"${tarea}"`, { parse_mode: 'Markdown' });
        });

        // /tareas - Listar pendientes
        bot.onText(/\/tareas/, (msg) => {
            if (!checkAuth(msg)) return;
            const pendientes = cargarTareas().filter(t => t.estado === 'pendiente');
            if (pendientes.length === 0) return bot.sendMessage(msg.chat.id, '🚀 No hay tareas pendientes.');
            let txt = '🚀 *TAREAS PENDIENTES*\n\n';
            pendientes.slice(-15).forEach((t, i) => txt += `${i + 1}. ${t.tarea}\n`);
            bot.sendMessage(msg.chat.id, txt, { parse_mode: 'Markdown' });
        });

        // /cal - Calendario
        if (calendarApp) {
            bot.onText(/\/(cal|citas|agenda)/, async (msg) => {
                if (!checkAuth(msg)) return;
                try {
                    const reporte = await calendarApp.generarReporteManana();
                    bot.sendMessage(msg.chat.id, reporte, { parse_mode: 'Markdown' });
                } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error Calendar'); }
            });
        }

        // /contactos - Agenda
        bot.onText(/\/contactos/, (msg) => {
            if (!checkAuth(msg)) return;
            const agenda = cargarContactos();
            let txt = '📞 *AGENDA CONTACTOS*\n\n';
            for (const [cat, contacts] of Object.entries(agenda)) {
                const list = Object.entries(contacts);
                if (list.length > 0) {
                    txt += `*${cat.toUpperCase()}*\n`;
                    list.forEach(([k, c]) => txt += `• ${c.nombre || k}: ${c.telefono}\n`);
                    txt += '\n';
                }
            }
            bot.sendMessage(msg.chat.id, txt.substring(0, 4000) || 'Agenda vacía.', { parse_mode: 'Markdown' });
        });

        // ==========================================
        // 📹 MULTIMEDIA
        // ==========================================

        // /yt - YouTube Download
        if (youtubeApp) {
            bot.onText(/\/yt (.+)/, async (msg, match) => {
                if (!checkAuth(msg)) return;
                bot.sendMessage(msg.chat.id, '⏳ Descargando...');
                try {
                    const f = await youtubeApp.descargarVideo(match[1], 'video');
                    bot.sendMessage(msg.chat.id, `✅ Descargado: ${f}`);
                } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error YT: ' + e.message); }
            });
        }

        // /qr - Generar QR
        if (extras) {
            bot.onText(/\/qr (.+)/, async (msg, match) => {
                if (!checkAuth(msg)) return;
                try {
                    const qrPath = await extras.generarQR(match[1]);
                    await bot.sendPhoto(msg.chat.id, qrPath);
                    setTimeout(() => fs.unlinkSync(qrPath), 5000);
                } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error QR: ' + e.message); }
            });

            // /noticias
            bot.onText(/\/noticias/, async (msg) => {
                if (!checkAuth(msg)) return;
                try {
                    const news = await extras.obtenerNoticias();
                    bot.sendMessage(msg.chat.id, news, { parse_mode: 'Markdown', disable_web_page_preview: true });
                } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error Noticias'); }
            });
        }

        // ==========================================
        // 🔍 MEMORIA & BÚSQUEDA
        // ==========================================

        // /search
        if (searchApp) {
            bot.onText(/\/search (.+)/, async (msg, match) => {
                if (!checkAuth(msg)) return;
                bot.sendMessage(msg.chat.id, '🔍 Buscando...');
                try {
                    const results = await searchApp.buscarWeb(match[1]);
                    const txt = results.slice(0, 3).map(r => `*${r.title}*\n${r.link}`).join('\n\n');
                    bot.sendMessage(msg.chat.id, txt || 'Sin resultados', { parse_mode: 'Markdown' });
                } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error search'); }
            });
        }

        // /recuerda y /memoria
        if (memoria) {
            bot.onText(/\/recuerda (.+) es (.+)/, (msg, match) => {
                if (!checkAuth(msg)) return;
                memoria.guardar('general', match[1], match[2]);
                bot.sendMessage(msg.chat.id, '🧠 Guardado.');
            });
            bot.onText(/\/memoria (.+)/, (msg, match) => {
                if (!checkAuth(msg)) return;
                const res = memoria.buscar(match[1]);
                bot.sendMessage(msg.chat.id, res.length ? JSON.stringify(res, null, 2) : '🧠 Nada encontrado.');
            });
        }

        // ==========================================
        // 🆕 AI TOOLS (Serper, Scraper, FreeAI)
        // ==========================================

        // /buscar - Google Search (Serper) - JHON ONLY
        if (serper) {
            bot.onText(/\/(buscar|google) (.+)/, async (msg, match) => {
                if (!checkAuth(msg)) return;
                const state = userState.get(msg.chat.id);
                if (!state || state.mode !== 'jhon') return bot.sendMessage(msg.chat.id, '🚫 Función exclusiva de *JHON*.\nUsa `/mode jhon`', { parse_mode: 'Markdown' });

                bot.sendMessage(msg.chat.id, '🔍 Buscando en Google...');
                try {
                    const results = await serper.searchGoogle(match[2], 5);
                    if (results.length === 0) {
                        bot.sendMessage(msg.chat.id, '❌ Sin resultados.');
                    } else {
                        let txt = `🔍 *Resultados (JHON):*\n\n`;
                        results.forEach((r, i) => txt += `*${i + 1}. ${r.title}*\n${r.snippet}\n🔗 ${r.link}\n\n`);
                        bot.sendMessage(msg.chat.id, txt.substring(0, 4000), { parse_mode: 'Markdown' });
                    }
                } catch (e) {
                    bot.sendMessage(msg.chat.id, `❌ Error: ${e.message}\n💡 Configura SERPER_API_KEY`);
                }
            });
        }

        // /scrape - Web Scraping - JHON ONLY
        if (scraper) {
            bot.onText(/\/(scrape|leer) (.+)/, async (msg, match) => {
                if (!checkAuth(msg)) return;
                const state = userState.get(msg.chat.id);
                if (!state || state.mode !== 'jhon') return bot.sendMessage(msg.chat.id, '🚫 Función exclusiva de *JHON*.\nUsa `/mode jhon`', { parse_mode: 'Markdown' });

                const url = match[2];
                if (!url.startsWith('http')) {
                    bot.sendMessage(msg.chat.id, '⚠️ Usa: /scrape https://...');
                    return;
                }
                bot.sendMessage(msg.chat.id, '🕷️ Extrayendo contenido...');
                try {
                    const result = await scraper.scrapeUrl(url);
                    if (result.success) {
                        const txt = `🕷️ *${result.title}*\n\n${result.content.substring(0, 3000)}...`;
                        bot.sendMessage(msg.chat.id, txt, { parse_mode: 'Markdown' });
                    } else {
                        bot.sendMessage(msg.chat.id, `❌ Error: ${result.error}`);
                    }
                } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error scraping'); }
            });
        }

        // /groq - Free AI (Groq/OpenRouter) - JHON ONLY
        if (freeai) {
            bot.onText(/\/(groq|free) (.+)/, async (msg, match) => {
                if (!checkAuth(msg)) return;
                const state = userState.get(msg.chat.id);
                if (!state || state.mode !== 'jhon') return bot.sendMessage(msg.chat.id, '🚫 Función exclusiva de *JHON*.\nUsa `/mode jhon`', { parse_mode: 'Markdown' });

                bot.sendChatAction(msg.chat.id, 'typing');
                try {
                    const result = await freeai.queryFreeAI(match[2]);
                    bot.sendMessage(msg.chat.id, `🤖 *${result.provider}:*\n\n${result.response}`, { parse_mode: 'Markdown' });
                } catch (e) {
                    bot.sendMessage(msg.chat.id, `❌ Error: ${e.message}\n💡 Configura GROQ_API_KEY`);
                }
            });
        }

        // /img - Generar Imagen (JHON ONLY / DALL-E 3)
        bot.onText(/\/(img|pintar|draw) (.+)/, async (msg, match) => {
            if (!checkAuth(msg)) return;
            const state = userState.get(msg.chat.id);
            if (!state || state.mode !== 'jhon') return bot.sendMessage(msg.chat.id, '🚫 Función exclusiva de *JHON*.\nUsa `/mode jhon`', { parse_mode: 'Markdown' });

            const prompt = match[2];
            bot.sendChatAction(msg.chat.id, 'upload_photo');
            bot.sendMessage(msg.chat.id, '🎨 Generando arte con DALL-E 3...');

            try {
                const imageUrl = await ai.generateImage(prompt);
                if (imageUrl) {
                    await bot.sendPhoto(msg.chat.id, imageUrl, { caption: `🎨 "${prompt}"\n🧠 Generated by JHON (DALL-E 3)` });
                } else {
                    bot.sendMessage(msg.chat.id, '❌ Error generando imagen.');
                }
            } catch (e) {
                bot.sendMessage(msg.chat.id, `❌ Error: ${e.message}`);
            }
        });

        // ==========================================
        // 📱 ENVIAR MENSAJE WHATSAPP (Via Inbox)
        // ==========================================
        bot.onText(/\/(enviar|msg|send) (\+?\d+) (.+)/s, async (msg, match) => {
            if (!checkAuth(msg)) return;
            const numero = match[2].replace(/^\+/, ''); // Remove + if present
            const mensaje = match[3].trim();

            // Add to antigravity inbox for ORION WhatsApp to send
            const ANTIGRAVITY_INBOX = path.join(__dirname, '../../antigravity_inbox.json');
            try {
                let inbox = [];
                if (fs.existsSync(ANTIGRAVITY_INBOX)) {
                    inbox = JSON.parse(fs.readFileSync(ANTIGRAVITY_INBOX, 'utf8'));
                }
                inbox.unshift({
                    to: numero,
                    mensaje: mensaje,
                    enviado: false,
                    from: 'Telegram'
                });
                fs.writeFileSync(ANTIGRAVITY_INBOX, JSON.stringify(inbox, null, 2));
                bot.sendMessage(msg.chat.id, `✅ *Mensaje en cola*\n\n📱 A: +${numero}\n💬 ${mensaje.substring(0, 100)}${mensaje.length > 100 ? '...' : ''}\n\n_ORION WhatsApp lo enviará en segundos._`, { parse_mode: 'Markdown' });
                logger.info(`📤 [TG->WA] Message queued for ${numero}`);
            } catch (e) {
                bot.sendMessage(msg.chat.id, `❌ Error: ${e.message}`);
            }
        });

        // ==========================================
        // 🔗 ACCESOS DIRECTOS
        // ==========================================
        bot.onText(/\/(pb|pricebook)/, (msg) => {
            if (!checkAuth(msg)) return;
            bot.sendMessage(msg.chat.id, `💰 *Price Book v6.0*\n${PRICEBOOK_URL}`, { parse_mode: 'Markdown' });
        });
        bot.onText(/\/(acutor|manual)/, (msg) => {
            if (!checkAuth(msg)) return;
            bot.sendMessage(msg.chat.id, `📖 *Manual Orion*\n${MANUAL_URL}`, { parse_mode: 'Markdown' });
        });
        bot.onText(/\/(otp|orionbots)/, (msg) => {
            if (!checkAuth(msg)) return;
            bot.sendMessage(msg.chat.id, `🤖 *Orion Bots*\n${ORIONBOTS_URL}`, { parse_mode: 'Markdown' });
        });
        bot.onText(/\/links/, (msg) => {
            if (!checkAuth(msg)) return;
            const txt = ORION_APPS.map((l, i) => `App ${i + 1}: ${l}`).join('\n');
            bot.sendMessage(msg.chat.id, `🔗 *Orion Apps*\n${txt}`, { parse_mode: 'Markdown' });
        });

        // ==========================================
        // 🎭 GESTIÓN DE MODOS (PERSONAS)
        // ==========================================
        bot.onText(/\/menu/, (msg) => {
            if (!checkAuth(msg)) return;
            const modes = Object.keys(settings.PERSONAS || {}).join(', ').toUpperCase() || 'ORION';
            bot.sendMessage(msg.chat.id, `🎭 *MODOS DISPONIBLES*\n${modes}\n\nUsa /mode <nombre> para cambiar.`, { parse_mode: 'Markdown' });
        });

        bot.onText(/\/mode (.+)/, (msg, match) => {
            if (!checkAuth(msg)) return;
            const newMode = match[1].toLowerCase();
            if (settings.PERSONAS?.[newMode]) {
                let state = userState.get(msg.chat.id) || { history: [] };
                state.mode = newMode;
                userState.set(msg.chat.id, state);
                bot.sendMessage(msg.chat.id, `✅ Modo: *${newMode.toUpperCase()}*`, { parse_mode: 'Markdown' });
            } else {
                bot.sendMessage(msg.chat.id, '❌ Modo no encontrado. Usa /menu');
            }
        });

        bot.onText(/\/reset/, (msg) => {
            if (!checkAuth(msg)) return;
            userState.set(msg.chat.id, { mode: 'orion', history: [] });
            bot.sendMessage(msg.chat.id, '🔄 Sesión reiniciada.');
        });

        // ==========================================
        // 💬 MENSAJES GENERALES (Chat IA)
        // ==========================================
        bot.on('message', async (msg) => {
            if (!msg.text || msg.text.startsWith('/')) return;
            if (!checkAuth(msg)) return;

            let state = userState.get(msg.chat.id) || { mode: 'orion', history: [] };
            const persona = settings.PERSONAS?.[state.mode] || settings.PERSONAS?.orion || { prompt: 'You are ORION.' };

            try {
                bot.sendChatAction(msg.chat.id, 'typing');
                state.history.push({ role: 'user', parts: [{ text: msg.text }] });
                if (state.history.length > 20) state.history = state.history.slice(-20);

                const response = await ai.generateResponse(msg.text, state.history, persona.prompt);
                state.history.push({ role: 'model', parts: [{ text: response }] });
                userState.set(msg.chat.id, state);

                bot.sendMessage(msg.chat.id, response);
            } catch (e) { console.error('TG Chat Error:', e.message); }
        });

        // ==========================================
        // 🎤 MENSAJES DE VOZ (Transcripción)
        // ==========================================
        bot.on('voice', async (msg) => {
            if (!checkAuth(msg)) return;
            bot.sendMessage(msg.chat.id, '🎤 Transcribiendo...');
            try {
                const axios = require('axios');
                const fileLink = await bot.getFileLink(msg.voice.file_id);
                const audioBuffer = (await axios.get(fileLink, { responseType: 'arraybuffer' })).data;
                const transcription = await ai.generateResponse('Transcribe this audio. Return ONLY the text.', [], 'Transcriber', audioBuffer);
                bot.sendMessage(msg.chat.id, `🎤 *Transcripción:*\n${transcription}`, { parse_mode: 'Markdown' });
            } catch (e) { bot.sendMessage(msg.chat.id, '❌ Error transcribiendo.'); }
        });

        console.log(`✅ [TG INIT] SUCCESS. Owner ID: ${OWNER_ID}`);
        return bot;
    } catch (e) {
        console.error('❌ [TG INIT] CRASH: ' + e.message);
        return null;
    }
}

module.exports = { initTelegramBot, bot };
