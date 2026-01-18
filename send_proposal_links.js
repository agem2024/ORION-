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
            const text = `**🤖 ORION MASTER LIST (All Proposals)**

Here are the direct links to ALL active proposals, including Auto/Plumbing.

⭐ **FEATURED (Verified Assets)**
🏛️ **Alcaldía de Obando:** https://agem2024.github.io/SEGURITI-USC/proposals/obando/propuesta_orion_alcaldia_obando.html
🛋️ **New Millennium:** https://agem2024.github.io/SEGURITI-USC/proposals/new-millennium/propuesta_orion_new_millennium.html
🤵 **Diego Ortiz:** https://agem2024.github.io/SEGURITI-USC/proposals/diego-ortiz-personal/propuesta_orion_diego_ortiz.html
✨ **Munjela Glow:** https://agem2024.github.io/SEGURITI-USC/proposals/mungela%20glow/propuesta_orion_munjela_v2.html

🔧 **PLUMBING & AUTO (Standard Template)**
🚽 **Gogo Rooter:** https://agem2024.github.io/SEGURITI-USC/proposals/gogo-rooter.html
🔧 **Mike Counsil Plumbing:** https://agem2024.github.io/SEGURITI-USC/proposals/mike-counsil.html
🚗 **Reliable Auto:** https://agem2024.github.io/SEGURITI-USC/proposals/reliable-auto.html
🚗 **Capitol Auto:** https://agem2024.github.io/SEGURITI-USC/proposals/capitol-auto.html
🚙 **LGB Autowork:** https://agem2024.github.io/SEGURITI-USC/proposals/lgb-autowork.html
🛠️ **Quality Tuneup:** https://agem2024.github.io/SEGURITI-USC/proposals/quality-tuneup.html
🏢 **Crown Force:** https://agem2024.github.io/SEGURITI-USC/proposals/crown.html

_Note: The Featured list has full AI asset customization. The Mechanical/Plumbing list uses the robust standard engine._`;

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
            }, 6000);
        }
        else if (connection === 'close') {
            // console.log('❌ Connection closed.');
        }
    });
}

sendProposal();
