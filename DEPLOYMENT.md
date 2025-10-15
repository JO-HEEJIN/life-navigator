# Life Navigator - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Google Cloud Console**: OAuth credentials created
3. **Git**: Project in a Git repository

## Step 1: Update Google OAuth Redirect URI

Go to Google Cloud Console → APIs & Services → Credentials

Update **Authorized redirect URIs** to include:
```
https://your-project-name.vercel.app/api/auth/callback
```

Example:
```
https://life-navigator.vercel.app/api/auth/callback
```

## Step 2: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Set **Root Directory**: `life_navigator`
5. Click "Deploy"

### Option B: Via Vercel CLI

```bash
cd /Users/momo/kisanAI/life_navigator
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (Select your account)
- Link to existing project? **N**
- Project name? **life-navigator**
- Directory? **./` (current directory)
- Override settings? **N**

## Step 4: Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables

Add these variables:

| Variable Name | Value | Source |
|---------------|-------|--------|
| `GOOGLE_CLIENT_ID` | `501768218129-8vfqcj66e5n4heomi1u0ftsc4ks5tp1a.apps.googleusercontent.com` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `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Your` | Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://life-navigator.vercel.app/api/auth/callback` | Your Vercel URL |
| `SESSION_SECRET` | `random-secret-key-change-in-production-2024` | Generate random string |

**Important**: Generate a new `SESSION_SECRET` using:
```bash
openssl rand -base64 32
```

## Step 5: Redeploy

After setting environment variables, redeploy:

```bash
vercel --prod
```

Or in Vercel Dashboard → Deployments → Redeploy

## Step 6: Test Production Deployment

1. Visit: `https://life-navigator.vercel.app`
2. Click "Sign in with Google"
3. Grant permissions
4. Test "Load My Data" button
5. Verify real Gmail and Calendar data loads

## Architecture on Vercel

```
life-navigator.vercel.app/
├── index.html                          # Static frontend
├── src/                                # Frontend JavaScript
├── styles/                             # CSS
└── api/                                # Serverless Functions
    ├── auth/
    │   ├── google.js                   # GET /api/auth/google
    │   ├── callback.js                 # GET /api/auth/callback
    │   └── status.js                   # GET /api/auth/status
    ├── gmail/
    │   └── stress-level.js             # GET /api/gmail/stress-level
    └── calendar/
        └── schedule-health.js          # GET /api/calendar/schedule-health
```

Each API route is a **serverless function** that runs on-demand.

## Troubleshooting

### Issue: OAuth redirect fails
**Solution**: Verify redirect URI in Google Cloud Console matches Vercel URL exactly

### Issue: API returns 401 Unauthorized
**Solution**: Check that environment variables are set correctly in Vercel

### Issue: "User not authenticated" error
**Solution**: Clear cookies and re-authenticate

### Issue: Serverless function timeout
**Solution**: Vercel free tier has 10s timeout - Gmail/Calendar APIs should respond faster

## Production Considerations

### Current Setup (Demo):
- In-memory token storage (lost on function cold start)
- No database
- No refresh token handling

### For Production Use:
1. **Add Database**: Use Vercel KV or Redis for token storage
2. **Token Refresh**: Implement automatic token refresh
3. **Rate Limiting**: Add rate limiting to API endpoints
4. **Error Handling**: Improve error messages
5. **Analytics**: Add usage analytics
6. **Monitoring**: Set up error monitoring (Sentry)

## Cost Estimate

**Vercel Free Tier Limits:**
- 100 GB bandwidth/month
- 100 hours serverless function execution/month
- Unlimited deployments

**Expected Usage:**
- Each "Load My Data" request = ~3-5 API calls
- Average 100ms per API call
- 1000 users × 10 loads/month = 10,000 requests
- Total: ~1,000 seconds = **0.3 hours** (well within free tier)

## Security Notes

1. **HTTPS Only**: Vercel automatically provides HTTPS
2. **Environment Variables**: Never commit `.env` to Git
3. **OAuth Scopes**: Minimal scopes (readonly only)
4. **CORS**: Configured to allow only your domain
5. **Session Cookies**: HttpOnly, SameSite=Lax

## Next Steps After Deployment

1. Test with real user (yourself) first
2. Share link with Zain for demo
3. Monitor Vercel function logs for errors
4. Gather user feedback
5. Iterate based on usage patterns

## Demo URL for Zain

After deployment, share:
```
https://life-navigator.vercel.app
```

With message:
> "This demonstrates our Farm Navigators architecture applied to personal productivity.
> Same 4-layer system (Data → Proxy → Analysis → Presentation), different domain.
> Sign in with your Google account to see real-time analysis of your Gmail and Calendar."
