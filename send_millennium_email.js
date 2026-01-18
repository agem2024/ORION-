// Send email to New Millennium
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
        console.log('🚀 Sending email to New Millennium...');

        const result = await transporter.sendMail({
            from: '"ORION Tech" <agem2013@gmail.com>',
            to: 'newmillennium2013@yahoo.com',
            // bcc: 'agem2013@gmail.com', // Optional: copy yourself
            subject: 'Happy 2026 & Future of New Millennium Interiors 🚀',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <p>Dear Estella & Family,</p>

                <p>Happy New Year! 🎆 We hope 2026 brings you success and prosperity.</p>

                <p>As we start this new year, I wanted to share a personalized digital transformation proposal for <strong>New Millennium Interiors</strong>.</p>

                <p>We have analyzed your workflow and designed a system to <em>"Automate the Art of Restoration"</em>:</p>
                
                <ul style="background: #f9f9f9; padding: 15px 30px; border-radius: 8px;">
                    <li><strong>📞 AI Voice Receptionist:</strong> Answers missed calls 24/7/365, so you never lose a job while working.</li>
                    <li><strong>📐 PhotoAI Quoting:</strong> Quote remotely without driving to every site.</li>
                    <li><strong>🎨 Digital Fabric Showcase:</strong> Help clients choose fabrics instantly.</li>
                </ul>

                <p><strong>👉 View Your Full Proposal Here:</strong><br>
                <a href="https://agem2024.github.io/SEGURITI-USC/proposals/new-millennium/propuesta_orion_new_millennium.html" style="color: #00bcd4; font-weight: bold; text-decoration: none;">
                    OPEN PROPOSAL: New Millennium Interiors
                </a></p>

                <p>Let's make 2026 your most efficient year yet.</p>

                <p>Best regards,<br>
                <strong>ORION Tech Team</strong><br>
                Alex G. Espinosa</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">ORION Tech | San Jose, CA | Automated Growth Systems</p>
            </div>
            `,
            text: `Dear Estella & Family,

Happy New Year! 🎆 We hope 2026 brings you success and prosperity.

As we start this new year, I wanted to share a personalized digital transformation proposal for New Millennium Interiors.

We have analyzed your workflow and designed a system to "Automate the Art of Restoration":

* AI Voice Receptionist: Answers missed calls 24/7/365, so you never lose a job while working.
* PhotoAI Quoting: Quote remotely without driving to every site.
* Digital Fabric Showcase: Help clients choose fabrics instantly.

👉 View Your Full Proposal Here:
https://agem2024.github.io/SEGURITI-USC/proposals/new-millennium/propuesta_orion_new_millennium.html

Let's make 2026 your most efficient year yet.

Best regards,
ORION Tech Team
Alex G. Espinosa`
        });
        console.log('✅ Email sent successfully:', result.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
    }
}

sendEmail();
