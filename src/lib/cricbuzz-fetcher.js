/**
 * Cricbuzz Data Fetcher
 * 
 * Fetches live match data from Cricbuzz via TinyFish API
 */

require('dotenv').config({ path: '.env.local' });

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const CRICBUZZ_URL = process.env.CRICBUZZ_SCORECARD_URL;

/**
 * Fetches Cricbuzz scorecard content via TinyFish API
 * @returns {Promise<string>} Raw markdown content from Cricbuzz
 */
async function fetchCricbuzzData() {
    if (!TINYFISH_API_KEY) {
        throw new Error('TINYFISH_API_KEY not found in .env.local');
    }

    if (!CRICBUZZ_URL) {
        throw new Error('CRICBUZZ_SCORECARD_URL not found in .env.local');
    }

    const response = await fetch('https://api.fetch.tinyfish.ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': TINYFISH_API_KEY,
        },
        body: JSON.stringify({
            urls: [CRICBUZZ_URL],
        }),
    });

    if (!response.ok) {
        throw new Error(`TinyFish API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error('No results returned from TinyFish API');
    }

    const content = data.results[0].text || data.results[0].content;

    if (!content) {
        throw new Error('No content found in TinyFish response');
    }

    return content;
}

/**
 * Validates that required environment variables are set
 * @returns {boolean} True if all required config is present
 */
function validateConfig() {
    const required = ['TINYFISH_API_KEY', 'CRICBUZZ_SCORECARD_URL'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        return false;
    }

    return true;
}

module.exports = {
    fetchCricbuzzData,
    validateConfig,
};
