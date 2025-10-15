/**
 * Shared OAuth Configuration for Vercel Serverless Functions
 * Uses Vercel KV (Redis) for persistent token storage
 */

const { google } = require('googleapis');
const { kv } = require('@vercel/kv');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

async function getUserTokens(userId) {
    try {
        const tokens = await kv.get(`user_tokens:${userId}`);
        return tokens;
    } catch (error) {
        console.error('Error getting user tokens from Redis:', error);
        return null;
    }
}

async function setUserTokens(userId, tokens) {
    try {
        // Store tokens in Redis with 24 hour expiration
        await kv.set(`user_tokens:${userId}`, tokens, { ex: 86400 });
        oauth2Client.setCredentials(tokens);
    } catch (error) {
        console.error('Error setting user tokens in Redis:', error);
    }
}

module.exports = {
    oauth2Client,
    getUserTokens,
    setUserTokens
};
