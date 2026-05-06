# Cricket Coaching Simulator — PRD & Build Spec

**Project:** Cricket Coaching Simulator (Agentic Premier League Hackathon)
**Event:** GDG Hyderabad — Agentic Premier League
**Date:** 6 May 2026
**Build Window:** ~3 hours (6:30 PM – 10:30 PM IST)
**Match:** SRH vs PBKS, IPL 2026, Match 49

---

## Qoder Agent Context

This document is the single source of truth for building this project. It contains every architectural decision, research finding, and implementation detail. When building, follow this spec exactly — all decisions have been made. If something is ambiguous, check this doc before asking.

### Research Already Completed

The following has been validated and does not need re-research:

1. **TinyFish `fetch_content` works with Cricbuzz.** Tested and confirmed. Cricbuzz renders server-side so TinyFish gets actual match data in ~350ms. ESPNcricinfo does NOT work (too JS-heavy, returns empty shell). Always use Cricbuzz URLs.

2. **Cricbuzz player profiles are scrapeable.** Tested with Virat Kohli's profile. Returns: career stats (matches, innings, runs, SR, average across formats), batting/bowling style, team history, ICC rankings. This is our player data source.

3. **Field placement data does NOT exist publicly.** No API or scrapeable source provides actual fielding positions from IPL matches. Hawk-Eye data is proprietary. Our approach: Gemini evaluates field placement decisions based on cricket strategy principles from its training data, NOT by comparing to the captain's actual field.

4. **Bowling change data IS available.** Cricbuzz scorecard shows who bowled each over. We can detect bowling changes by diffing consecutive fetches.

5. **InsForge setup is two commands.** `POST /agents/v1/signup` to create a trial project, then `npx @insforge/cli link` to wire it up. Tables auto-become REST APIs. Google OAuth is built-in. Skill file at https://insforge.dev/skill.md — fetch this before starting InsForge work.

### Research Qoder Should Do

Before starting implementation, Qoder should research:

1. **InsForge setup & SDK** — Fetch https://insforge.dev/skill.md and follow it exactly. Also fetch https://docs.insforge.dev/quickstart for the TypeScript SDK patterns.
2. **InsForge Google OAuth config** — Fetch InsForge auth docs to understand how to enable Google OAuth provider.
3. **Gemini API TypeScript SDK** — Research `@google/generative-ai` npm package for function calling patterns. The event requires Google Cloud / Gemini usage.
4. **TinyFish API** — Research TinyFish `fetch_content` endpoint for use from a Next.js API route. We need to call it server-side, not from the browser. TinyFish docs: https://docs.tinyfish.ai or check their MCP at https://agent.tinyfish.ai/mcp.
5. **Cricbuzz URL patterns** — Research the specific URL for the SRH vs PBKS live scorecard. Pattern is typically `https://www.cricbuzz.com/live-cricket-scores/{match-id}/{slug}`. Also find player profile URL patterns for fetching batsman data on-the-fly.
6. **shadcn/ui components** — Check which components are available. We need: Card, Button, Dialog, Avatar, Badge, Tabs, Table, Select, RadioGroup, Toast, and a progress/score indicator.

---

## Problem Statement

> Create a Coaching Simulator where fans make real-time decisions on field placements and bowling changes during the live IPL match. By comparing fan decisions with the captain's actual moves and using historical data to score the "tactical merit" of their choices, the platform identifies and rewards the most knowledgeable cricket minds in the country.

---

## Product Overview

