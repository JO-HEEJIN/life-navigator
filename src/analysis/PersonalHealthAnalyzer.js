/**
 * Personal Health Analyzer
 * Analyzes productivity, stress, and health patterns from personal data
 * Architecture mirrors AR surface analysis from Farm Navigators
 */

class PersonalHealthAnalyzer {
    constructor() {
        this.initialized = true;
    }

    /**
     * Main analysis function - combines all data sources
     * Similar to analyzeSurfaceType() in Farm Navigators
     */
    analyzeProductivityHealth(userData) {
        console.log('Starting personal health analysis...');

        let baseScore = 50; // Start at neutral (similar to AR scoring)
        const insights = {
            emailStress: 0,
            scheduleHealth: 0,
            fitnessHealth: 0,
            adjustments: []
        };

        // Email stress analysis (similar to pixel color analysis)
        if (userData.emails) {
            const emailAnalysis = this.calculateEmailStress(userData.emails.data);
            baseScore += emailAnalysis.scoreAdjustment;
            insights.emailStress = emailAnalysis.stressLevel;
            insights.adjustments.push({
                category: 'Email Stress',
                impact: emailAnalysis.scoreAdjustment,
                detail: emailAnalysis.interpretation.stressStatus
            });
        }

        // Calendar density analysis (similar to NDVI calculation)
        if (userData.calendar) {
            const calendarAnalysis = this.calculateMeetingDensity(userData.calendar.data);
            baseScore += calendarAnalysis.scoreAdjustment;
            insights.scheduleHealth = calendarAnalysis.density;
            insights.adjustments.push({
                category: 'Schedule Health',
                impact: calendarAnalysis.scoreAdjustment,
                detail: calendarAnalysis.interpretation.scheduleStatus
            });
        }

        // Fitness/sleep analysis (similar to temperature analysis)
        if (userData.fitness) {
            const fitnessAnalysis = this.analyzeSleepPattern(userData.fitness.data);
            baseScore += fitnessAnalysis.scoreAdjustment;
            insights.fitnessHealth = fitnessAnalysis.overallHealth;
            insights.adjustments.push({
                category: 'Sleep & Activity',
                impact: fitnessAnalysis.scoreAdjustment,
                detail: fitnessAnalysis.interpretation.sleepStatus
            });
        }

        // Cap score at 0-100 range
        const finalScore = Math.max(0, Math.min(100, baseScore));

        // Generate recommendations (similar to irrigation advice)
        const recommendations = this.generateRecommendations(userData, finalScore, insights);

        return {
            score: finalScore,
            status: this.getStatusText(finalScore),
            insights: insights,
            recommendations: recommendations,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Email stress calculation
     * Similar to pixel color ratio analysis in AR
     */
    calculateEmailStress(emailData) {
        if (!emailData) {
            return {
                stressLevel: 0,
                scoreAdjustment: 0,
                interpretation: { stressStatus: 'No data' }
            };
        }

        const stressLevel = emailData.stressLevel || 0;
        const urgentCount = emailData.urgentCount || 0;
        const totalEmails = emailData.totalEmails || 1;

        // Calculate score adjustment (high stress = negative score)
        let scoreAdjustment = 0;

        if (stressLevel < 0.3) {
            scoreAdjustment = 20; // Low stress = bonus points
        } else if (stressLevel < 0.5) {
            scoreAdjustment = 10; // Moderate stress = small bonus
        } else if (stressLevel < 0.7) {
            scoreAdjustment = -10; // High stress = penalty
        } else {
            scoreAdjustment = -25; // Very high stress = large penalty
        }

        // Additional penalty for many urgent emails
        if (urgentCount > 3) {
            scoreAdjustment -= 10;
        }

        return {
            stressLevel: stressLevel,
            urgentCount: urgentCount,
            scoreAdjustment: scoreAdjustment,
            interpretation: {
                stressStatus: stressLevel > 0.7 ? 'High Stress' : stressLevel > 0.4 ? 'Moderate Stress' : 'Low Stress',
                stressPercentage: `${(stressLevel * 100).toFixed(0)}%`
            }
        };
    }

    /**
     * Calendar meeting density calculation
     * Similar to NDVI vegetation index calculation
     */
    calculateMeetingDensity(calendarData) {
        if (!calendarData) {
            return {
                density: 0,
                scoreAdjustment: 0,
                interpretation: { scheduleStatus: 'No data' }
            };
        }

        const density = calendarData.meetingDensity || 0;
        const focusTime = calendarData.focusTimeHours || 0;
        const declinableCount = calendarData.declinableCount || 0;

        // Calculate score adjustment (balanced schedule = bonus)
        let scoreAdjustment = 0;

        if (density < 0.4) {
            scoreAdjustment = 20; // Well-balanced schedule
        } else if (density < 0.6) {
            scoreAdjustment = 5; // Slightly busy but manageable
        } else if (density < 0.8) {
            scoreAdjustment = -15; // Overbooked
        } else {
            scoreAdjustment = -30; // Severely overbooked
        }

        // Bonus for having focus time
        if (focusTime >= 3) {
            scoreAdjustment += 10;
        }

        return {
            density: density,
            focusTime: focusTime,
            declinableCount: declinableCount,
            scoreAdjustment: scoreAdjustment,
            interpretation: {
                scheduleStatus: density > 0.6 ? 'Overbooked' : density > 0.4 ? 'Busy' : 'Balanced',
                densityPercentage: `${(density * 100).toFixed(0)}%`
            }
        };
    }

    /**
     * Sleep and activity pattern analysis
     * Similar to temperature and environmental analysis
     */
    analyzeSleepPattern(fitnessData) {
        if (!fitnessData) {
            return {
                overallHealth: 0,
                scoreAdjustment: 0,
                interpretation: { sleepStatus: 'No data' }
            };
        }

        const sleepDuration = fitnessData.sleepDuration || 0;
        const sleepQuality = fitnessData.sleepQuality || 0;
        const stressLevel = fitnessData.stressLevel || 0;
        const dailySteps = fitnessData.dailySteps || 0;

        let scoreAdjustment = 0;

        // Sleep duration analysis
        if (sleepDuration >= 7 && sleepDuration <= 9) {
            scoreAdjustment += 20; // Optimal sleep
        } else if (sleepDuration >= 6) {
            scoreAdjustment += 5; // Acceptable sleep
        } else if (sleepDuration < 6) {
            scoreAdjustment -= 20; // Sleep deprived
        }

        // Sleep quality bonus
        if (sleepQuality > 0.7) {
            scoreAdjustment += 10;
        } else if (sleepQuality < 0.5) {
            scoreAdjustment -= 10;
        }

        // Activity level
        if (dailySteps >= 8000) {
            scoreAdjustment += 10; // Active
        } else if (dailySteps < 3000) {
            scoreAdjustment -= 10; // Sedentary
        }

        // Stress penalty
        if (stressLevel > 0.7) {
            scoreAdjustment -= 15;
        }

        const overallHealth = sleepQuality * 100;

        return {
            overallHealth: overallHealth,
            sleepDuration: sleepDuration,
            sleepQuality: sleepQuality,
            stressLevel: stressLevel,
            scoreAdjustment: scoreAdjustment,
            interpretation: {
                sleepStatus: sleepDuration < 6 ? 'Sleep Deprived' : sleepDuration < 7 ? 'Insufficient Sleep' : 'Healthy Sleep',
                activityStatus: dailySteps < 5000 ? 'Sedentary' : dailySteps < 8000 ? 'Lightly Active' : 'Active'
            }
        };
    }

    /**
     * Generate actionable recommendations
     * Similar to irrigation recommendations in Farm Navigators
     */
    generateRecommendations(userData, score, insights) {
        const recommendations = [];

        // Email stress recommendations
        if (insights.emailStress > 0.7) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Block 2 hours for deep work tomorrow',
                reason: 'High email stress detected - need uninterrupted focus time',
                category: 'Email Management'
            });
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Set up email filters for urgent keywords',
                reason: 'Reduce reactive email checking',
                category: 'Email Management'
            });
        }

        // Schedule recommendations
        if (userData.calendar && userData.calendar.data.meetingDensity > 0.6) {
            const declinableCount = userData.calendar.data.declinableCount || 0;
            recommendations.push({
                priority: 'HIGH',
                action: `Decline ${declinableCount} optional meetings this week`,
                reason: 'Schedule overbooked - create focus time',
                category: 'Calendar Optimization'
            });
        }

        // Fitness recommendations
        if (userData.fitness && userData.fitness.data.sleepDuration < 6) {
            recommendations.push({
                priority: 'CRITICAL',
                action: 'Aim for 7-8 hours of sleep tonight',
                reason: 'Sleep deprivation affecting productivity and health',
                category: 'Health & Wellness'
            });
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Reduce screen time 1 hour before bed',
                reason: 'Improve sleep quality',
                category: 'Health & Wellness'
            });
        }

        // Activity recommendations
        if (userData.fitness && userData.fitness.data.dailySteps < 5000) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Take a 15-minute walk during lunch',
                reason: 'Low daily activity detected - boost energy and focus',
                category: 'Health & Wellness'
            });
        }

        // Overall productivity recommendation
        if (score < 40) {
            recommendations.push({
                priority: 'CRITICAL',
                action: 'Schedule a personal review meeting with yourself',
                reason: 'Multiple health and productivity indicators are concerning',
                category: 'Overall Wellness'
            });
        }

        // Positive reinforcement
        if (score >= 80) {
            recommendations.push({
                priority: 'INFO',
                action: 'Great job! Maintain current healthy habits',
                reason: 'All productivity and health metrics look excellent',
                category: 'Positive Feedback'
            });
        }

        return recommendations;
    }

    /**
     * Get status text from score
     * Similar to AR health score interpretation
     */
    getStatusText(score) {
        if (score >= 80) {
            return 'Excellent - Thriving';
        } else if (score >= 60) {
            return 'Good - Sustainable';
        } else if (score >= 40) {
            return 'Fair - Needs Attention';
        } else if (score >= 20) {
            return 'Poor - Action Required';
        } else {
            return 'Critical - Immediate Intervention Needed';
        }
    }
}

// Export for use in frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalHealthAnalyzer;
}
