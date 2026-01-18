const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function sendPreview() {
    console.log('🚀 Starting ORION Preview Sender...');
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
            const text = `🔍 **SEO & Preview Test**

Here is the updated ORION Tech link.
It should now display the **Open Graph** preview (Image + Title + Description).

👉 https://agem2024.github.io/SEGURITI-USC/orion-bots.html

*(Note: If the image doesn't appear immediately, it might be due to GitHub Pages cache. Give it 2-3 minutes).*`;

            const number = '16692342444@s.whatsapp.net';

            console.log('📤 Sending Preview to User...');
            try {
                await sock.sendMessage(number, { text: text });
                console.log('✅ Message sent to ' + number);
            } catch (e) {
                console.error('Error sending:', e);
            }

            setTimeout(() => {
                console.log('👋 Done.');
                process.exit(0);
            }, 3000);
        }
    });
}

sendPreview();
