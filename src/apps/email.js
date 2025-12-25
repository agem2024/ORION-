/**
 * ORION Email Module
 * Send emails via SMTP (Gmail)
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'agem2013@gmail.com',
        pass: process.env.EMAIL_PASS // Gmail App Password required
    }
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} body - Email body (can be HTML)
 * @param {string} from - Optional sender name
 */
async function sendEmail(to, subject, body, from = 'ORION Tech') {
    try {
        const mailOptions = {
            from: `"${from}" <${process.env.EMAIL_USER || 'agem2013@gmail.com'}>`,
            to: to,
            subject: subject,
            html: body.replace(/\n/g, '<br>'),
            text: body
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Verify SMTP connection
 */
async function verifyConnection() {
    try {
        await transporter.verify();
        console.log('✅ Email SMTP connection verified');
        return true;
    } catch (error) {
        console.error('❌ Email SMTP error:', error.message);
        return false;
    }
}

module.exports = {
    sendEmail,
    verifyConnection,
    transporter
};
