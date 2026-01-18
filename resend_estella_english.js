const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function sendEnglish() {
    console.log('🚀 Sending Estella Message (English)...');
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }) });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {

            const link = "https://agem2024.github.io/SEGURITI-USC/proposals/new-millennium/propuesta_orion_new_millennium.html";

            const text = `Hi Estella, Alex here from ORION Tech. 👋\n\nJust wanted to share the full Digital Proposal we designed for *New Millennium Interiors*.\n\nIt’s built to automate your quote process and capture every missed call, so you can focus 100% on restoration.\n\n👉 *View Proposal:* ${link}\n\nIncludes a live demo with "Mike", your new AI Assistant.\n\nLet me know what you think!`;

            const number = '16692342444@s.whatsapp.net';

            try {
                // Send text. Baileys should preview the link.
                await sock.sendMessage(number, { text: text });
                console.log('📤 English message sent!');
            } catch (e) { console.error(e); }

            setTimeout(() => process.exit(0), 4000);
        }
    });
}
sendEnglish();
