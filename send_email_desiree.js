// Send email to Desiree
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail() {
    try {
        const result = await transporter.sendMail({
            from: '"ORION Tech" <agem2013@gmail.com>',
            to: 'desiree.marquez@arcadiamsc.com',
            subject: 'Notice - Apt 423 Edemwood',
            html: `<p>Dear Desiree,</p>

<p>This matter needs to be resolved at your earliest convenience.</p>

<p>Thank you for your attention and understanding.</p>

<p>Best regards,<br>
<strong>Alex G Espinosa</strong><br>
Apt 423</p>

<hr>
<p>🎄 <strong>Merry Christmas!</strong> 🎄<br>
Here's a special Christmas card for you:<br>
<a href="https://agem2024.github.io/tarjetas-y-mesj/Tarjeta-Desiree-Marquez.html">Open Your Christmas Card</a></p>`,
            text: `Dear Desiree,

This matter needs to be resolved at your earliest convenience.

Thank you for your attention and understanding.

Best regards,
Alex G Espinosa
Apt 423

---
🎄 Merry Christmas! 🎄
Here's a special Christmas card for you:
https://agem2024.github.io/tarjetas-y-mesj/Tarjeta-Desiree-Marquez.html`
        });
        console.log('✅ Email sent:', result.messageId);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

sendEmail();
