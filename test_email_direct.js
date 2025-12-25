// Direct SMTP test - bypassing service shorthand
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔐 Testing with user:', process.env.EMAIL_USER);
console.log('🔐 Pass length:', process.env.EMAIL_PASS?.length || 0);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function test() {
    try {
        await transporter.verify();
        console.log('✅ SMTP Connection OK!');

        const result = await transporter.sendMail({
            from: '"ORION Tech" <agem2013@gmail.com>',
            to: 'desiree.marquez@arcadimsc.com',
            subject: 'Notice - Apt 423 Edemwood',
            text: `Dear Desiree,

This matter needs to be resolved at your earliest convenience.

Thank you for your attention and understanding.

Best regards,
ORION Tech`
        });
        console.log('✅ Email sent:', result.messageId);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

test();
