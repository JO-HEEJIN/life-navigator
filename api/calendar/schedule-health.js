/**
 * Calendar Schedule Health Endpoint
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
        const { userId, date } = req.query;

        if (!userId) {
            return res.status(400).json({
                error: 'Missing user ID'
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
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Get today's events
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const eventsResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });

        const events = eventsResponse.data.items || [];
        const totalEvents = events.length;

        // Analyze events
        let meetingCount = 0;
        let meetingMinutes = 0;
        let declinableCount = 0;

        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay();
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];

        for (const event of events) {
            // Count as meeting if it has attendees
            if (event.attendees && event.attendees.length > 0) {
                meetingCount++;

                // Calculate duration
                const start = new Date(event.start.dateTime || event.start.date);
                const end = new Date(event.end.dateTime || event.end.date);
                const duration = (end - start) / (1000 * 60); // minutes
                meetingMinutes += duration;

                // Check if declinable (optional or tentative)
                const userResponse = event.attendees.find(a => a.self);
                if (userResponse && (userResponse.optional || userResponse.responseStatus === 'tentative')) {
                    declinableCount++;
                }
            }
        }

        // Calculate meeting density (8 work hours = 480 minutes)
        const workDayMinutes = 480;
        const meetingDensity = Math.min(1.0, meetingMinutes / workDayMinutes);
        const focusTimeHours = Math.max(0, (workDayMinutes - meetingMinutes) / 60);

        const result = {
            type: 'schedule_health',
            source: 'Google Calendar API (Real User Data)',
            quality: 'authenticated',
            user: {
                userId: userId
            },
            data: {
                meetingDensity: parseFloat(meetingDensity.toFixed(2)),
                totalEvents: totalEvents,
                meetingCount: meetingCount,
                focusTimeHours: parseFloat(focusTimeHours.toFixed(1)),
                declinableCount: declinableCount
            },
            metadata: {
                timestamp: new Date().toISOString(),
                dayOfWeek: dayName,
                dateRange: date || 'today',
                meetingMinutes: meetingMinutes
            },
            interpretation: {
                densityPercentage: `${(meetingDensity * 100).toFixed(0)}%`,
                scheduleStatus: meetingDensity > 0.6 ? 'Overbooked' : meetingDensity > 0.4 ? 'Busy' : 'Balanced',
                recommendation: meetingDensity > 0.6
                    ? `Consider declining ${declinableCount} optional meetings to create focus time`
                    : meetingDensity > 0.4
                    ? 'Schedule is busy but manageable'
                    : 'Schedule looks balanced - good day for focused work',
                focusTimeAvailable: `${focusTimeHours.toFixed(1)} hours`,
                confidence: 'high'
            }
        };

        res.status(200).json(result);

    } catch (error) {
        console.error('Calendar API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
