/**
 * Redis Connection Test Endpoint
 */

const Redis = require('ioredis');

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            return res.status(500).json({
                success: false,
                error: 'REDIS_URL environment variable not found',
                env: Object.keys(process.env).filter(k => k.includes('REDIS'))
            });
        }

        const redis = new Redis(redisUrl, {
            tls: {
                rejectUnauthorized: false
            },
            maxRetriesPerRequest: 3,
            connectTimeout: 10000
        });

        // Test connection
        await redis.ping();

        // Test write
        const testKey = 'test_connection';
        const testValue = { timestamp: new Date().toISOString(), test: 'success' };
        await redis.setex(testKey, 60, JSON.stringify(testValue));

        // Test read
        const retrieved = await redis.get(testKey);
        const parsedValue = JSON.parse(retrieved);

        await redis.quit();

        res.status(200).json({
            success: true,
            message: 'Redis connection successful',
            test: {
                written: testValue,
                retrieved: parsedValue,
                match: testValue.timestamp === parsedValue.timestamp
            },
            redisUrl: redisUrl.replace(/:[^:@]+@/, ':****@') // Hide password
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            redisUrl: process.env.REDIS_URL ? 'present' : 'missing'
        });
    }
};