A real-time web app where users act as the team coach during a live IPL match. At key tactical moments (start of each over, bowling changes, new batsman), users make decisions about bowling selection and field placement. Gemini AI evaluates the tactical merit of their choices using cricket strategy knowledge and live match context. A leaderboard ranks users by cumulative tactical IQ.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP                               │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Auth Page   │  │  Game Board  │  │  Leaderboard            │ │
│  │  (Google     │  │  - Score Bar │  │  - Ranked users         │ │
│  │   OAuth)     │  │  - Decision  │  │  - Score breakdown      │ │
│  │             │  │    Prompt    │  │  - Live updates         │ │
│  │             │  │  - Field Map │  │                         │ │
│  │             │  │  - History   │  │                         │ │
│  └─────────────┘  └──────┬───────┘  └─────────────────────────┘ │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                    API ROUTES (/api)                        │  │
│  │                                                            │  │
│  │  /api/match/live     → TinyFish fetch → Cricbuzz parse    │  │
│  │  /api/match/player   → TinyFish fetch → Cricbuzz profile  │  │
│  │  /api/decision/submit → Store in InsForge                  │  │
│  │  /api/decision/score  → Gemini evaluation                  │  │
│  │  /api/leaderboard     → InsForge query + aggregate         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
     ┌─────┴─────┐  ┌─────┴─────┐  ┌──────┴──────┐
     │ InsForge   │  │ TinyFish  │  │  Gemini API │
     │ (Postgres  │  │ (Cricbuzz │  │  (Tactical  │
     │  + Auth)   │  │  scraping)│  │   scoring)  │
     └───────────┘  └───────────┘  └─────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js (App Router) | Required for event. SSR + API routes in one project. |
| UI | shadcn/ui + Tailwind CSS | Fast, polished components. Dark theme built-in. |
| Language | TypeScript (end-to-end) | Type safety across frontend and API routes. |
| Backend/DB | InsForge (Postgres + Auth) | Tables become APIs. Google OAuth built-in. User has prior experience. |
| Live Data | TinyFish `fetch_content` API | Validated — scrapes Cricbuzz in ~350ms. |
| AI Scoring | Gemini API (`@google/generative-ai`) | Required by event. Evaluates tactical merit of decisions. |
| Deployment | Local dev (hackathon) | No need to deploy tonight. InsForge backend is cloud-hosted. |

---

## Auth Flow

- **Provider:** Google OAuth via InsForge's built-in auth
- **Flow:** User lands on app → clicks "Sign in with Google" → InsForge handles OAuth → redirect back with session → user enters the game
- **User data stored:** Google display name, email, profile picture (from OAuth), plus a generated `user_id` from InsForge
- **Why Google OAuth:** Event is Google Cloud themed. Judges will notice. Also prevents duplicate leaderboard entries.

---

## Database Schema (InsForge)

### `users` table
Handled automatically by InsForge auth. Fields: `id`, `email`, `display_name`, `avatar_url`, `created_at`.

### `decisions` table
```sql
CREATE TABLE decisions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  match_id    TEXT NOT NULL,
  over_number INTEGER NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('bowling_change', 'field_placement')),
  user_choice JSONB NOT NULL,
  actual_choice JSONB,           -- filled when captain's decision is revealed
  match_context JSONB NOT NULL,  -- score, overs, batsmen, phase at time of decision
  merit_score INTEGER,           -- 0-100, filled by Gemini evaluation
  merit_breakdown JSONB,         -- detailed scoring dimensions
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### `leaderboard` table (materialized view or query)
```sql
-- Can be a view rather than a table
SELECT
  user_id,
  users.display_name,
  users.avatar_url,
  COUNT(*) as total_decisions,
  AVG(merit_score) as avg_merit,
  SUM(merit_score) as total_merit,
  MAX(merit_score) as best_decision
FROM decisions
JOIN users ON users.id = decisions.user_id
WHERE match_id = 'srh-vs-pbks-2026-05-06'
GROUP BY user_id, users.display_name, users.avatar_url
ORDER BY total_merit DESC;
```

---

## Core Game Loop

### Step 1: Poll Live Match Data
- Next.js API route `/api/match/live` calls TinyFish `fetch_content` with the Cricbuzz scorecard URL
- Parse the markdown response to extract: team scores, overs bowled, current batsmen, current bowler, recent balls, wickets, run rate
- Store parsed state in memory (or short-lived cache)
- Poll every 30 seconds via client-side `setInterval` calling the API route
- **Critical:** Diff current state against previous to detect tactical moments

### Step 2: Detect Tactical Moments (Decision Triggers)
| Trigger | Detection Logic | Decision Type |
|---|---|---|
| New over starting | `overs` integer part changes | Bowling change + field placement |
| New batsman | Wicket detected (wickets count increases) | Field placement for new batsman |
| Powerplay transition | Over 6 completed, or over 16 completed | Field placement (field restrictions change) |
| Strategic timeout | Detect from match commentary/status | Both |

### Step 3: Present Decision to User

**Bowling Change Decision:**
- Show current match context (score, overs, batsmen at crease with their stats)
- Show the bowling options: list the team's bowlers with their overs bowled so far and economy
- User selects who should bowl the next over
- Timer: 45 seconds to decide (creates urgency, matches real cricket pacing)

**Field Placement Decision:**
- Show a simplified cricket field diagram (oval with 9 zones)
- User places fielders by selecting zones
- Zones: Slip/Gully, Point, Cover, Mid-off, Mid-on, Midwicket, Square Leg, Fine Leg, Third Man
- T20 rules: max 5 fielders outside the 30-yard circle (except in powerplay where it's max 2)
- Show the batsman's profile (batting style, SR, strengths) fetched from Cricbuzz via TinyFish
- Timer: 60 seconds to set the field

### Step 4: Score the Decision (Gemini)

After the user submits AND the captain's actual bowling choice is revealed (next fetch cycle), call Gemini to evaluate.

**Gemini Scoring Prompt:**
```
You are an elite cricket analyst and T20 coaching expert. Score the tactical merit of a fan's coaching decision during a live IPL match.

