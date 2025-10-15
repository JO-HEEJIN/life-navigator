/**
 * Gmail Stress Level Endpoint
 * Vercel Serverless Function
 */

const { google } = require('googleapis');
const { oauth2Client, getUserTokens } = require('../_lib/oauth-config');

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
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                error: 'Missing user ID',
                message: 'userId parameter is required'
            });
        }

        // Check if user is authenticated
        const tokens = getUserTokens(userId);
        if (!tokens) {
            return res.status(401).json({
                error: 'Not authenticated',
                message: 'User must authenticate with Google OAuth first'
            });
        }

        // Set credentials for this user
        oauth2Client.setCredentials(tokens);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Fetch recent emails from inbox
        const emailsResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 50,
            q: 'in:inbox newer_than:7d'
        });

        const messages = emailsResponse.data.messages || [];
        const totalEmails = messages.length;

        // Stress keywords for analysis
        const stressKeywords = ['urgent', 'asap', 'deadline', 'critical', 'important', 'immediately', 'emergency', 'action required'];
        let urgentCount = 0;
        let unreadCount = 0;

        // Analyze email subjects and labels
        for (const message of messages.slice(0, 20)) {
            try {
                const emailDetails = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'metadata',
                    metadataHeaders: ['Subject']
                });

                const subject = emailDetails.data.payload.headers.find(h => h.name === 'Subject')?.value || '';
                const labelIds = emailDetails.data.labelIds || [];

                // Check for stress keywords
                if (stressKeywords.some(keyword => subject.toLowerCase().includes(keyword))) {
                    urgentCount++;
                }

                // Check if unread
                if (labelIds.includes('UNREAD')) {
                    unreadCount++;
                }
            } catch (err) {
                console.error('Error fetching email details:', err.message);
            }
        }

        // Calculate stress level based on actual data
        const urgentRatio = totalEmails > 0 ? urgentCount / totalEmails : 0;
        const unreadRatio = totalEmails > 0 ? unreadCount / totalEmails : 0;
        const baseStress = (urgentRatio * 0.6) + (unreadRatio * 0.4);

        const result = {
            type: 'email_stress',
            source: 'Gmail API (Real User Data)',
            quality: 'authenticated',
            user: {
                userId: userId
            },
            data: {
                stressLevel: parseFloat(baseStress.toFixed(3)),
                urgentCount: urgentCount,
                totalEmails: totalEmails,
                unreadCount: unreadCount
            },
            metadata: {
                timestamp: new Date().toISOString(),
                analyzedEmails: Math.min(20, totalEmails),
                cacheStatus: 'fresh'
            },
            interpretation: {
                stressPercentage: `${(baseStress * 100).toFixed(1)}%`,
                stressStatus: baseStress > 0.7 ? 'High Stress' : baseStress > 0.4 ? 'Moderate Stress' : 'Low Stress',
                recommendation: baseStress > 0.7
                    ? 'High email stress detected - consider blocking focus time and declining low-priority meetings'
                    : baseStress > 0.4
                    ? 'Moderate stress - manage inbox proactively'
                    : 'Email stress is low - good time for deep work',
                confidence: 'high'
            }
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('Gmail API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
