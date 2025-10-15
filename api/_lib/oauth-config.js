/**
 * Shared OAuth Configuration for Vercel Serverless Functions
 * Uses Upstash Redis for persistent token storage
 */

const { google } = require('googleapis');
const { Redis } = require('@upstash/redis');

// Create Upstash Redis client
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    })
    : null;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

async function getUserTokens(userId) {
    if (!redis) {
        console.error('Upstash Redis not configured - missing KV_REST_API_URL or KV_REST_API_TOKEN');
        return null;
    }

    try {
        const tokens = await redis.get(`user_tokens:${userId}`);
        if (!tokens) {
            console.log('No tokens found for user:', userId);
            return null;
        }

        console.log('Tokens retrieved from Upstash for:', userId);
        return tokens;
    } catch (error) {
        console.error('Error getting user tokens from Upstash:', error);
        return null;
    }
}

async function setUserTokens(userId, tokens) {
    if (!redis) {
        console.error('Upstash Redis not configured - missing KV_REST_API_URL or KV_REST_API_TOKEN');
        return;
    }

    try {
        // Store tokens in Upstash Redis with 24 hour expiration
        await redis.set(`user_tokens:${userId}`, tokens, { ex: 86400 });
        oauth2Client.setCredentials(tokens);
        console.log('Tokens successfully stored in Upstash for:', userId);
    } catch (error) {
        console.error('Error setting user tokens in Upstash:', error);
    }
}

module.exports = {
    oauth2Client,
    getUserTokens,
    setUserTokens,
    redis
};