MATCH CONTEXT:
- Match: {team1} vs {team2}
- Score: {current_score}
- Overs: {overs_bowled}
- Match phase: {powerplay/middle/death}
- Batsmen at crease: {batsman1} (stats: {stats1}), {batsman2} (stats: {stats2})
- Run rate required/current: {run_rates}
- Recent momentum: {last_3_overs_summary}

DECISION TYPE: {bowling_change | field_placement}

FAN'S DECISION: {user_choice_json}

CAPTAIN'S ACTUAL DECISION: {actual_choice_json}

Score the fan's decision on these four dimensions (0-25 each, total 0-100):

1. SITUATION AWARENESS (0-25): Does the decision account for the match phase, powerplay rules, required run rate, and current momentum?

2. MATCHUP INTELLIGENCE (0-25): Does the decision exploit known weaknesses of the batsman? For bowling: pacer vs spinner matchup, left-arm angle. For field: placement targeting the batsman's scoring zones or cutting off strengths.

3. RISK-REWARD CALIBRATION (0-25): Is the aggression level appropriate? Attacking field when defending a big total, defensive setup when protecting a small total, etc.

4. STRATEGIC CREATIVITY (0-25): Is there something clever or unconventional that could work? Bonus for non-obvious but sound tactical thinking.

Respond in JSON only, no markdown:
{
  "total_score": <0-100>,
  "situation_awareness": <0-25>,
  "matchup_intelligence": <0-25>,
  "risk_reward": <0-25>,
  "strategic_creativity": <0-25>,
  "explanation": "<2-3 sentence analysis of the fan's decision>",
  "comparison_to_captain": "<1 sentence comparing to what the captain actually did>"
}
```

### Step 5: Update Leaderboard
- Store the score in InsForge `decisions` table
- Query aggregated leaderboard
- Push update to all connected clients (InsForge realtime or polling)

---

## Page Structure (Next.js App Router)

```
app/
├── layout.tsx              # Root layout, dark theme, InsForge provider
├── page.tsx                # Landing page → "Sign in with Google" CTA
├── auth/
│   └── callback/
│       └── page.tsx        # OAuth callback handler
├── game/
│   ├── layout.tsx          # Game shell: score bar at top, tabs for play/leaderboard
│   ├── page.tsx            # Main game board (decision prompts + field map)
│   └── leaderboard/
│       └── page.tsx        # Full leaderboard view
├── api/
│   ├── match/
│   │   ├── live/
│   │   │   └── route.ts    # GET → TinyFish fetch → parse Cricbuzz scorecard
│   │   └── player/
│   │       └── route.ts    # GET ?name=... → TinyFish fetch → Cricbuzz player profile
│   ├── decision/
│   │   ├── submit/
│   │   │   └── route.ts    # POST → Store decision in InsForge
│   │   └── score/
│   │       └── route.ts    # POST → Gemini evaluation → update InsForge
│   └── leaderboard/
│       └── route.ts        # GET → InsForge aggregation query
```

---

## UI Components

### 1. Score Bar (always visible at top)
- Team logos + names
- Current score: `SRH 156/4 (17.2 ov)`
- Run rate, required rate (if chasing)
- Current batsmen + bowler
- Match phase indicator (Powerplay / Middle / Death)

### 2. Decision Card (central game element)
- **Header:** "OVER 15 COMING UP" with countdown timer (45s or 60s)
- **Context panel:** Batsmen at crease with mini stat cards (SR, average, batting style)
- **Bowling selector:** Radio group of available bowlers with their economy + overs bowled
- **Field map:** Interactive oval diagram where users tap zones to place fielders
- **Submit button:** Prominent, disabled until valid selection made
- **After submission:** Shows "Waiting for captain's decision..." then reveals score

### 3. Field Map Component
- SVG oval representing the cricket ground
- 9 clickable zones arranged in standard cricket field positions
- User places exactly 9 fielders (excluding bowler and keeper)
- Powerplay indicator changes max fielders allowed outside the ring
- Visual feedback: selected zones highlight, count shown
- Batsman's scoring zones overlaid as a heatmap hint (from Gemini or general T20 data)

### 4. Score Reveal Card
- Animated score reveal (0 → final score, counting up)
- Four dimension bars (situation awareness, matchup intelligence, risk-reward, creativity)
- Gemini's explanation text
- "Captain chose: [X]" comparison line
- Share button (for the social media post at 5 PM)

### 5. Leaderboard
- Ranked table: rank, avatar, name, total merit score, decisions made, avg score
- Current user highlighted
- Top 3 with special styling (gold/silver/bronze)
- Live updating

---

## Field Placement — Simplified Model

Since granular field data doesn't exist, we use a 9-zone model that maps to real cricket positions:

```
              [Third Man]
                  |
   [Fine Leg]    |    [Slip/Gully]
        \        |        /
         \       |       /
  [Sq Leg] \     |     / [Point]
             \   |   /
              \  |  /
   [Midwicket]  🏏  [Cover]
              /     \
             /       \
   [Mid-on]           [Mid-off]
