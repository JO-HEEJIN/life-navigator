/**
 * OAuth Callback Endpoint
 * Vercel Serverless Function
 */

const { google } = require('googleapis');
const { oauth2Client, setUserTokens } = require('../_lib/oauth-config');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { code } = req.query;

    if (!code) {
        res.writeHead(302, { Location: 'https://life-navigator-ten.vercel.app/?auth=error' });
        return res.end();
    }

    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const userId = userInfo.data.email;

        // Store tokens (in production, use Redis or database)
        setUserTokens(userId, tokens);

        // Set cookie with userId
        res.setHeader('Set-Cookie', `userId=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

        // Redirect to frontend with success
        res.writeHead(302, { Location: 'https://life-navigator-ten.vercel.app/?auth=success' });
        return res.end();
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.writeHead(302, { Location: 'https://life-navigator-ten.vercel.app/?auth=error' });
        return res.end();
    }
};
