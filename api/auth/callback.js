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
    const redirectBase = 'https://life-navigator-ten.vercel.app';

    if (!code) {
        return res.status(302).redirect(`${redirectBase}/?auth=error`);
    }

    try {
        console.log('Starting OAuth token exchange...');

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        console.log('Token exchange successful');

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const userId = userInfo.data.email;

        console.log('User authenticated:', userId);

        // Store tokens in Redis
        await setUserTokens(userId, tokens);
        console.log('Tokens stored in Redis for user:', userId);

        // Set cookie with userId
        res.setHeader('Set-Cookie', `userId=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

        // Redirect to frontend with success
        console.log('Redirecting to success page...');
        return res.status(302).redirect(`${redirectBase}/?auth=success`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        return res.status(302).redirect(`${redirectBase}/?auth=error`);
    }
};
