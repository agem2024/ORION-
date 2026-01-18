require('dotenv').config();
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const targetNumber = 'whatsapp:+16692342444'; // Alex's Number
const fromNumber = 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER; // Orion Bot Number

const messageBody = `Hola Estella, Alex de ORION Tech. 👋

Ya tengo lista tu propuesta digital para *New Millennium Interiors*. 

La he diseñado específicamente para automatizar todo el proceso de cotización y gestión de llamadas.

👉 *Ver Propuesta:* https://agem2024.github.io/SEGURITI-USC/proposals/new-millennium/propuesta_orion_new_millennium.html

Incluye una demo interactiva con "Mike".

Quedo atento.`;

console.log(`Sending to ${targetNumber} from ${fromNumber}...`);

client.messages.create({
    body: messageBody,
    from: fromNumber,
    to: targetNumber
})
    .then(message => console.log("✅ SUCCESS: Message sent! SID: " + message.sid))
    .catch(err => {
        console.error("❌ ERROR Sending WhatsApp:", err.message);
        if (err.code === 21608) {
            console.log("Tip: This might be due to 'Unverified Number' in sandbox or 'Template' restriction.");
        }
    });