```

Each zone can have 0-2 fielders (representing close + deep positions in that zone). User distributes 9 fielders across zones. T20 constraints:

- **Powerplay (overs 1-6):** Maximum 2 fielders outside the 30-yard circle
- **Middle overs (7-15):** Maximum 5 fielders outside
- **Death overs (16-20):** Maximum 5 fielders outside

The UI should enforce these constraints and show an error if violated.

---

## Cricbuzz Data Parsing

### Scorecard Parsing (from TinyFish markdown)
Extract these fields from the Cricbuzz live scorecard markdown:

```typescript
interface MatchState {
  matchId: string;
  team1: { name: string; score: number; wickets: number; overs: number };
  team2: { name: string; score: number; wickets: number; overs: number };
  currentInnings: 1 | 2;
  currentBatsmen: { name: string; runs: number; balls: number; fours: number; sixes: number }[];
  currentBowler: { name: string; overs: number; maidens: number; runs: number; wickets: number; economy: number };
  recentOvers: string[];  // "1 0 4 1 2 W" format
  bowlingCard: { name: string; overs: number; runs: number; wickets: number; economy: number }[];
  matchPhase: 'powerplay' | 'middle' | 'death';
  requiredRunRate?: number;
  currentRunRate: number;
}
```

### Player Profile Parsing
From Cricbuzz player profile pages, extract:

```typescript
interface PlayerProfile {
  name: string;
  role: string;              // "Batsman", "Bowler", "All-Rounder"
  battingStyle: string;      // "Right Handed Bat", "Left Handed Bat"
  bowlingStyle: string;      // "Right-arm fast", "Left-arm spin", etc.
  iplStats: {
    matches: number;
    runs: number;
    average: number;
    strikeRate: number;
    fifties: number;
    hundreds: number;
  };
}
```

---

## Gemini Configuration

- **Model:** `gemini-2.0-flash` (fast, cheap, good enough for tactical analysis — use `gemini-2.0-pro` if quality isn't sufficient)
- **Temperature:** 0.3 (we want consistent, analytical scoring — not creative randomness)
- **Max tokens:** 500 (JSON response is compact)
- **Response format:** JSON only (enforce via system prompt)
- **API Key:** Store in `.env.local` as `GEMINI_API_KEY`

---

## Timing & Polling Strategy

```
Every 30 seconds:
  1. Fetch live scorecard from Cricbuzz via TinyFish
  2. Parse into MatchState
  3. Diff against previous MatchState
  4. If tactical moment detected:
     a. Push decision prompt to all connected users
     b. Start countdown timer
     c. Collect decisions
  5. On next fetch, if captain's decision revealed:
     a. Score all pending decisions via Gemini (batch if possible)
     b. Update leaderboard
  6. Update score bar UI regardless
