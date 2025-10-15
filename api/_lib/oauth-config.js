/**
 * Shared OAuth Configuration for Vercel Serverless Functions
 */

const { google } = require('googleapis');

// In-memory token storage (for demo - use database in production)
const userTokens = new Map();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://life-navigator.vercel.app/api/auth/callback'
);

function getUserTokens(userId) {
    return userTokens.get(userId);
}

function setUserTokens(userId, tokens) {
    userTokens.set(userId, tokens);
    oauth2Client.setCredentials(tokens);
}

module.exports = {
    oauth2Client,
    getUserTokens,
    setUserTokens,
    userTokens
};
