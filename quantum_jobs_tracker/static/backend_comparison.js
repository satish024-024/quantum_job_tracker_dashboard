// Backend Comparison and Queue Management System
// Provides detailed comparison of quantum backends and queue optimization

class BackendComparisonSystem {
    constructor() {
        this.backends = new Map();
        this.queueHistory = new Map();
        this.comparisonData = null;
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        console.log('🔄 Initializing Backend Comparison System...');
        this.setupComparisonInterface();
        this.startDataCollection();
        this.createComparisonWidget();
    }

    setupComparisonInterface() {
        // Add comparison button to backends widget
        const backendsWidget = document.querySelector('.backends-widget .widget-controls');
        if (backendsWidget) {
            const compareBtn = document.createElement('button');
            compareBtn.className = 'widget-btn compare-btn';
            compareBtn.innerHTML = '<i class="fas fa-balance-scale"></i>';
            compareBtn.title = 'Compare Backends';
            compareBtn.addEventListener('click', () => this.showComparisonModal());
            backendsWidget.appendChild(compareBtn);
        }
    }

    createComparisonWidget() {
        // Create comparison modal
        const modal = document.createElement('div');
        modal.id = 'backend-comparison-modal';
        modal.className = 'comparison-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-balance-scale"></i> Backend Comparison</h2>
                    <button class="close-btn" id="close-comparison-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="comparison-controls">
                        <div class="filter-section">
                            <label>Filter by Status:</label>
                            <select id="status-filter">
                                <option value="all">All Backends</option>
                                <option value="online">Online Only</option>
                                <option value="offline">Offline Only</option>
                            </select>
                        </div>
                        <div class="sort-section">
                            <label>Sort by:</label>
                            <select id="sort-option">
                                <option value="queue">Queue Length</option>
                                <option value="qubits">Number of Qubits</option>
                                <option value="availability">Availability</option>
                                <option value="performance">Performance Score</option>
                            </select>
                        </div>
                        <button class="refresh-btn" id="refresh-comparison">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    <div class="comparison-table-container">
                        <table class="comparison-table" id="comparison-table">
                            <thead>
                                <tr>
                                    <th>Backend</th>
                                    <th>Status</th>
                                    <th>Qubits</th>
                                    <th>Queue</th>
                                    <th>Avg Wait Time</th>
                                    <th>Success Rate</th>
                                    <th>Performance</th>
                                    <th>Recommendation</th>
                                </tr>
                            </thead>
                            <tbody id="comparison-tbody">
                                <!-- Comparison data will be populated here -->
                            </tbody>
                        </table>
                    </div>
                    <div class="comparison-insights">
                        <h3>💡 Insights & Recommendations</h3>
                        <div class="insights-content" id="insights-content">
                            <!-- AI-generated insights will appear here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup event listeners
        this.setupComparisonEventListeners();
    }

