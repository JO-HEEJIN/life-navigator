/**
 * Life Navigator Frontend
 * Main application logic for personal productivity assistant
 * Architecture mirrors Farm Navigators app.js
 */

class LifeNavigator {
    constructor() {
        // Auto-detect API URL based on environment
        this.apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : '';  // Use relative URLs for Vercel (same domain)
        this.analyzer = new PersonalHealthAnalyzer();
        this.userData = {};
        this.currentUser = null;
        this.init();
    }

    /**
     * Initialize application
     * Similar to Farm Navigators initialization
     */
    init() {
        console.log('Initializing Life Navigator...');
        this.setupEventListeners();
        this.checkAuthStatus();
        console.log('Life Navigator ready');
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        const loadBtn = document.getElementById('load-data-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadAllData());
        }

        const googleSigninBtn = document.getElementById('google-signin-btn');
        if (googleSigninBtn) {
            googleSigninBtn.addEventListener('click', () => this.initiateGoogleLogin());
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    /**
     * Check authentication status on load
     */
    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/status`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.authenticated) {
                this.currentUser = data.userId;
                this.showDashboard();
            } else {
                this.showLoginPrompt();
            }

            // Check for OAuth callback
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('auth') === 'success') {
                window.history.replaceState({}, document.title, window.location.pathname);
                this.currentUser = data.userId;
                this.showDashboard();
                this.loadAllData();
            } else if (urlParams.get('auth') === 'error') {
                alert('Authentication failed. Please try again.');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showLoginPrompt();
        }
    }

    /**
     * Show login prompt
     */
    showLoginPrompt() {
        document.getElementById('login-prompt').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'none';
        document.getElementById('auth-status').textContent = '';
    }

    /**
     * Show dashboard
     */
    showDashboard() {
        document.getElementById('login-prompt').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        document.getElementById('auth-status').textContent = `✅ Signed in as ${this.currentUser}`;
    }

    /**
     * Initiate Google OAuth login
     */
    initiateGoogleLogin() {
        window.location.href = `${this.apiBaseUrl}/api/auth/google`;
    }

    /**
     * Logout
     */
    async logout() {
        try {
            await fetch(`${this.apiBaseUrl}/api/auth/logout`, {
                credentials: 'include'
            });
            this.currentUser = null;
            this.showLoginPrompt();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /**
     * Load all personal data from APIs
     * Similar to loadNASAData() in Farm Navigators
     */
    async loadAllData() {
        console.log('Loading personal data from all sources...');

        const loadBtn = document.getElementById('load-data-btn');
        if (loadBtn) {
            loadBtn.textContent = 'Loading...';
            loadBtn.disabled = true;
        }

        try {
            const userId = this.currentUser;

            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Parallel API calls - same pattern as NASA data loading
            const [emailResponse, calendarResponse, fitnessResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/api/gmail/stress-level?userId=${userId}`, {
                    credentials: 'include'
                }),
                fetch(`${this.apiBaseUrl}/api/calendar/schedule-health?userId=${userId}`, {
                    credentials: 'include'
                }),
                fetch(`${this.apiBaseUrl}/api/fitness/summary?userId=${userId}`, {
                    credentials: 'include'
                })
            ]);

            this.userData = {
                emails: await emailResponse.json(),
                calendar: await calendarResponse.json(),
                fitness: await fitnessResponse.json()
            };

            console.log('Personal data loaded:', this.userData);

            // Display individual data cards (like Satellite Data Cards)
            this.displayInsightCards();

            // Analyze overall health (like AR analysis)
            this.analyzeAndDisplayHealth();

        } catch (error) {
            console.error('Error loading personal data:', error);
            this.showError('Failed to load personal data. Make sure the proxy server is running on port 3002.');
        } finally {
            if (loadBtn) {
                loadBtn.textContent = 'Reload Data';
                loadBtn.disabled = false;
            }
        }
    }

    /**
     * Display individual insight cards
     * Similar to displaying Satellite Data Cards
     */
    displayInsightCards() {
        // Email stress card
        if (this.userData.emails) {
            const emailData = this.userData.emails;
            document.getElementById('email-stress-value').textContent =
                emailData.interpretation.stressPercentage;
            document.getElementById('email-stress-status').textContent =
                emailData.interpretation.stressStatus;

            const emailCard = document.getElementById('email-card');
            this.setCardColor(emailCard, emailData.data.stressLevel);
        }

        // Calendar health card
        if (this.userData.calendar) {
            const calData = this.userData.calendar;
            document.getElementById('calendar-health-value').textContent =
                `${calData.data.meetingCount} meetings`;
            document.getElementById('calendar-health-status').textContent =
                calData.interpretation.scheduleStatus;

            const calCard = document.getElementById('calendar-card');
            this.setCardColor(calCard, calData.data.meetingDensity);
        }

        // Fitness card
        if (this.userData.fitness) {
            const fitData = this.userData.fitness;
            document.getElementById('fitness-value').textContent =
                `${fitData.data.sleepDuration}h sleep`;
            document.getElementById('fitness-status').textContent =
                fitData.interpretation.sleepStatus;

            const fitCard = document.getElementById('fitness-card');
            const sleepScore = fitData.data.sleepDuration >= 7 ? 0.3 : 0.7;
            this.setCardColor(fitCard, sleepScore);
        }
    }

    /**
     * Set card color based on value
     * Green = good, Yellow = warning, Red = critical
     */
    setCardColor(card, value) {
        card.classList.remove('status-good', 'status-warning', 'status-critical');

        if (value < 0.4) {
            card.classList.add('status-good');
        } else if (value < 0.7) {
            card.classList.add('status-warning');
        } else {
            card.classList.add('status-critical');
        }
    }

    /**
     * Analyze overall health and display results
     * Similar to AR health score calculation
     */
    analyzeAndDisplayHealth() {
        const analysis = this.analyzer.analyzeProductivityHealth(this.userData);

        console.log('Health analysis result:', analysis);

        // Display overall score
        const scoreNumber = document.getElementById('score-number');
        const scoreStatus = document.getElementById('score-status');
        const scoreCircle = document.getElementById('score-circle');

        if (scoreNumber) {
            scoreNumber.textContent = analysis.score;
        }

        if (scoreStatus) {
            scoreStatus.textContent = analysis.status;
        }

        // Color code the score circle
        if (scoreCircle) {
            scoreCircle.classList.remove('score-excellent', 'score-good', 'score-fair', 'score-poor');
            if (analysis.score >= 80) {
                scoreCircle.classList.add('score-excellent');
            } else if (analysis.score >= 60) {
                scoreCircle.classList.add('score-good');
            } else if (analysis.score >= 40) {
                scoreCircle.classList.add('score-fair');
            } else {
                scoreCircle.classList.add('score-poor');
            }
        }

        // Display recommendations
        this.displayRecommendations(analysis.recommendations);

        // Display detailed insights
        this.displayDetailedInsights(analysis.insights);
    }

    /**
     * Display recommendations list
     * Similar to irrigation recommendations in Farm Game
     */
    displayRecommendations(recommendations) {
        const listElement = document.getElementById('recommendations-list');
        if (!listElement) return;

        if (recommendations.length === 0) {
            listElement.innerHTML = '<p class="placeholder">All metrics look good - no urgent actions needed!</p>';
            return;
        }

        listElement.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item priority-${rec.priority.toLowerCase()}">
                <div class="rec-header">
                    <span class="priority-badge">${rec.priority}</span>
                    <span class="category-badge">${rec.category}</span>
                </div>
                <h4>${rec.action}</h4>
                <p class="rec-reason">${rec.reason}</p>
            </div>
        `).join('');
    }

    /**
     * Display detailed insights breakdown
     */
    displayDetailedInsights(insights) {
        const detailElement = document.getElementById('insights-detail-content');
        if (!detailElement) return;

        detailElement.innerHTML = `
            <div class="insights-grid">
                <div class="insight-item">
                    <h4>Email Stress</h4>
                    <p class="insight-value">${(insights.emailStress * 100).toFixed(0)}%</p>
                    <p class="insight-impact ${insights.adjustments[0]?.impact > 0 ? 'positive' : 'negative'}">
                        ${insights.adjustments[0]?.impact > 0 ? '+' : ''}${insights.adjustments[0]?.impact || 0} points
                    </p>
                </div>
                <div class="insight-item">
                    <h4>Schedule Health</h4>
                    <p class="insight-value">${(insights.scheduleHealth * 100).toFixed(0)}% density</p>
                    <p class="insight-impact ${insights.adjustments[1]?.impact > 0 ? 'positive' : 'negative'}">
                        ${insights.adjustments[1]?.impact > 0 ? '+' : ''}${insights.adjustments[1]?.impact || 0} points
                    </p>
                </div>
                <div class="insight-item">
                    <h4>Sleep & Fitness</h4>
                    <p class="insight-value">${insights.fitnessHealth.toFixed(0)}% quality</p>
                    <p class="insight-impact ${insights.adjustments[2]?.impact > 0 ? 'positive' : 'negative'}">
                        ${insights.adjustments[2]?.impact > 0 ? '+' : ''}${insights.adjustments[2]?.impact || 0} points
                    </p>
                </div>
            </div>
            <div class="adjustments-summary">
                <h4>Score Breakdown</h4>
                ${insights.adjustments.map(adj => `
                    <div class="adjustment-row">
                        <span class="adj-category">${adj.category}</span>
                        <span class="adj-detail">${adj.detail}</span>
                        <span class="adj-impact ${adj.impact > 0 ? 'positive' : 'negative'}">
                            ${adj.impact > 0 ? '+' : ''}${adj.impact}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Show error message
     */
    showError(message) {
        const recList = document.getElementById('recommendations-list');
        if (recList) {
            recList.innerHTML = `
                <div class="error-message">
                    <h4>Error</h4>
                    <p>${message}</p>
                    <p class="hint">Run: <code>cd life_navigator && npm install && npm start</code></p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new LifeNavigator();
    window.lifeNavigator = app; // Make available for debugging
});
