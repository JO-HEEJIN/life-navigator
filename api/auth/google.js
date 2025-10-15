/**
 * OAuth Google Login Endpoint
 * Vercel Serverless Function
 */

const { oauth2Client } = require('../_lib/oauth-config');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Debug: Check environment variables
        console.log('Environment check:', {
            hasClientId: !!process.env.GOOGLE_CLIENT_ID,
            hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
            hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
            redirectUri: process.env.GOOGLE_REDIRECT_URI
        });

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            prompt: 'consent'
        });

        console.log('Generated auth URL:', authUrl);

        res.writeHead(302, { Location: authUrl });
        return res.end();
    } catch (error) {
        console.error('OAuth initiation error:', error);
        res.status(500).json({ error: 'OAuth initiation failed', message: error.message });
    }
};
