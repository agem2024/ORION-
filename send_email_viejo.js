// Send Christmas card email to Carlos Murias
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
            to: 'muriascarlos223@gmail.com',
            subject: '🎄 Una sorpresa especial de Navidad 🎁',
            html: `<p>Hola Carlos,</p>

<p>Espero que estés pasando una excelente Navidad.</p>

<p>Te envío este correo con una sorpresa especial diseñada por ORION Tech.</p>

<hr>
<p>🎄 <strong>¡Feliz Navidad!</strong> 🎄<br>
Aquí tienes tu tarjeta navideña personalizada:<br>
<a href="https://agem2024.github.io/tarjetas-y-mesj/Tarjeta-VIEJO.html">Abrir mi Tarjeta de Navidad</a></p>

<p>Con cariño,<br>
<strong>Alex G Espinosa</strong><br>
ORION Tech</p>`,
            text: `Hola Carlos,

Espero que estés pasando una excelente Navidad.

Te envío este correo con una sorpresa especial diseñada por ORION Tech.

🎄 ¡Feliz Navidad! 🎄
Aquí tienes tu tarjeta navideña personalizada:
https://agem2024.github.io/tarjetas-y-mesj/Tarjeta-VIEJO.html

Con cariño,
Alex G Espinosa
ORION Tech`
        });
        console.log('✅ Email sent to Carlos Murias:', result.messageId);
    } catch (error) {
        console.error('❌ Error sending email to Carlos:', error.message);
    }
}

sendEmail();
