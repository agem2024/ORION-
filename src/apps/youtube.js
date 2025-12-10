const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger'); // Use our logger

// Fixed path for ORION structure
const YT_DLP_PATH = path.join(__dirname, '../tools/yt-dlp.exe');
const DOWNLOADS_DIR = path.join(__dirname, '../../downloads');

if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR);
}

async function descargarVideo(url, tipo = 'video') {
    return new Promise((resolve, reject) => {
        const outputTemplate = path.join(DOWNLOADS_DIR, '%(title)s.%(ext)s');
        const args = [url, '-o', outputTemplate, '--no-playlist'];

        if (tipo === 'audio') {
            args.push('-x', '--audio-format', 'mp3');
        } else {
            args.push('-f', 'best[ext=mp4]/best');
        }

        logger.info(`[YouTube] Downloading ${tipo}: ${url}`);

        execFile(YT_DLP_PATH, args, (error, stdout, stderr) => {
            if (error) {
                logger.error('[YouTube Error] ' + stderr);
                return reject(error);
            }

            // Parse Output
            const match = stdout.match(/Destination: (.+)/) || stdout.match(/Already downloaded: (.+)/);
            if (match) {
                resolve(match[1].trim());
            } else {
                // Fallback: file check
                const files = fs.readdirSync(DOWNLOADS_DIR)
                    .map(f => ({ name: f, time: fs.statSync(path.join(DOWNLOADS_DIR, f)).mtime.getTime() }))
                    .sort((a, b) => b.time - a.time);

                if (files.length > 0) {
                    resolve(path.join(DOWNLOADS_DIR, files[0].name));
                } else {
                    reject(new Error('Could not locate downloaded file.'));
                }
            }
        });
    });
}

module.exports = { descargarVideo };