```

---

## Environment Variables

```env
# InsForge
NEXT_PUBLIC_INSFORGE_URL=<projectUrl from insforge signup>
INSFORGE_API_KEY=<accessApiKey — NEVER put in NEXT_PUBLIC>
NEXT_PUBLIC_INSFORGE_ANON_KEY=<public anon key from link step>

# Gemini
GEMINI_API_KEY=<Google AI Studio or Cloud key>

# TinyFish
TINYFISH_API_KEY=<TinyFish API key>

# Match Config
NEXT_PUBLIC_MATCH_ID=srh-vs-pbks-2026-05-06
CRICBUZZ_SCORECARD_URL=<URL for tonight's SRH vs PBKS match — find at event start>
```

---

## Build Plan (3-Hour Sprint)

| Time | Phase | Deliverable |
|---|---|---|
| 0:00–0:20 | **Setup** | `npx create-next-app`, install shadcn + tailwind, init InsForge project, create DB tables, configure Google OAuth |
| 0:20–0:50 | **Data Layer** | Build `/api/match/live` route (TinyFish → Cricbuzz parser), test with real match URL. Build `/api/match/player` route. |
| 0:50–1:20 | **Game Core** | Build decision submission flow: bowling selector + field map component. Wire to InsForge `decisions` table. |
| 1:20–1:50 | **Gemini Scoring** | Build `/api/decision/score` route. Test Gemini prompt with mock data. Wire scoring to decision reveal UI. |
| 1:50–2:20 | **Leaderboard + Polish** | Build leaderboard page. Polish UI (dark theme, animations, score reveal). Add score bar with live data. |
| 2:20–2:45 | **Integration Test** | End-to-end test with live match data. Fix parsing edge cases. Tune Gemini prompt. |
| 2:45–3:00 | **Demo Prep** | Screen recording for social media post. Clean up UI for demo. |

---

## Social Media Deliverable

At 5:00 PM UTC (10:30 PM IST), record a screen/video showing:
1. The live score updating in real time
2. Making a bowling change decision
3. Setting a field placement on the interactive map
4. Gemini scoring the decision with the animated reveal
5. The leaderboard with ranked users

Post with: #GoogleCloud #GoogleCloudAPL #BuildWithAI
Tag: @GoogleCloud_IN

---

## Out of Scope (Tonight)

- ElevenLabs TTS / voice commentary (dropped to focus on core)
- Ball-by-ball granularity (over-by-over is our unit)
- Batting order suggestions (bowling + field is enough)
- Multi-match support
- Mobile-responsive layout (laptop/projector only tonight)
- Deployment (local dev + InsForge cloud backend)
- Team selection / toss prediction features

---

## Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Cricbuzz URL unknown until match starts | Have the URL pattern ready. Find it within first 5 min of the match. Can also search Cricbuzz homepage. |
| Cricbuzz page structure changes mid-match | Build a resilient parser with fallbacks. If parse fails, show raw score text. |
| Gemini returns inconsistent JSON | Enforce JSON-only in system prompt. Wrap in try-catch with retry. Validate schema before storing. |
| InsForge cold start delay | Init the project BEFORE the event. It should be warm by the time coding starts. |
| TinyFish rate limits at 30s polling | 30s is conservative. Can back off to 45s. Cache aggressively — if score hasn't changed, skip processing. |
| Google OAuth redirect issues locally | Use `localhost:3000` as redirect URI. Register it in InsForge OAuth config during setup phase. |
| Decision timing is off (prompt appears after captain already decided) | Buffer: show decision prompt when you detect an over is about to end (e.g., 5 balls bowled), not after it ends. |

---

## Definition of Done

1. User can sign in with Google
2. Live match score updates every 30 seconds
3. User receives bowling change prompts at the start of each over
4. User can set field placement on an interactive field map
5. Gemini scores each decision on 4 dimensions (0-100)
6. Leaderboard shows ranked users by total merit score
7. Screen recording posted to social media with required hashtags