    setupComparisonEventListeners() {
        const closeBtn = document.getElementById('close-comparison-modal');
        const refreshBtn = document.getElementById('refresh-comparison');
        const statusFilter = document.getElementById('status-filter');
        const sortOption = document.getElementById('sort-option');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeComparisonModal());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshComparisonData());
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterAndSortBackends());
        }

        if (sortOption) {
            sortOption.addEventListener('change', () => this.filterAndSortBackends());
        }
    }

    startDataCollection() {
        // Collect backend data every 5 seconds
        this.updateInterval = setInterval(() => {
            this.collectBackendData();
        }, 5000);
        
        // Initial data collection
        this.collectBackendData();
    }

    async collectBackendData() {
        try {
            // Simulate fetching real backend data
            const backendData = await this.fetchBackendData();
            
            backendData.forEach(backend => {
                const backendName = backend.name;
                
                // Store current state
                this.backends.set(backendName, {
                    ...backend,
                    timestamp: Date.now(),
                    performanceScore: this.calculatePerformanceScore(backend)
                });
                
                // Store queue history
                if (!this.queueHistory.has(backendName)) {
                    this.queueHistory.set(backendName, []);
                }
                
                const history = this.queueHistory.get(backendName);
                history.push({
                    queue: backend.queue,
                    timestamp: Date.now()
                });
                
                // Keep only last 100 entries
                if (history.length > 100) {
                    history.shift();
                }
            });
            
            // Update comparison data
            this.updateComparisonData();
            
        } catch (error) {
            console.error('Failed to collect backend data:', error);
        }
    }

    async fetchBackendData() {
        // Simulate real backend data with realistic variations
        const baseBackends = [
            { name: 'ibmq_qasm_simulator', qubits: 32, baseQueue: 0, successRate: 0.99 },
            { name: 'ibm_oslo', qubits: 7, baseQueue: 3, successRate: 0.95 },
            { name: 'ibm_nairobi', qubits: 7, baseQueue: 1, successRate: 0.94 },
            { name: 'ibm_lagos', qubits: 7, baseQueue: 2, successRate: 0.93 },
            { name: 'ibm_perth', qubits: 7, baseQueue: 0, successRate: 0.96 }
        ];
        
        return baseBackends.map(backend => ({
            ...backend,
            status: 'online',
            queue: Math.max(0, backend.baseQueue + Math.floor(Math.random() * 3) - 1),
            avgWaitTime: this.calculateAverageWaitTime(backend.baseQueue),
            lastUpdate: Date.now()
        }));
    }

    calculateAverageWaitTime(baseQueue) {
        // Simulate realistic wait times based on queue length
        const baseTime = baseQueue * 2; // 2 minutes per job in queue
        const variation = Math.random() * 0.5; // ±25% variation
        return Math.round((baseTime + variation) * 60); // Convert to seconds
    }

    calculatePerformanceScore(backend) {
        // Calculate performance score based on multiple factors
        const queueScore = Math.max(0, 100 - (backend.queue * 10)); // Lower queue = higher score
        const successScore = backend.successRate * 100;
        const qubitScore = Math.min(100, (backend.qubits / 32) * 100); // Normalize to 32 qubits
        
        return Math.round((queueScore * 0.4 + successScore * 0.4 + qubitScore * 0.2));
    }

    updateComparisonData() {
        this.comparisonData = Array.from(this.backends.values());
        this.filterAndSortBackends();
        this.generateInsights();
    }

    filterAndSortBackends() {
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const sortOption = document.getElementById('sort-option')?.value || 'queue';
        
        let filteredData = [...this.comparisonData];
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filteredData = filteredData.filter(backend => backend.status === statusFilter);
        }
        
        // Apply sorting
        filteredData.sort((a, b) => {
            switch (sortOption) {
                case 'queue':
                    return a.queue - b.queue;
                case 'qubits':
                    return b.qubits - a.qubits;
                case 'availability':
                    return b.performanceScore - a.performanceScore;
                case 'performance':
                    return b.performanceScore - a.performanceScore;
                default:
                    return 0;
            }
        });
        
        this.displayComparisonTable(filteredData);
    }

    displayComparisonTable(backends) {
        const tbody = document.getElementById('comparison-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        backends.forEach(backend => {
            const row = document.createElement('tr');
            row.className = `backend-row ${backend.status}`;
            
            const recommendation = this.getRecommendation(backend);
            const avgWaitTime = this.formatWaitTime(backend.avgWaitTime);
            
            row.innerHTML = `
                <td class="backend-name">
                    <div class="backend-info">
                        <strong>${backend.name}</strong>
                        <span class="backend-type">${backend.qubits === 32 ? 'Simulator' : 'Hardware'}</span>
                    </div>
                </td>
                <td class="status-cell">
                    <span class="status-indicator ${backend.status}"></span>
                    <span class="status-text">${backend.status}</span>
                </td>
                <td class="qubits-cell">
                    <span class="qubit-count">${backend.qubits}</span>
                    <span class="qubit-label">qubits</span>
                </td>
                <td class="queue-cell">
                    <div class="queue-info">
                        <span class="queue-count ${this.getQueueClass(backend.queue)}">${backend.queue}</span>
                        <div class="queue-trend">${this.getQueueTrend(backend.name)}</div>
                    </div>
                </td>
                <td class="wait-time-cell">
                    <span class="wait-time">${avgWaitTime}</span>
                </td>
                <td class="success-rate-cell">
                    <div class="success-rate">
                        <span class="rate-value">${(backend.successRate * 100).toFixed(1)}%</span>
                        <div class="rate-bar">
                            <div class="rate-fill" style="width: ${backend.successRate * 100}%"></div>
                        </div>
                    </div>
                </td>
                <td class="performance-cell">
                    <div class="performance-score">
                        <span class="score-value">${backend.performanceScore}</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${backend.performanceScore}%"></div>
                        </div>
                    </div>
                </td>
                <td class="recommendation-cell">
                    <span class="recommendation ${recommendation.type}">
                        <i class="fas fa-${recommendation.icon}"></i>
                        ${recommendation.text}
                    </span>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    getRecommendation(backend) {
        if (backend.queue === 0 && backend.status === 'online') {
            return {
                type: 'excellent',
                icon: 'star',
                text: 'Best Choice'
            };
        } else if (backend.queue <= 2 && backend.performanceScore > 80) {
            return {
                type: 'good',
                icon: 'thumbs-up',
                text: 'Recommended'
            };
        } else if (backend.queue <= 5) {
            return {
                type: 'moderate',
                icon: 'clock',
                text: 'Moderate Wait'
            };
        } else {
            return {
                type: 'poor',
                icon: 'exclamation-triangle',
                text: 'Long Wait'
            };
        }
    }

    getQueueClass(queue) {
        if (queue === 0) return 'queue-empty';
        if (queue <= 2) return 'queue-low';
        if (queue <= 5) return 'queue-medium';
        return 'queue-high';
    }

    getQueueTrend(backendName) {
        const history = this.queueHistory.get(backendName);
        if (!history || history.length < 2) return '';
        
        const recent = history.slice(-5);
        const trend = recent[recent.length - 1].queue - recent[0].queue;
        
        if (trend > 0) return '<i class="fas fa-arrow-up trend-up"></i>';
        if (trend < 0) return '<i class="fas fa-arrow-down trend-down"></i>';
        return '<i class="fas fa-minus trend-stable"></i>';
    }

    formatWaitTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    }

    generateInsights() {
        const insightsContent = document.getElementById('insights-content');
        if (!insightsContent) return;
        
        const insights = this.analyzeBackendData();
        insightsContent.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <i class="fas fa-${insight.icon}"></i>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                </div>
            </div>
        `).join('');
    }

    analyzeBackendData() {
        const insights = [];
        const backends = Array.from(this.backends.values());
        
        // Find best performing backend
        const bestBackend = backends.reduce((best, current) => 
            current.performanceScore > best.performanceScore ? current : best
        );
        
        insights.push({
            type: 'success',
            icon: 'trophy',
            title: 'Best Performing Backend',
            description: `${bestBackend.name} has the highest performance score (${bestBackend.performanceScore}) with ${bestBackend.queue} jobs in queue.`
        });
        
        // Find backends with no queue
        const availableBackends = backends.filter(b => b.queue === 0 && b.status === 'online');
        if (availableBackends.length > 0) {
            insights.push({
                type: 'info',
                icon: 'check-circle',
                title: 'Available Backends',
                description: `${availableBackends.length} backend(s) are currently available with no queue: ${availableBackends.map(b => b.name).join(', ')}.`
            });
        }
        
        // Check for high queue backends
        const highQueueBackends = backends.filter(b => b.queue > 5);
        if (highQueueBackends.length > 0) {
            insights.push({
                type: 'warning',
                icon: 'exclamation-triangle',
                title: 'High Queue Alert',
                description: `${highQueueBackends.length} backend(s) have long queues: ${highQueueBackends.map(b => `${b.name} (${b.queue})`).join(', ')}.`
            });
        }
        
        // Performance trend analysis
        const avgPerformance = backends.reduce((sum, b) => sum + b.performanceScore, 0) / backends.length;
        insights.push({
            type: 'info',
            icon: 'chart-line',
            title: 'System Performance',
            description: `Average system performance is ${avgPerformance.toFixed(1)}%. ${avgPerformance > 80 ? 'System is performing well.' : 'Consider optimizing job distribution.'}`
        });
        
        return insights;
    }

    showComparisonModal() {
        const modal = document.getElementById('backend-comparison-modal');
        if (modal) {
            modal.classList.add('active');
            this.refreshComparisonData();
        }
    }

    closeComparisonModal() {
        const modal = document.getElementById('backend-comparison-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    refreshComparisonData() {
        this.collectBackendData();
        this.showNotification('Backend data refreshed', 'info');
    }

    showNotification(message, type = 'info') {
        if (window.enhancedNotifications) {
            window.enhancedNotifications.showNotification('Backend Comparison', message, type);
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize backend comparison system
document.addEventListener('DOMContentLoaded', () => {
    window.backendComparison = new BackendComparisonSystem();
});