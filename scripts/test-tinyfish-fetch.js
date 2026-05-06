#!/usr/bin/env node
/**
 * Test 1: TinyFish API - Fetch Cricbuzz Content
 * 
 * Usage: node scripts/test-tinyfish-fetch.js [cricbuzz_url]
 * 
 * Tests the TinyFish API integration for scraping Cricbuzz
 */

require('dotenv').config({ path: '.env.local' });

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const CRICBUZZ_URL = process.argv[2] || process.env.CRICBUZZ_SCORECARD_URL;

async function testTinyFishFetch() {
    console.log('🧪 Testing TinyFish API - Cricbuzz Fetch\n');
    console.log('===========================================\n');

    // Check configuration
    if (!TINYFISH_API_KEY) {
        console.error('❌ Error: TINYFISH_API_KEY not found in .env.local');
        process.exit(1);
    }

    if (!CRICBUZZ_URL || CRICBUZZ_URL.includes('placeholder')) {
        console.error('❌ Error: CRICBUZZ_SCORECARD_URL not configured');
        console.log('\nUsage: node scripts/test-tinyfish-fetch.js [cricbuzz_url]');
        console.log('Example: node scripts/test-tinyfish-fetch.js https://www.cricbuzz.com/live-cricket-scores/12345/srh-vs-pbks');
        process.exit(1);
    }

    console.log(`📡 Target URL: ${CRICBUZZ_URL}`);
    console.log(`🔑 API Key: ${TINYFISH_API_KEY.substring(0, 20)}...`);
    console.log('\n⏳ Fetching content...\n');

    try {
        const startTime = Date.now();

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

        const duration = Date.now() - startTime;

        console.log(`⏱️  Response time: ${duration}ms`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error(`\n❌ Request failed with status ${response.status}`);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            process.exit(1);
        }

        const data = await response.json();

        console.log('\n✅ Request successful!\n');
        console.log('📄 Response structure:');
        console.log(`   - Keys: ${Object.keys(data).join(', ')}`);

        // Check for results array
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const content = result.text || result.content;

            console.log(`   - URL: ${result.url}`);
            console.log(`   - Title: ${result.title || 'N/A'}`);
            console.log(`   - Content length: ${content ? content.length : 0} characters`);

            if (content) {
                console.log(`   - Content preview (first 500 chars):\n`);
                console.log('   ' + '─'.repeat(60));
                console.log(content.substring(0, 500));
                console.log('   ' + '─'.repeat(60));

                console.log('\n🔍 Content analysis:');
                console.log(`   - Contains "SRH" or "PBKS": ${content.includes('SRH') || content.includes('PBKS') ? '✅' : '❌'}`);
                console.log(`   - Contains score pattern: ${/\d+\/\d+/.test(content) ? '✅' : '❌'}`);
                console.log(`   - Contains "over" or "ov": ${content.toLowerCase().includes('over') || content.toLowerCase().includes('ov') ? '✅' : '❌'}`);

                console.log('\n✅ TinyFish fetch test PASSED');
            }
        } else if (data.errors && data.errors.length > 0) {
            console.error('❌ Request returned errors:');
            console.error(data.errors);
            process.exit(1);
        } else {
            console.warn('⚠️  Response does not contain results array');
            console.log('Full response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('\n❌ Test failed with error:');
        console.error(error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

testTinyFishFetch();
