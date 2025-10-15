# Life Navigator

Personal AI Assistant for productivity and health optimization, powered by real-time Google API data and NASA's Farm Navigators architecture.

**Live Demo**: https://life-navigator-ten.vercel.app

## Project Overview

Life Navigator applies the same 4-layer data-driven architecture from Farm Navigators to personal productivity:

- **Farm Navigators**: NASA Satellites (SMAP, MODIS, Landsat) → Soil health analysis → Irrigation recommendations
- **Life Navigator**: Personal APIs (Gmail, Calendar) → Stress & schedule analysis → Life optimization recommendations

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Data Ingestion (Google APIs)                 │
│  - Gmail API: Email stress analysis                     │
│  - Calendar API: Schedule density tracking              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Vercel Serverless Functions (Proxy)          │
│  - /api/gmail/stress-level                              │
│  - /api/calendar/schedule-health                        │
│  - OAuth 2.0 authentication                             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: AI Analysis (PersonalHealthAnalyzer)         │
│  - Stress level calculation                             │
│  - Schedule optimization                                │
│  - Overall health scoring (0-100)                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Recommendations & Visualization              │
│  - Priority-based action items                          │
│  - Data cards (mirrors Satellite Data Cards)            │
│  - Health score dashboard                               │
└─────────────────────────────────────────────────────────┘
```

## Features

- **Google OAuth 2.0**: Secure authentication with Gmail and Calendar access
- **Email Stress Analysis**: Real-time analysis of urgent emails and unread count
- **Calendar Health**: Meeting density tracking and focus time optimization
- **AI-Powered Insights**: Personalized recommendations based on your data
- **Serverless Architecture**: Vercel Edge Functions for global performance
- **Redis Token Storage**: Upstash Redis for secure OAuth token persistence

## Tech Stack

### Frontend
- Vanilla JavaScript
- HTML5
- CSS3
- NASA Space Apps Challenge color palette

### Backend
- Node.js
- Vercel Serverless Functions
- Google APIs (Gmail API, Calendar API, OAuth 2.0)
- googleapis npm package
- Upstash Redis for token storage

### Infrastructure
- Vercel (hosting and serverless functions)
- Upstash Redis (Vercel KV)
- GitHub (version control and CI/CD)

## Quick Start

Visit the live demo: https://life-navigator-ten.vercel.app

1. Click "Sign in with Google"
2. Authorize Gmail and Calendar access
3. Click "Load Data" to see your personal insights
4. Get AI-powered recommendations for productivity optimization

## Local Development

### Prerequisites
- Node.js 18 or higher
- Google Cloud Console project with OAuth 2.0 credentials
- Vercel account
- Upstash Redis (Vercel KV)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JO-HEEJIN/life-navigator.git
cd life_navigator
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google OAuth 2.0:
   - Go to Google Cloud Console
   - Create a new project or select existing one
   - Enable Gmail API and Google Calendar API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - http://localhost:3000/api/auth/callback (local)
     - https://your-app.vercel.app/api/auth/callback (production)

4. Create `.env.local` file:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=your_random_secret_here

# Upstash Redis (from Vercel KV)
KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token
KV_URL=your_redis_url
```

5. Run locally:
```bash
npm start
```

Visit http://localhost:3000

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Set up Upstash Redis (Vercel KV):
   - Go to Vercel Dashboard → Your Project
   - Navigate to Storage tab
   - Click Create Database → KV
   - Name it `life-navigator-kv`
   - Connect to all environments (Development, Preview, Production)
   - Leave Custom Prefix empty

5. Add environment variables in Vercel:
   - Go to Settings → Environment Variables
   - Add:
     - GOOGLE_CLIENT_ID
     - GOOGLE_CLIENT_SECRET
     - GOOGLE_REDIRECT_URI (use your Vercel domain)
     - SESSION_SECRET

6. Publish Google OAuth App:
   - Go to Google Cloud Console → OAuth consent screen
   - Click PUBLISH APP to make it production-ready
   - This allows anyone to sign in

7. Redeploy after adding environment variables

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/status` - Check authentication status
- `GET /api/auth/logout` - Logout user

### Data APIs
- `GET /api/gmail/stress-level?userId={email}` - Email stress analysis
- `GET /api/calendar/schedule-health?userId={email}` - Calendar health metrics

### Testing
- `GET /api/test-redis` - Test Upstash Redis connection

## Project Structure

```
life_navigator/
├── api/                          # Vercel Serverless Functions
│   ├── _lib/
│   │   └── oauth-config.js      # Shared OAuth & Redis config
│   ├── auth/
│   │   ├── google.js            # OAuth initiation
│   │   ├── callback.js          # OAuth callback handler
│   │   ├── status.js            # Auth status check
│   │   └── logout.js            # Logout endpoint
│   ├── gmail/
│   │   └── stress-level.js      # Gmail stress analysis
│   ├── calendar/
│   │   └── schedule-health.js   # Calendar analysis
│   └── test-redis.js            # Redis connection test
├── src/
│   ├── life-navigator.js        # Main application logic
│   └── PersonalHealthAnalyzer.js # AI analysis engine
├── styles/
│   └── life-navigator.css       # Application styles
├── index.html                   # Main HTML page
├── vercel.json                  # Vercel configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Security & Privacy

- OAuth tokens stored in Upstash Redis with 24-hour expiration
- HTTP-only cookies for session management
- No permanent data storage (privacy-first design)
- Serverless functions run in isolated environments
- All data processing happens in real-time

## Contributing

This project was built for Zain's portfolio demonstration. Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Architecture inspired by NASA Farm Navigators
- Powered by Google APIs
- Infrastructure by Vercel and Upstash

## Contact

**Live Demo**: https://life-navigator-ten.vercel.app

**Repository**: https://github.com/JO-HEEJIN/life-navigator

**Developer**: JO-HEEJIN

---

Built using NASA's Farm Navigators architecture pattern
