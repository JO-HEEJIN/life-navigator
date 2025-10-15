/**
 * Shared OAuth Configuration for Vercel Serverless Functions
 * Uses Redis for persistent token storage
 */

const { google } = require('googleapis');
const Redis = require('ioredis');

// Create Redis client
const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        tls: {
            rejectUnauthorized: false
        },
        maxRetriesPerRequest: 3
    })
    : null;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

async function getUserTokens(userId) {
    if (!redis) {
        console.error('Redis not configured');
        return null;
    }

    try {
        const tokensJson = await redis.get(`user_tokens:${userId}`);
        if (!tokensJson) return null;

        const tokens = JSON.parse(tokensJson);
        return tokens;
    } catch (error) {
        console.error('Error getting user tokens from Redis:', error);
        return null;
    }
}

async function setUserTokens(userId, tokens) {
    if (!redis) {
        console.error('Redis not configured');
        return;
    }

    try {
        // Store tokens in Redis with 24 hour expiration
        const tokensJson = JSON.stringify(tokens);
        await redis.setex(`user_tokens:${userId}`, 86400, tokensJson);
        oauth2Client.setCredentials(tokens);
        console.log('Tokens successfully stored in Redis for:', userId);
    } catch (error) {
        console.error('Error setting user tokens in Redis:', error);
    }
}

module.exports = {
    oauth2Client,
    getUserTokens,
    setUserTokens,
    redis
};
