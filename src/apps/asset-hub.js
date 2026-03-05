/**
 * 🎬 Asset Hub Module - JHON Central Brain
 * Responsible for managing media assets (images, videos, audio).
 */

const fs = require('fs');
const path = require('path');

const MEDIA_ROOT = 'c:\\Users\\alexp\\OneDrive\\Documentos'; // Scanning broad area for assets

/**
 * List media assets with specific extensions.
 */
function listAssets(page = 1, limit = 20) {
    try {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.mov', '.mp3', '.wav'];
        const assets = [];

        // Helper to recursively find assets (limited for performance)
        function findAssets(dir, depth = 0) {
            if (depth > 3) return; // Limit depth
            if (!fs.existsSync(dir)) return;

            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                try {
                    const stats = fs.statSync(fullPath);
                    if (stats.isDirectory()) {
                        if (!item.startsWith('.') && item !== 'node_modules') {
                            findAssets(fullPath, depth + 1);
                        }
                    } else {
                        const ext = path.extname(item).toLowerCase();
                        if (allowedExtensions.includes(ext)) {
                            assets.push({
                                name: item,
                                path: fullPath,
                                size: stats.size,
                                modified: stats.mtime,
                                type: ext.startsWith('.mp4') || ext.startsWith('.mov') ? 'video' :
                                    ext.startsWith('.mp3') || ext.startsWith('.wav') ? 'audio' : 'image'
                            });
                        }
                    }
                } catch (err) { /* Skip problematic files */ }
                if (assets.length > 100) break; // Limit total results for search
            }
        }

        findAssets(MEDIA_ROOT);

        // Return paginated results
        return assets.slice((page - 1) * limit, page * limit);
    } catch (e) {
        console.error('Asset Hub Error:', e.message);
        return [];
    }
}

module.exports = {
    listAssets
};
