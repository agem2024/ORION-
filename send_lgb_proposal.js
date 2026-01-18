const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function sendProposal() {
    console.log('🚀 Starting Sender...');
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ Connected to WhatsApp!');

            // Message content
            const text = `**Successful Update (LGB Autowork)**

The proposal for **LGB Autowork (San Jose)** with **JOSE (Shark Mode)** has been deployed and is live.

🔗 **Production Link:**
https://agem2024.github.io/SEGURITI-USC/proposals/napa%20auto%20care%20foxworthy/propuesta_orion_lgb_autowork.html

**Summary:**
1.  **Updated HTML:** Points to cloud scripts.
2.  **Jose AI:** Sales logic optimized for Auto Care, English language.
3.  **Deployment:** Live on GitHub Pages.`;

            // User's number
            const number = '16692342444@s.whatsapp.net';

            try {
                await sock.sendMessage(number, { text: text });
                console.log('📤 Message sent to ' + number);
            } catch (e) {
                console.error('Error sending:', e);
            }

            // Wait a bit to ensure flush then exit
            setTimeout(() => {
                console.log('👋 Done.');
                process.exit(0);
            }, 2000);
        }
    });
}

sendProposal();
