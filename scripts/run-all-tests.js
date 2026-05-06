#!/usr/bin/env node
/**
 * Master Test Runner - Cricket Coaching Simulator
 * 
 * Usage: node scripts/run-all-tests.js [cricbuzz_url]
 * 
 * Runs all tests in sequence
 */

const { execSync } = require('child_process');
const path = require('path');

const CRICBUZZ_URL = process.argv[2];

const tests = [
    {
        name: 'TinyFish API - Cricbuzz Fetch',
        script: 'test-tinyfish-fetch.js',
        args: CRICBUZZ_URL,
    },
    {
        name: 'Cricbuzz Parser',
        script: 'test-cricbuzz-parser.js',
        args: null,
    },
    {
        name: 'Gemini API - Decision Scoring',
        script: 'test-gemini-scoring.js',
        args: null,
    },
    {
        name: 'InsForge Database',
        script: 'test-insforge-db.js',
        args: null,
    },
];

async function runTests() {
    console.log('🚀 Cricket Coaching Simulator - Test Suite\n');
    console.log('═══════════════════════════════════════════\n');

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`📋 Running: ${test.name}`);
        console.log('═'.repeat(60));
        console.log();

        try {
            const args = test.args ? [test.args] : [];
            execSync(`node ${path.join(__dirname, test.script)} ${args.join(' ')}`, {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..'),
            });
            passed++;
            console.log(`\n✅ ${test.name} - PASSED\n`);
        } catch (error) {
            failed++;
            console.error(`\n❌ ${test.name} - FAILED\n`);
        }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 Test Results Summary');
    console.log('═══════════════════════════════════════════\n');
    console.log(`Total: ${tests.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log();

    if (failed === 0) {
        console.log('🎉 All tests passed!\n');
        process.exit(0);
    } else {
        console.log(`⚠️  ${failed} test(s) failed. Check the output above for details.\n`);
        process.exit(1);
    }
}

runTests();
