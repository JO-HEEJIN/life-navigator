/**
 * Upstash Redis Connection Test Endpoint
 */

const { Redis } = require('@upstash/redis');

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const kvUrl = process.env.KV_REST_API_URL;
        const kvToken = process.env.KV_REST_API_TOKEN;

        if (!kvUrl || !kvToken) {
            return res.status(500).json({
                success: false,
                error: 'Upstash Redis environment variables not found',
                env: {
                    KV_REST_API_URL: kvUrl ? 'present' : 'missing',
                    KV_REST_API_TOKEN: kvToken ? 'present' : 'missing',
                    allKVVars: Object.keys(process.env).filter(k => k.startsWith('KV_'))
                }
            });
        }

        const redis = new Redis({
            url: kvUrl,
            token: kvToken,
        });

        // Test write
        const testKey = 'test_connection';
        const testValue = { timestamp: new Date().toISOString(), test: 'Upstash success' };
        await redis.set(testKey, testValue, { ex: 60 });

        // Test read
        const retrieved = await redis.get(testKey);

        res.status(200).json({
            success: true,
            message: 'Upstash Redis connection successful',
            test: {
                written: testValue,
                retrieved: retrieved,
                match: testValue.timestamp === retrieved.timestamp
            },
            config: {
                url: kvUrl.substring(0, 30) + '...',
                token: 'present'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};
