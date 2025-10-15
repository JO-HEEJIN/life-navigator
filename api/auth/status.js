/**
 * Auth Status Check Endpoint
 * Vercel Serverless Function
 */

const { getUserTokens } = require('../_lib/oauth-config');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Parse cookies
        const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {}) || {};

        const userId = cookies.userId;

        if (userId && getUserTokens(userId)) {
            return res.status(200).json({
                authenticated: true,
                userId: userId
            });
        }

        res.status(200).json({ authenticated: false });
    } catch (error) {
        console.error('Auth status error:', error);
        res.status(500).json({ error: 'Failed to check auth status' });
    }
};
