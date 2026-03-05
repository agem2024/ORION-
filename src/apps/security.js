/**
 * 🛡️ Security Module - JHON Central Brain
 * Handles administrative access and logging.
 */

const crypto = require('crypto');

// For now, using a simple environment-based key or a default one
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'jhon_master_2026';

/**
 * Middleware to verify administrative access.
 */
function verifyAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access Denied: No Token Provided' });
    }

    if (token !== ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Access Denied: Invalid Token' });
    }

    next();
}

/**
 * Log administrative actions for accountability.
 */
function logAction(action, user = 'admin') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] USER: ${user} | ACTION: ${action}\n`;

    // In a real app, write to a log file or DB
    console.log(`🛡️ SECURITY LOG: ${logEntry}`);
}

module.exports = {
    verifyAdmin,
    logAction,
    ADMIN_TOKEN
};
