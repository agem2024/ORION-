const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function sendProposal() {
    console.log('🚀 Starting Sender for Munjela Glow...');
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
            const text = `🎉 **Happy New Year 2026, Endi!** 🎉

I hope this year brings amazing growth and success to **Mungela Glow**! 🥂 To kick things off, I’ve prepared a special proposal to help you automate your salon, capture more appointments, and take your customer experience to the next level with AI.

Here is your exclusive AI Automation Proposal:
👉 **Mungela Glow - AI Transformation Proposal**
https://agem2024.github.io/SEGURITI-USC/proposals/mungela%20glow/propuesta_orion_munjela_v2.html

**What's inside?**
✅ **Elisa AI Assistant:** 24/7 Booking & bilingual support.
✅ **Automated Follow-ups:** Reduce no-shows & increase retention.
✅ **Smart Calendar:** Seamless integration with your schedule.
✅ **New Year Special:** 25% OFF setup valid until Jan 31st!

Let me know what you think! We can set up a quick demo to show you how Elisa sounds handling your calls.

Best,
**Alex**
ORION Tech
`;

            // Client's number: 17182699743@s.whatsapp.net
            const number = '17182699743@s.whatsapp.net';

            console.log('📤 Sending FINAL PROPOSAL to Client (Endi Islam)...');
            try {
                await sock.sendMessage(number, { text: text });
                console.log('✅ Message sent to ' + number);
            } catch (e) {
                console.error('Error sending:', e);
            }

            // Wait a bit to ensure flush then exit
            setTimeout(() => {
                console.log('👋 Done.');
                process.exit(0);
            }, 3000);
        }
    });
}

sendProposal();
