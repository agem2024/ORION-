/**
 * 🕷️ WEB SCRAPER - Extract content from any webpage
 * Uses axios + cheerio for fast scraping
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeUrl(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Remove scripts, styles, and nav elements
        $('script, style, nav, footer, header, aside').remove();

        // Extract text content
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const h1 = $('h1').first().text().trim();

        // Get main content
        let mainContent = '';
        $('article, main, .content, .post, .entry').each((i, el) => {
            mainContent += $(el).text().trim() + '\n\n';
        });

        // Fallback to body if no main content found
        if (!mainContent) {
            mainContent = $('body').text().trim();
        }

        // Clean up whitespace
        mainContent = mainContent.replace(/\s+/g, ' ').substring(0, 5000);

        return {
            url,
            title,
            description,
            h1,
            content: mainContent,
            success: true
        };
    } catch (e) {
        console.error('Scraping Error:', e.message);
        return {
            url,
            error: e.message,
            success: false
        };
    }
}

async function extractLinks(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const links = [];

        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
                links.push({ text, href });
            }
        });

        return links.slice(0, 50); // Limit to 50 links
    } catch (e) {
        console.error('Link Extraction Error:', e.message);
        return [];
    }
}

async function extractImages(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const images = [];

        $('img[src]').each((i, el) => {
            const src = $(el).attr('src');
            const alt = $(el).attr('alt') || '';
            if (src) {
                images.push({ src, alt });
            }
        });

        return images.slice(0, 20); // Limit to 20 images
    } catch (e) {
        console.error('Image Extraction Error:', e.message);
        return [];
    }
}

module.exports = {
    scrapeUrl,
    extractLinks,
    extractImages
};
