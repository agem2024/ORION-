const screenshot = require('screenshot-desktop');
const puppeteer = require('puppeteer');
const qrcode = require('qrcode');
const Parser = require('rss-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const parser = new Parser();

// 📸 CAPTURA DE PANTALLA
async function capturaPantalla() {
    const imgPath = path.join(__dirname, `../temp/screenshot_${Date.now()}.jpg`);
    await screenshot({ filename: imgPath, format: 'jpg' });
    return imgPath;
}

// 🌐 CAPTURA WEB
async function capturaWeb(url) {
    if (!url.startsWith('http')) url = 'https://' + url;
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    const imgPath = path.join(__dirname, `../temp/web_${Date.now()}.jpg`);
    await page.screenshot({ path: imgPath });
    await browser.close();
    return imgPath;
}

// 🔳 GENERAR QR
async function generarQR(texto) {
    const imgPath = path.join(__dirname, `../temp/qr_${Date.now()}.png`);
    await qrcode.toFile(imgPath, texto);
    return imgPath;
}

// 📰 NOTICIAS TECH
async function obtenerNoticias() {
    try {
        const feed = await parser.parseURL('https://techcrunch.com/feed/');
        return feed.items.slice(0, 5).map(item => `📰 *${item.title}*\n🔗 ${item.link}`).join('\n\n');
    } catch (e) {
        return 'No pude obtener noticias recientes.';
    }
}

// 🛑 CONTROL DE ENERGÍA
function controlarPC(accion) {
    return new Promise((resolve, reject) => {
        let cmd = '';
        if (accion === 'apagar') cmd = 'shutdown /s /t 10';
        if (accion === 'reiniciar') cmd = 'shutdown /r /t 10';
        if (!cmd) return reject('Acción no válida');
        exec(cmd, (err) => {
            if (err) reject(err);
            else resolve('Comando enviado. Ejecución en 10 segundos.');
        });
    });
}

// 📋 PORTAPAPELES
async function leerPortapapeles() {
    return new Promise((resolve) => {
        exec('powershell -command "Get-Clipboard"', (err, stdout) => {
            if (err) resolve('No pude leer el portapapeles');
            else resolve(`📋 *Portapapeles:*\n${stdout.trim()}`);
        });
    });
}

async function escribirPortapapeles(texto) {
    return new Promise((resolve) => {
        exec(`powershell -command "Set-Clipboard -Value '${texto}'"`, (err) => {
            if (err) resolve('❌ Error escribiendo al portapapeles');
            else resolve(`✅ Copiado al portapapeles: "${texto}"`);
        });
    });
}

// 💻 ESTADO DEL SISTEMA
async function estadoSistema() {
    return new Promise((resolve) => {
        exec('powershell -command "Get-ComputerInfo | Select-Object CsProcessors, OsTotalVisibleMemorySize, OsFreePhysicalMemory"', (err, stdout) => {
            if (err) {
                resolve('❌ No pude obtener info del sistema');
            } else {
                resolve(`💻 *ESTADO DEL SISTEMA*\n\n${stdout.trim()}`);
            }
        });
    });
}

module.exports = {
    capturaPantalla,
    capturaWeb,
    generarQR,
    obtenerNoticias,
    controlarPC,
    leerPortapapeles,
    escribirPortapapeles,
    estadoSistema
};
