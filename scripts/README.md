# Test Scripts - Cricket Coaching Simulator

Standalone test scripts for validating all external integrations and core functionality.

## Prerequisites

- Node.js 18+ (for native `fetch` support)
- `.env.local` file with all API keys configured

## Available Tests

### 1. TinyFish API - Cricbuzz Fetch
Tests the TinyFish API integration for scraping Cricbuzz live scorecards.

```bash
# With URL from .env.local
node scripts/test-tinyfish-fetch.js

# With explicit URL
node scripts/test-tinyfish-fetch.js https://www.cricbuzz.com/live-cricket-scores/12345/srh-vs-pbks
```

**What it tests:**
- TinyFish API connectivity
- Cricbuzz URL accessibility
- Content extraction and structure
- Response time (< 1 second expected)

---

### 2. Cricbuzz Parser
Tests the markdown parser that extracts structured match data from Cricbuzz.

```bash
# With mock data (default)
node scripts/test-cricbuzz-parser.js

# With real TinyFish output (save to file first)
node scripts/test-tinyfish-fetch.js > output.txt
node scripts/test-cricbuzz-parser.js output.txt
```

**What it tests:**
- Score pattern extraction (e.g., "SRH 156/4 (17.2 ov)")
- Match phase detection (powerplay/middle/death)
- Team name parsing
- Data structure validation

---

### 3. Gemini API - Decision Scoring
Tests the Gemini AI scoring integration with mock match data.

```bash
node scripts/test-gemini-scoring.js
```

**What it tests:**
- Gemini API connectivity
- Prompt construction
- JSON response parsing
- Score validation (0-100 range)
- Dimension scoring (0-25 each)
- Response time (< 3 seconds expected)

---

### 4. InsForge Database
Tests database connection and CRUD operations.

```bash
node scripts/test-insforge-db.js
```

**What it tests:**
- Database connectivity
- Table existence
- INSERT operations
- UPDATE operations
- DELETE operations
- RLS policy configuration

**Note:** This test creates and deletes a test record. If it fails, you likely need to:
1. Run `database-setup.sql` in InsForge dashboard
2. Configure RLS policies correctly

---

## Run All Tests

```bash
# Run all tests in sequence
node scripts/run-all-tests.js

# Run all tests with specific Cricbuzz URL
node scripts/run-all-tests.js https://www.cricbuzz.com/live-cricket-scores/12345/srh-vs-pbks
```

---

## Interpreting Results

### ✅ PASSED
- All validations successful
- Integration is working correctly
- Ready for production use

### ⚠️ WARNING
- Test ran but encountered non-critical issues
- May work with real data but failed with test data
- Review the warning messages

### ❌ FAILED
- Critical error encountered
- Integration is not working
- Check error messages and stack traces

---

## Common Issues

### TinyFetch Returns Empty Content
- Cricbuzz URL might be invalid
- Match might not have started yet
- Try a different match URL

### Parser Extracts "TBD" Values
- Markdown structure doesn't match expected patterns
- Cricbuzz may have changed their HTML structure
- Save actual output and adjust regex patterns in `cricbuzz-parser.ts`

### Gemini Returns Invalid JSON
- Prompt might be too long or complex
- Try reducing `maxOutputTokens`
- Check API key has Gemini access enabled

### InsForge Database Errors
- Table doesn't exist → run `database-setup.sql`
- RLS policy blocking → check policies in dashboard
- Authentication required → ensure anon key is correct

---

## Environment Variables Required

```env
# All tests
NEXT_PUBLIC_INSFORGE_URL=https://your-project.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key

# TinyFish test
TINYFISH_API_KEY=sk-tinyfish-xxx
CRICBUZZ_SCORECARD_URL=https://www.cricbuzz.com/live-cricket-scores/xxx

# Gemini test
GEMINI_API_KEY=AIzaSyXxx
```

---

## Adding New Tests

1. Create `scripts/test-<name>.js`
2. Use the same structure as existing tests
3. Add to `run-all-tests.js` test array
4. Update this README

---

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```bash
# Exit code 0 = all passed, 1 = some failed
node scripts/run-all-tests.js $CRICBUZZ_URL
```

Use with GitHub Actions, Vercel deployments, or manual pre-deployment checks.
