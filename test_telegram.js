const telegramBot = require('./src/telegram/telegram-bot');

console.log('🧪 TESTING TELEGRAM BOT STANDALONE...');
try {
    const bot = telegramBot.initTelegramBot();
    if (bot) {
        console.log('✅ BOT STARTED SUCCESSFULLY IN TEST MODE.');
        console.log('Waiting for messages... (Press Ctrl+C to stop)');
    } else {
        console.error('❌ BOT REFUSED TO START.');
    }
} catch (e) {
    console.error('❌ EXCEPTION:', e);
}
