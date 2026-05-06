# Cricket Coaching Simulator - IPL 2026

Real-time cricket coaching simulator for the Agentic Premier League Hackathon. Make tactical decisions during live IPL matches and get scored by Gemini AI.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up InsForge Database

Run the SQL in `database-setup.sql` in your InsForge dashboard:
1. Go to your InsForge project: https://x4y2m2m3.ap-southeast.insforge.app
2. Navigate to Database → SQL Editor
3. Paste and execute the contents of `database-setup.sql`
4. Enable Google OAuth in Authentication → Providers

### 3. Update Environment Variables

The `.env.local` file is already configured with your keys. Update the Cricbuzz URL when the match starts:

```env
CRICBUZZ_SCORECARD_URL=https://www.cricbuzz.com/live-cricket-scores/{match-id}/srh-vs-pbks-ipl-2026
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Architecture

- **Frontend**: Next.js 16 (App Router) + React + TypeScript
- **UI**: shadcn/ui + Tailwind CSS (dark theme)
- **Backend**: InsForge (Postgres + Auth)
- **Live Data**: TinyFish API (Cricbuzz scraping)
- **AI Scoring**: Google Gemini 2.0 Flash

## Features

✓ Google OAuth authentication  
✓ Live match polling every 30 seconds  
✓ Bowling change decisions at start of each over  
✓ Field placement with 9-zone model  
✓ Gemini AI tactical scoring (4 dimensions, 0-100)  
✓ Real-time leaderboard  
✓ Dark theme UI  

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page with Google OAuth
│   ├── game/
│   │   ├── page.tsx                # Main game board
│   │   ├── leaderboard/page.tsx    # Leaderboard view
│   │   └── layout.tsx              # Game shell with auth
│   ├── api/
│   │   ├── match/live/route.ts     # Live match data
│   │   ├── decision/submit/route.ts # Submit decisions
│   │   ├── decision/score/route.ts  # Gemini scoring
│   │   └── leaderboard/route.ts     # Leaderboard query
│   └── auth/callback/page.tsx      # OAuth callback
├── components/
│   ├── ScoreBar.tsx                # Live score display
│   ├── DecisionCard.tsx            # Decision prompt UI
│   ├── FieldMap.tsx                # Field placement grid
│   ├── ScoreReveal.tsx             # Score animation
│   └── Leaderboard.tsx             # Leaderboard table
├── hooks/
│   └── useMatchPolling.ts          # Match data polling
└── lib/
    ├── types.ts                    # TypeScript interfaces
    ├── tinyfish.ts                 # TinyFish API client
    ├── cricbuzz-parser.ts          # Cricbuzz data parser
    ├── gemini.ts                   # Gemini AI scoring
    └── insforge.ts                 # InsForge SDK client
```

## How It Works

1. **User signs in** with Google OAuth
2. **Match data polls** every 30s from Cricbuzz via TinyFish
3. **Tactical moments detected** (new over, wicket, powerplay transition)
4. **User makes decision** (bowling change or field placement)
5. **Decision submitted** to InsForge database
6. **Gemini AI scores** the decision on 4 dimensions (0-100 total)
7. **Leaderboard updates** with ranked users

## Match Configuration

Update these in `.env.local` before the match:
- `CRICBUZZ_SCORECARD_URL` - Live scorecard URL
- `NEXT_PUBLIC_MATCH_ID` - Match identifier

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Database | InsForge (PostgreSQL) |
| Auth | InsForge Google OAuth |
| Live Data | TinyFish API |
| AI | Google Gemini 2.0 Flash |

## Built For

GDG Hyderabad — Agentic Premier League  
Match: SRH vs PBKS, IPL 2026, Match 49  
Date: 6 May 2026

## License

MIT
