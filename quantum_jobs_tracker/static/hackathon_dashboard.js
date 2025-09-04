// Quantum Spark - Amravati Quantum Hackathon Dashboard
// Advanced Interactive Dashboard with AI Integration
class HackathonDashboard {
    constructor() {
        this.state = {
            backends: [],
            jobs: [],
            metrics: {},
            isConnected: false,
            notifications: [],
            aiEnabled: false
        };
        
        this.widgets = new Map();
        this.sortable = null;
        this.notificationTimeout = null;
        this.aiClient = null;
        this.popupWidget = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeWidgets();
        this.setupDragAndDrop();
        this.setupAI();
        this.loadInitialData();
        this.setupNotifications();
        this.setupAnimations();
        this.setupPeriodicRefresh();
    }

    setupEventListeners() {
        // Customization panel
        document.getElementById('customize-btn').addEventListener('click', () => {
            this.toggleCustomizationPanel();
        });

        document.getElementById('close-customization').addEventListener('click', () => {
            this.toggleCustomizationPanel();
        });

        // Refresh all button
        document.getElementById('refresh-all-btn').addEventListener('click', () => {
            this.refreshAllWidgets();
        });

        // Popup modal
        document.getElementById('popup-close').addEventListener('click', () => {
            this.closePopup();
        });

        document.getElementById('popup-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'popup-overlay') {
                this.closePopup();
            }
        });

        // Widget controls
        document.addEventListener('click', (e) => {
            if (e.target.closest('.widget-btn')) {
                const button = e.target.closest('.widget-btn');
                const action = button.getAttribute('data-action');
                const widget = button.closest('.widget');
                
                this.handleWidgetAction(widget, action);
            }
        });

        // Add widget buttons in customization panel
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="add"]')) {
                const button = e.target.closest('[data-action="add"]');
                const widgetType = button.closest('.widget-item').getAttribute('data-widget');
                this.addWidget(widgetType);
            }
        });

        // AI input
        document.getElementById('ai-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAIQuery();
            }
        });
    }

    setupAnimations() {
        // Add staggered animations to widgets
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach((widget, index) => {
            widget.style.animationDelay = `${index * 0.1}s`;
        });

        // Add pulse animation to metrics
        const metrics = document.querySelectorAll('.metric-card');
        metrics.forEach((metric, index) => {
            metric.style.animationDelay = `${index * 0.2}s`;
        });
    }

    setupAI() {
        // Initialize Google Gemini AI
        try {
            // Note: You'll need to add your Gemini API key
            // this.aiClient = new GoogleGenerativeAI('YOUR_API_KEY');
            console.log('AI integration ready (API key needed)');
            this.state.aiEnabled = true;
        } catch (error) {
            console.log('AI integration not available:', error);
            this.state.aiEnabled = false;
        }
    }

    async handleAIQuery() {
        const input = document.getElementById('ai-input');
        const responseDiv = document.getElementById('ai-response');
        const query = input.value.trim();
        
        if (!query) return;

        responseDiv.innerHTML = '<div class="spinner"></div> Analyzing with Gemini AI...';
        input.value = '';

        try {
            // Simulate AI response (replace with actual Gemini API call)
            const response = await this.simulateAIResponse(query);
            responseDiv.innerHTML = `<div style="color: var(--text-accent); font-weight: 500;">🤖 Gemini AI:</div><div style="margin-top: 0.5rem;">${response}</div>`;
        } catch (error) {
            responseDiv.innerHTML = `<div style="color: var(--danger-color);">Error: ${error.message}</div>`;
        }
    }

    async simulateAIResponse(query) {
        // Simulate AI response based on query type
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('bloch') || lowerQuery.includes('sphere')) {
            return "The Bloch sphere is a geometric representation of the pure state space of a two-level quantum mechanical system. It's a unit sphere where each point represents a unique quantum state. The north pole represents |0⟩, the south pole represents |1⟩, and points on the equator represent superposition states.";
        } else if (lowerQuery.includes('circuit') || lowerQuery.includes('gate')) {
            return "Quantum circuits are composed of quantum gates that manipulate qubits. Common gates include Hadamard (H), Pauli-X/Y/Z, CNOT, and rotation gates. These gates create entanglement and superposition, enabling quantum algorithms like Shor's and Grover's.";
        } else if (lowerQuery.includes('entanglement')) {
            return "Quantum entanglement is a phenomenon where particles become correlated in such a way that measuring one instantly affects the other, regardless of distance. This is fundamental to quantum computing and enables quantum teleportation and superdense coding.";
        } else {
            return "I can help explain quantum computing concepts, analyze quantum states, interpret circuit diagrams, and provide insights about quantum algorithms. What specific aspect of quantum computing would you like to explore?";
        }
    }

    initializeWidgets() {
        // Initialize all existing widgets
        const existingWidgets = document.querySelectorAll('.widget');
        existingWidgets.forEach(widget => {
            const widgetType = widget.getAttribute('data-widget');
            this.widgets.set(widgetType, widget);
        });
    }

    setupDragAndDrop() {
        const widgetGrid = document.getElementById('widget-grid');
        
        this.sortable = new Sortable(widgetGrid, {
            animation: 300,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                this.saveWidgetOrder();
                this.showNotification('Widget layout updated', 'success');
            }
        });
    }

    setupNotifications() {
        // Setup Server-Sent Events for real-time notifications
        this.setupSSE();
    }

    setupSSE() {
        // Create EventSource for real-time notifications with reduced frequency
        this.eventSource = new EventSource('/api/notifications');
        
        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleNotification(data);
            } catch (error) {
                console.error('Error parsing notification:', error);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            // Reconnect after 60 seconds (1 minute) instead of 5 seconds
            setTimeout(() => {
                if (this.eventSource.readyState === EventSource.CLOSED) {
                    this.setupSSE();
                }
            }, 60000);
        };
    }

    setupPeriodicRefresh() {
        // Set up periodic refresh every 5 minutes (300,000 ms)
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Periodic refresh triggered (5 minutes)');
            this.refreshAllWidgets();
        }, 300000); // 5 minutes = 300,000 milliseconds
    }

    cleanup() {
        // Clean up intervals and connections
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.eventSource) {
            this.eventSource.close();
        }
    }

    handleNotification(data) {
        switch (data.type) {
            case 'new_job':
                this.showNotification(`New job submitted: ${data.job_id}`, 'info');
                this.updateWidget('jobs');
                this.updateMetrics();
                break;
            case 'job_update':
                if (data.new_status === 'completed') {
                    this.showNotification(`Job completed: ${data.job_id}`, 'success');
                } else if (data.new_status === 'failed') {
                    this.showNotification(`Job failed: ${data.job_id}`, 'error');
                } else {
                    this.showNotification(`Job ${data.job_id} status: ${data.new_status}`, 'info');
                }
                this.updateWidget('jobs');
                this.updateMetrics();
                break;
            case 'error':
                this.showNotification(`Error: ${data.message}`, 'error');
                break;
        }
    }

    async loadInitialData() {
        try {
            await this.fetchDashboardData();
            this.updateMetrics();
            this.updateAllWidgets();
            this.showNotification('Dashboard loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    async fetchDashboardData() {
        const response = await fetch('/api/dashboard_state');
        const data = await response.json();
        
        if (data.success) {
            this.state = {
                ...this.state,
                backends: data.backends || [],
                jobs: data.jobs || [],
                metrics: data.metrics || {},
                isConnected: data.connected || false
            };
            
            this.updateConnectionStatus(data.connected);
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard data');
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        if (connected) {
            statusElement.className = 'connection-status';
            statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Connected to IBM Quantum</span>';
        } else {
            statusElement.className = 'connection-status disconnected';
            statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Disconnected</span>';
        }
    }

    updateMetrics() {
        const metrics = this.state.metrics;
        
        document.getElementById('active-backends').textContent = 
            this.state.backends.filter(b => b.status === 'active').length;
        document.getElementById('total-jobs').textContent = this.state.jobs.length;
        document.getElementById('running-jobs').textContent = 
            this.state.jobs.filter(j => j.status === 'running').length;
        
        const successRate = this.calculateSuccessRate();
        document.getElementById('success-rate').textContent = `${successRate}%`;
    }

    calculateSuccessRate() {
        const completedJobs = this.state.jobs.filter(j => j.status === 'completed');
        const successfulJobs = completedJobs.filter(j => j.result && !j.error);
        return completedJobs.length > 0 ? Math.round((successfulJobs.length / completedJobs.length) * 100) : 0;
    }

    async updateAllWidgets() {
        const widgets = ['backends', 'jobs', 'bloch-sphere', 'circuit', 'performance', 'entanglement'];
        
        for (const widgetType of widgets) {
            if (this.widgets.has(widgetType)) {
                await this.updateWidget(widgetType);
            }
        }
    }

    async updateWidget(widgetType) {
        const widget = this.widgets.get(widgetType);
        if (!widget) return;

        const loadingElement = widget.querySelector('.loading');
        const contentElement = widget.querySelector(`#${widgetType}-content, #${widgetType.replace('-', '-')}-content`);

        // Show loading
        if (loadingElement) loadingElement.style.display = 'flex';
        if (contentElement) contentElement.style.display = 'none';

        try {
            switch (widgetType) {
                case 'backends':
                    await this.updateBackendsWidget();
                    break;
                case 'jobs':
                    await this.updateJobsWidget();
                    break;
                case 'bloch-sphere':
                    await this.updateBlochSphereWidget();
                    break;
                case 'circuit':
                    await this.updateCircuitWidget();
                    break;
                case 'performance':
                    await this.updatePerformanceWidget();
                    break;
                case 'entanglement':
                    await this.updateEntanglementWidget();
                    break;
            }

            // Hide loading and show content
            if (loadingElement) loadingElement.style.display = 'none';
            if (contentElement) contentElement.style.display = 'block';

        } catch (error) {
            console.error(`Error updating ${widgetType} widget:`, error);
            if (loadingElement) {
                loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span style="margin-left: 0.5rem;">Error loading data</span>';
            }
        }
    }

    async updateBackendsWidget() {
        const contentElement = document.getElementById('backends-content');
        if (!contentElement) return;

        const backends = this.state.backends;
        
        if (backends.length === 0) {
            contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No backends available</p>';
            return;
        }

        const backendsHtml = backends.map(backend => `
            <div style="padding: 1rem; border: 1px solid var(--glass-border); border-radius: var(--border-radius); margin-bottom: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-family: var(--font-display);">${backend.name}</h4>
                    <span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; background: ${this.getStatusColor(backend.status)}; color: white;">
                        ${backend.status}
                    </span>
                </div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                    <div style="margin-bottom: 0.25rem;"><i class="fas fa-microchip"></i> Qubits: ${backend.num_qubits || 'N/A'}</div>
                    <div><i class="fas fa-clock"></i> Queue: ${backend.queue_length || 0} jobs</div>
                </div>
            </div>
        `).join('');

        contentElement.innerHTML = backendsHtml;
    }

    async updateJobsWidget() {
        const contentElement = document.getElementById('jobs-content');
        if (!contentElement) return;

        const jobs = this.state.jobs;
        
        if (jobs.length === 0) {
            contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jobs found</p>';
            return;
        }

        // Sort jobs by creation date (most recent first) and show only first 3 jobs initially
        const sortedJobs = jobs.sort((a, b) => {
            const dateA = this.parseJobDate(a.creation_date);
            const dateB = this.parseJobDate(b.creation_date);
            return dateB - dateA; // Most recent first
        });
        
        const displayJobs = sortedJobs.slice(0, 3);
        const hasMoreJobs = sortedJobs.length > 3;

        const jobsHtml = displayJobs.map(job => `
            <div style="padding: 1rem; border: 1px solid var(--glass-border); border-radius: var(--border-radius); margin-bottom: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 0.875rem; font-family: var(--font-mono);">${job.job_id || 'Job ' + job.id || 'Unknown Job'}</h4>
                    <span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; background: ${this.getJobStatusColor(job.status)}; color: white;">
                        ${job.status || 'Unknown'}
                    </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    <div style="margin-bottom: 0.25rem;"><i class="fas fa-server"></i> Backend: ${job.backend || 'N/A'}</div>
                    <div><i class="fas fa-calendar"></i> Created: ${this.formatJobDate(job.creation_date)}</div>
                </div>
            </div>
        `).join('');

        // Add expand button if there are more jobs
        const expandButton = hasMoreJobs ? `
            <div style="text-align: center; margin-top: 1rem;">
                <button onclick="window.hackathonDashboard.showAllJobs()" class="job-expand-btn">
                    <i class="fas fa-expand"></i> Show All ${sortedJobs.length} Jobs
                </button>
            </div>
        ` : '';

        contentElement.innerHTML = jobsHtml + expandButton;

        // Store all jobs for expand functionality
        this.allJobs = sortedJobs;
    }

    showAllJobs() {
        const contentElement = document.getElementById('jobs-content');
        if (!contentElement || !this.allJobs) return;

        const jobsHtml = this.allJobs.map(job => `
            <div style="padding: 1rem; border: 1px solid var(--glass-border); border-radius: var(--border-radius); margin-bottom: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 0.875rem; font-family: var(--font-mono);">${job.job_id || 'Job ' + job.id || 'Unknown Job'}</h4>
                    <span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; background: ${this.getJobStatusColor(job.status)}; color: white;">
                        ${job.status || 'Unknown'}
                    </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    <div style="margin-bottom: 0.25rem;"><i class="fas fa-server"></i> Backend: ${job.backend || 'N/A'}</div>
                    <div><i class="fas fa-calendar"></i> Created: ${this.formatJobDate(job.creation_date)}</div>
                </div>
            </div>
        `).join('');

        const collapseButton = `
            <div style="text-align: center; margin-top: 1rem;">
                <button onclick="window.hackathonDashboard.showFewJobs()" class="job-collapse-btn">
                    <i class="fas fa-compress"></i> Show Less
                </button>
            </div>
        `;

        contentElement.innerHTML = jobsHtml + collapseButton;
    }

    showFewJobs() {
        this.updateJobsWidget();
    }

    // Helper method to parse job creation date
    parseJobDate(dateString) {
        if (!dateString) return Date.now();
        
        // Handle different date formats
        let date;
        if (typeof dateString === 'string') {
            // Try parsing as ISO string first
            date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // Try parsing as timestamp (seconds or milliseconds)
                const timestamp = parseInt(dateString);
                if (!isNaN(timestamp)) {
                    // If timestamp is in seconds (less than year 2000), convert to milliseconds
                    date = new Date(timestamp < 946684800000 ? timestamp * 1000 : timestamp);
                } else {
                    // Fallback to current date
                    date = new Date();
                }
            }
        } else if (typeof dateString === 'number') {
            // Handle numeric timestamps
            date = new Date(dateString < 946684800000 ? dateString * 1000 : dateString);
        } else {
            date = new Date(dateString);
        }
        
        return isNaN(date.getTime()) ? Date.now() : date.getTime();
    }

    // Helper method to format job creation date
    formatJobDate(dateString) {
        const date = new Date(this.parseJobDate(dateString));
        const now = new Date();
        
        // Reset time to start of day for accurate day comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const jobDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const diffTime = today - jobDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays > 1 && diffDays <= 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    async updateBlochSphereWidget() {
        console.log('🔄 Updating Bloch sphere widget...');
        const contentElement = document.getElementById('bloch-content');
        if (!contentElement) {
            console.error('❌ Bloch content element not found!');
            return;
        }
        console.log('✅ Found Bloch content element:', contentElement);

        // Show loading state first
        contentElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-secondary);">
                <div style="text-align: center;">
                    <div class="spinner" style="margin: 0 auto 1rem;"></div>
                    <div>Loading Bloch sphere...</div>
                </div>
            </div>
        `;

        try {
            // Check dependencies
            if (typeof Plotly === 'undefined') {
                throw new Error('Plotly library not loaded');
            }
            
            if (typeof math === 'undefined') {
                throw new Error('Math.js library not loaded');
            }
            
            console.log('✅ Dependencies loaded, initializing Bloch sphere...');
            
            // Initialize Blochy quantum functions if not already done
            this.initializeBlochyFunctions();
            
            // Create the enhanced Bloch sphere with controls
            this.createEnhancedBlochSphere(contentElement);
            
        } catch (error) {
            console.error('❌ Error creating Bloch sphere:', error);
            contentElement.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-primary); background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: var(--border-radius); border: 1px solid var(--glass-border);">
                    <h2 style="color: var(--text-accent); margin-bottom: 20px; font-family: var(--font-display);">⚛️ Bloch Sphere</h2>
                    <p style="font-size: 16px; margin-bottom: 15px; color: var(--text-secondary);">Error: ${error.message}</p>
                    <div style="background: rgba(239, 68, 68, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(239, 68, 68, 0.3);">
                        <p style="margin: 5px 0; color: var(--text-primary);"><strong>Issue:</strong> ${error.message}</p>
                        <p style="margin: 5px 0; color: var(--text-primary);"><strong>Solution:</strong> Check browser console for details</p>
                    </div>
                    <button onclick="window.hackathonDashboard.updateBlochSphereWidget()" style="margin-top: 15px; padding: 0.5rem 1rem; background: var(--quantum-gradient); color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    createWorkingBlochSphere(container) {
        console.log('🚀 Creating Bloch sphere in container:', container);
        
        // Clear any existing content
        container.innerHTML = '';
        
        // Check if Plotly is available
        if (typeof Plotly === 'undefined') {
            console.error('❌ Plotly is not loaded!');
            container.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Plotly library not loaded</p>';
            return;
        }
        
        try {
            // Use the working Bloch sphere code from Blochy
            const blochData = this.generateBlochSphereData();
            
            const layout = {
                title: {
                    text: '3D Bloch Sphere - Quantum Spark',
                    font: { size: 16, color: '#06b6d4' }
                },
                scene: {
                    xaxis: {
                        showspikes: false,
                        showgrid: false,
                        zeroline: false,
                        showline: false,
                        visible: false,
                        ticks: '',
                        showticklabels: false,
                        range: [-1.1,1.1]
                    }, 
                    yaxis: {
                        showspikes: false,
                        showgrid: false,
                        zeroline: false,
                        showline: false,
                        visible: false,
                        ticks: '',
                        showticklabels: false,
                        range: [-1.1,1.1]
                    },
                    zaxis: {
                        showspikes: false,
                        showgrid: false,
                        zeroline: false,
                        showline: false,
                        visible: false,
                        ticks: '',
                        showticklabels: false,
                        range: [-1.1,1.1]
                    },
                    camera: {
                        center: {
                            x:0, y:0,z:0
                        },
                        eye: {
                            x:-0.9, y:1, z:0.6
                        },
                        projection: 'perspective'
                    },
                    bgcolor: 'rgba(0,0,0,0)'
                },
                showlegend: false,
                margin: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 50
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
            };
            
            const config = {
                displayModeBar: true,
                displaylogo: false,
                responsive: true,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
            };
            
            Plotly.newPlot(container, blochData, layout, config);
            console.log('✅ Bloch sphere created successfully!');
            
        } catch (error) {
            console.error('❌ Error creating Bloch sphere:', error);
            
            // Fallback display
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-primary); background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: var(--border-radius); border: 1px solid var(--glass-border);">
                    <h2 style="color: var(--text-accent); margin-bottom: 20px; font-family: var(--font-display);">⚛️ Bloch Sphere</h2>
                    <p style="font-size: 16px; margin-bottom: 15px; color: var(--text-secondary);">Quantum State Visualization</p>
                    <div style="background: rgba(6, 182, 212, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(6, 182, 212, 0.3);">
                        <p style="margin: 5px 0; color: var(--text-primary);"><strong>Current State:</strong> |0⟩</p>
                        <p style="margin: 5px 0; color: var(--text-primary);"><strong>θ:</strong> 0° (Polar angle)</p>
                        <p style="margin: 5px 0; color: var(--text-primary);"><strong>φ:</strong> 0° (Azimuthal angle)</p>
                    </div>
                    <p style="font-size: 14px; color: var(--text-secondary);">Interactive 3D visualization loading...</p>
                    <button onclick="window.hackathonDashboard.updateBlochSphereWidget()" style="margin-top: 15px; padding: 0.5rem 1rem; background: var(--quantum-gradient); color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    // Helper functions from Blochy
    linspace(start, stop, num) {
        const step = (stop - start) / (num - 1);
        return Array.from({length: num}, (_, i) => start + step * i);
    }

    meshgrid(x, y) {
        const result = [];
        for (let i = 0; i < y.length; i++) {
            result.push([]);
            for (let j = 0; j < x.length; j++) {
                result[i].push(x[j]);
            }
        }
        return [result, y.map(() => x)];
    }

    generateBlochSphereData() {
        // Generate sphere surface
        const theta = this.linspace(0, Math.PI, 20);
        const phi = this.linspace(0, 2*Math.PI, 40);
        const [u, v] = this.meshgrid(theta, phi);
        
        const su = u.map(row => row.map(val => Math.sin(val)));
        const xs = v.map((row, i) => row.map((val, j) => Math.cos(val) * su[i][j]));
        const ys = v.map((row, i) => row.map((val, j) => Math.sin(val) * su[i][j]));
        const zs = u.map(row => row.map(val => Math.cos(val)));

        // Generate grid lines
        let x = [], y = [], z = [];
        let xb = [], yb = [], zb = [];

        // Meridians
        for (let i = 0; i < 12; i++) {
            const t = i * Math.PI / 6;
            const xcurr = theta.map(th => Math.sin(th) * Math.cos(t));
            const ycurr = theta.map(th => Math.sin(th) * Math.sin(t));
            const zcurr = theta.map(th => Math.cos(th));
            
            if ([0,3,6,9].includes(i)) {
                xb = xb.concat(xcurr).concat([null]);
                yb = yb.concat(ycurr).concat([null]);
                zb = zb.concat(zcurr).concat([null]);
            } else {
                x = x.concat(xcurr).concat([null]);
                y = y.concat(ycurr).concat([null]);
                z = z.concat(zcurr).concat([null]);
            }
        }

        // Parallels
        for (let i = 1; i < 9; i++) {
            const t = i * Math.PI / 6;
            const xcurr = phi.map(p => Math.cos(p) * Math.sin(t));
            const ycurr = phi.map(p => Math.sin(p) * Math.sin(t));
            const zcurr = phi.map(() => Math.cos(t));
            
            if ([3].includes(i)) {
                xb = xb.concat(xcurr).concat([null]);
                yb = yb.concat(ycurr).concat([null]);
                zb = zb.concat(zcurr).concat([null]);
            } else {
                x = x.concat(xcurr).concat([null]);
                y = y.concat(ycurr).concat([null]);
                z = z.concat(zcurr).concat([null]);
            }
        }

        // Create data objects
        const sphere = {
            name: 'sphere',
            x: xs, y: ys, z: zs,
            type: 'surface',
            colorscale: [['0.0', '#06b6d4'], ['1.0', '#3b82f6']],
            showscale: false,
            opacity: 0.3,
            hoverinfo: 'skip'
        };

        const gridlines = {
            name: 'gridlines',
            x: x, y: y, z: z,
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'lines',
            opacity: 0.4,
            line: {color: '#06b6d4', width: 2}
        };

        const gridlines_bold = {
            name: 'gridlines_bold',
            x: xb, y: yb, z: zb,
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'lines',
            opacity: 0.6,
            line: {color: '#ffffff', width: 3}
        };

        const axes = {
            name: 'axes',
            x: [-1,1,null,0,0,null,0,0], 
            y: [0,0,null,-1,1,null,0,0], 
            z: [0,0,null,0,0,null,-1,1],
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'lines+text',
            opacity: 0.8,
            line: {color: '#ffffff', width: 4},
            text: ["x","","","y","","","","|0⟩",""],
            textfont: {
                size: 24,
                color: "#ffffff"
            },
            textposition: 'top center'
        };

        const lower_tag = {
            x: [0], y: [0], z: [-1],
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'text',
            opacity: 0.8,
            text: ["|1⟩"],
            textfont: {
                size: 24,
                color: "#ffffff"
            },
            textposition: 'bottom center'
        };

        // State vector pointing to |0⟩
        const stateVector = {
            name: 'state_vector',
            x: [0], y: [0], z: [1],
            type: 'scatter3d',
            mode: 'markers',
            marker: {
                size: 16,
                color: '#ff6b6b',
                symbol: 'diamond',
                line: {
                    color: '#ffffff',
                    width: 2
                }
            },
            text: ['|0⟩ State'],
            hoverinfo: 'text'
        };

        return [sphere, gridlines, gridlines_bold, axes, lower_tag, stateVector];
    }

    // ===== EXACT BLOCHY CODE INTEGRATION =====
    
    initializeBlochyFunctions() {
        console.log('🔧 Initializing Blochy functions...');
        
        try {
            // Initialize global variables for Blochy
            if (!window.QMSTATEVECTOR) {
                console.log('📊 Creating initial quantum state...');
                window.QMSTATEVECTOR = [gen_state(true)];
                console.log('🌐 Generating Bloch sphere data...');
                window.BLOCHSPHERE = gen_bloch_sphere();
                console.log('🎯 Creating state vector...');
                window.STATEARROW = gen_vector_plot(state2vector(window.QMSTATEVECTOR[window.QMSTATEVECTOR.length-1]));
                window.PHOSPHOR = [];
                window.PHOSPHOR_ENABLED = true;
                console.log('✅ Blochy functions initialized successfully!');
            } else {
                console.log('✅ Blochy functions already initialized');
            }
        } catch (error) {
            console.error('❌ Error initializing Blochy functions:', error);
            throw error;
        }
    }

    // EXACT BLOCHY QUANTUM FUNCTIONS - COPIED DIRECTLY
    state2vector(state) {
        // https://en.wikipedia.org/wiki/Bloch_sphere#u,_v,_w_representation
        r01 = math.multiply(state['_data'][0],math.conj(state['_data'][1]));
        r00 = math.multiply(state['_data'][0],math.conj(state['_data'][0]));
        r11 = math.multiply(state['_data'][1],math.conj(state['_data'][1]));
        u = -2*math.re(r01);
        v = 2*math.im(r01);
        w = math.re(r00-r11);
        return [u,v,w]
    }

    rot(axis_op, angle, ...state) {
        //rot_op = (-1j*phi*op).expm()
        if (typeof(axis_op) === 'string') {
            if (axis_op === 'x') {
                op = math.matrix([[0,math.complex(0.5,0)],[math.complex(0.5,0),0]]);
            }
            else if (axis_op === 'y') {
                op =  math.matrix([[0,math.complex(0,-0.5)],[math.complex(0,0.5),0]]);
            }
            else if (axis_op === 'z') {
                op = math.matrix([[math.complex(0.5,0),0],[0,math.complex(-0.5,0)]]);
            }
            else {
                throw 'Unknown axis string';
            } 
        }
        else {
            op = axis_op;
        }
   
        rot_op = math.expm(math.multiply(math.complex(0,-angle),op));
        
        if (state.length === 0) {
            return rot_op
        }
        else {
            return math.multiply(rot_op,state[0])
        }
    }

    gen_state(up_is_true) {
        if (up_is_true) {
            return math.matrix([1,0])
        }
        else {
            return math.matrix([0,1])
        }
    }

    // EXACT BLOCHY BLOCH SPHERE GENERATION - COPIED DIRECTLY
    gen_bloch_sphere() {
        theta = linspace(0,Math.PI,20);
        phi = linspace(0,2*Math.PI,40);
        [u,v] = meshgrid(theta,phi);
        su = math.map(u,math.sin);
        xs = math.dotMultiply(math.map(v,math.cos),su);
        ys = math.dotMultiply(math.map(v,math.sin),su);
        zs = math.map(u,math.cos);

        var x = []
        var y = []
        var z = []
        var xb = []
        var yb = []
        var zb = []
        for (var i = 0; i < 12; i++) {
            //meridians 
            t = i*math.PI/6;
            xcurr = math.multiply(math.map(theta,math.sin),math.cos(t));
            ycurr = math.multiply(math.map(theta,math.sin),math.sin(t));
            zcurr = math.map(theta,math.cos);
            if ([0,3,6,9].includes(i)) {
                xb = xb.concat(xcurr);
                xb = xb.concat([null]);
                
                yb = yb.concat(ycurr);
                yb = yb.concat([null]);
                
                zb = zb.concat(zcurr);
                zb = zb.concat([null]);

            }
            else {
                x = x.concat(xcurr);
                x = x.concat([null]);
                
                y = y.concat(ycurr);
                y = y.concat([null]);
                
                z = z.concat(zcurr);
                z = z.concat([null]);
            }

        }
        for (var i = 1; i < 9; i++) {
            //parallels
            t = i*math.PI/6;
            xcurr = math.multiply(math.map(phi,math.cos),math.sin(t));
            ycurr = math.multiply(math.map(phi,math.sin),math.sin(t));
            zcurr = Array(phi.length).fill(math.cos(t));

            if ([3].includes(i)) {
                xb = xb.concat(xcurr);
                xb = xb.concat([null]);
                
                yb = yb.concat(ycurr);
                yb = yb.concat([null]);
                
                zb = zb.concat(zcurr);
                zb = zb.concat([null]);
            }
            else {
                x = x.concat(xcurr);
                x = x.concat([null]);
                
                y = y.concat(ycurr);
                y = y.concat([null]);
    
                z = z.concat(zcurr);
                z = z.concat([null]);
            }        
        }

        var sphere = {
            name: 'sphere',
            x:xs, y: ys, z: zs,
            type: 'surface',
            colorscale: [['0.0', '#AAAAAA' ], ['1.0', '#AAAAAA']],
            showscale: false,
            opacity:0.1,
            hoverinfo: 'skip',
            contours: {
                x : {
                    highlight: false
                },
                y : {
                    highlight: false
                },
                z : {
                    highlight: false
                }
            }
        };

        var gridlines = {
            name: 'gridlines_bold',
            x:x, y: y, z: z,
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'lines',
            opacity: 0.05,
            line: {color: '#000000', width:3},
        }

        var gridlines_bold = {
            name: 'gridlines_bold',
            x:xb, y: yb, z: zb,
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'lines',
            opacity: 0.075,
            line: {color: '#000000', width:3},
        }

        var equator_plane = {
            name: 'equator_plane',
            x: xs, y:ys, z:math.multiply(zs,0),
            type: 'surface',
            colorscale: [['0.0', '#AAAAAA' ], ['1.0', '#AAAAAA']],
            showscale: false,
            opacity:0.075,
            hoverinfo: 'skip',

        }

        north_text = "0";
        south_text = "1";
        if (north_text != "") {
            north_text = "￨" + north_text + "〉"
        }
        if (south_text != "") {
            south_text = "￨" + south_text + "〉"
        }

        var axes = {
            name: 'axes',
            x: [-1,1,null,0,0,null,0,0], y:[0,0,null,-1,1,null,0,0], z:[0,0,null,0,0,null,-1,1],
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'lines+text',
            opacity: 0.5,
            line: {color: '#000000', width:3},
            text: ["x","","","y","","","",north_text,""],
            textfont: {
                size:30,
                color: "#000000"
            },
            textposition: 'top center'
        }
        var lower_tag = {
            x: [0], y:[0], z:[-1],
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'text',
            opacity: 0.5,
            line: {color: '#000000', width:3},
            text: [south_text],
            textfont: {
                size:30,
                color: "#000000"
            },
            textposition: 'bottom center'
        }

        return [sphere, gridlines, gridlines_bold,equator_plane,axes,lower_tag]
    }

    // EXACT BLOCHY VECTOR PLOT - COPIED DIRECTLY
    gen_vector_plot(vector,normalize=true) {
        color = '#1a237e'; // Default color
        [u,v,w] = vector;
        if (normalize === true) {
            l = math.sqrt(u**2+v**2+w**2);
            u = u/l;
            v = v/l;
            w = w/l;
        }
        hovertext = '￨Ψ〉= ￨0〉+ 0.5 ￨1〉<extra></extra>';
        
        zax = [u,v,w];
        [q,p] = cylinder_axes(zax);
    
        xarr =Array(0);
        yarr = Array(0);
        zarr = Array(0);
        
        for (var i = 0; i < 7; i++) {
            phi = 2*Math.PI*i/6;
            r = 0.025;
            l = 0.9
            xarr.push([(q[0]*math.cos(phi)+p[0]*math.sin(phi))*r,(q[0]*math.cos(phi)+p[0]*math.sin(phi))*r+zax[0]*l]);
            yarr.push([(q[1]*math.cos(phi)+p[1]*math.sin(phi))*r,(q[1]*math.cos(phi)+p[1]*math.sin(phi))*r+zax[1]*l]);
            zarr.push([(q[2]*math.cos(phi)+p[2]*math.sin(phi))*r,(q[2]*math.cos(phi)+p[2]*math.sin(phi))*r+zax[2]*l]);
        }

        var upp = {
            name: 'tail',
            x:xarr, y: yarr, z: zarr,
            type: 'surface',
            colorscale: [['0.0', color], ['1.0',color]],
            showscale: false,
            opacity:1.0,
            hovertemplate: hovertext,
            contours: {
                x : {
                    highlight: false
                },
                y : {
                    highlight: false
                },
                z : {
                    highlight: false
                }
            }
        };
        var head = {
            u: [0.3*(u)],
            v: [0.3*(v)],
            w: [0.3*(w)],
            sizemode: 'absolute',
            sizeref: .25,
            hovertemplate: hovertext,
            colorscale: [['0.0', color], ['1.0',color]],
            showscale: false,
            type: 'cone',
            anchor: 'tip',
            x: [u],
            y: [v],
            z: [w]
        }
        return [head,upp]
    }

    // EXACT BLOCHY HELPER FUNCTIONS - COPIED DIRECTLY
    cylinder_axes(v,k=[2,0,0]) {
        // v needs to be normalized, k must not be parallel to v
        // t is height
        //k = [2,0,0];
        //vp = (k+p2)-((k+p2)*p2)*p2;
        //c = vp/norm(vp);
        //p = (1-t)*p2 + c*d*cos(phi) + u*d*sin(phi);
        qp = math.subtract(k,math.dotMultiply(Array(3).fill(math.dot(v,k)),v));
        //console.log(qp);
        q = math.dotMultiply(qp,Array(3).fill(1/math.norm(qp,2)));
        //console.log("-----------");
        //console.log(q);
        p = math.cross(v,q);
        p = math.dotMultiply(p,Array(3).fill(1/math.norm(p,2)));
        //console.log("+++++++++++")
        //console.log(p);
        return [q,p]
    }

    linspace(start, stop, num) {
        const step = (stop - start) / (num - 1);
        return Array.from({length: num}, (_, i) => start + i * step);
    }

    meshgrid(x, y) {
        const resultX = [];
        const resultY = [];
        for (let i = 0; i < y.length; i++) {
            resultX.push([...x]);
            resultY.push(Array(x.length).fill(y[i]));
        }
        return [resultX, resultY];
    }

    createEnhancedBlochSphere(container) {
        console.log('🚀 Creating enhanced Bloch sphere with controls...');
        
        // Clear any existing content
        container.innerHTML = '';
        
        try {
            // Create the 3D plot container
            const plotContainer = document.createElement('div');
            plotContainer.id = 'bloch-plot';
            plotContainer.style.width = '100%';
            plotContainer.style.height = '300px';
            plotContainer.style.marginBottom = '1rem';
            plotContainer.style.background = 'rgba(0,0,0,0.1)';
            plotContainer.style.borderRadius = '8px';
            plotContainer.style.border = '1px solid var(--glass-border)';
            
            // Create controls container
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'bloch-controls';
            controlsContainer.innerHTML = this.createBlochControlsHTML();
            
            // Add containers to the main container
            container.appendChild(plotContainer);
            container.appendChild(controlsContainer);
            
            // Show immediate feedback
            plotContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                    <div style="text-align: center;">
                        <div class="spinner" style="margin: 0 auto 1rem;"></div>
                        <div>Initializing 3D visualization...</div>
                    </div>
                </div>
            `;
            
            // Initialize the plot with a small delay to ensure DOM is ready
            setTimeout(() => {
                try {
                    this.initBlochPlot(plotContainer);
                    console.log('✅ Enhanced Bloch sphere created successfully!');
                } catch (plotError) {
                    console.error('❌ Error initializing plot:', plotError);
                    // Try fallback simple Bloch sphere
                    try {
                        this.createSimpleBlochSphere(plotContainer);
                        console.log('✅ Fallback Bloch sphere created successfully!');
                    } catch (fallbackError) {
                        console.error('❌ Fallback also failed:', fallbackError);
                        plotContainer.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--danger-color);">
                                <div style="text-align: center;">
                                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                                    <div>Plot initialization failed</div>
                                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">${plotError.message}</div>
                                    <button onclick="window.hackathonDashboard.updateBlochSphereWidget()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--quantum-gradient); color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                        <i class="fas fa-sync-alt"></i> Retry
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                }
            }, 100);
            
            // Setup event listeners for controls
            this.setupBlochControls();
            
        } catch (error) {
            console.error('❌ Error creating enhanced Bloch sphere:', error);
            
            // Fallback display
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-primary); background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: var(--border-radius); border: 1px solid var(--glass-border);">
                    <h2 style="color: var(--text-accent); margin-bottom: 20px; font-family: var(--font-display);">⚛️ Bloch Sphere</h2>
                    <p style="font-size: 16px; margin-bottom: 15px; color: var(--text-secondary);">Quantum State Visualization</p>
                    <div style="background: rgba(6, 182, 212, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(6, 182, 212, 0.3);">
                        <p style="margin: 5px 0; color: var(--text-primary);"><strong>Current State:</strong> |0⟩</p>
                        <p style="margin: 5px 0; color: var(--text-primary);"><strong>θ:</strong> 0° (Polar angle)</p>
                        <p style="margin: 5px 0; color: var(--text-primary);"><strong>φ:</strong> 0° (Azimuthal angle)</p>
                    </div>
                    <p style="font-size: 14px; color: var(--text-secondary);">Interactive 3D visualization loading...</p>
                    <button onclick="window.hackathonDashboard.updateBlochSphereWidget()" style="margin-top: 15px; padding: 0.5rem 1rem; background: var(--quantum-gradient); color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    createBlochControlsHTML() {
        return `
            <h4><i class="fas fa-cogs"></i> Quantum Controls</h4>
            
            <div class="bloch-control-group">
                <h5><i class="fas fa-undo"></i> Basic Operations</h5>
                <div class="bloch-control-row">
                    <button class="bloch-btn primary" onclick="window.hackathonDashboard.blochRestart()">
                        <i class="fas fa-play"></i> Init
                    </button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochUndo()">
                        <i class="fas fa-undo"></i> Undo
                    </button>
                </div>
            </div>

            <div class="bloch-control-group">
                <h5><i class="fas fa-rotate"></i> Rotations</h5>
                <div class="bloch-control-row">
                    <label>X-axis:</label>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('x', Math.PI/2)">+90°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('x', -Math.PI/2)">-90°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('x', Math.PI)">+180°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('x', -Math.PI)">-180°</button>
                </div>
                <div class="bloch-control-row">
                    <label>Y-axis:</label>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('y', Math.PI/2)">+90°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('y', -Math.PI/2)">-90°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('y', Math.PI)">+180°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('y', -Math.PI)">-180°</button>
                </div>
                <div class="bloch-control-row">
                    <label>Z-axis:</label>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', Math.PI/2)">+90°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', -Math.PI/2)">-90°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', Math.PI)">+180°</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', -Math.PI)">-180°</button>
                </div>
            </div>

            <div class="bloch-control-group">
                <h5><i class="fas fa-project-diagram"></i> Quantum Gates</h5>
                <div class="bloch-control-row">
                    <label>Pauli:</label>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('x', Math.PI)">X</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('y', Math.PI)">Y</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', Math.PI)">Z</button>
                </div>
                <div class="bloch-control-row">
                    <label>Phase:</label>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', Math.PI/2)">S</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', -Math.PI/2)">S†</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', Math.PI/4)">T</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochRotate('z', -Math.PI/4)">T†</button>
                </div>
                <div class="bloch-control-row">
                    <label>Hadamard:</label>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochHadamard()">H</button>
                </div>
            </div>

            <div class="bloch-control-group">
                <h5><i class="fas fa-cog"></i> Custom Rotation</h5>
                <div class="bloch-control-row">
                    <label>Angle:</label>
                    <input type="number" class="bloch-input" id="custom-angle" value="45" placeholder="45">
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochCustomRotate('x')">X</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochCustomRotate('y')">Y</button>
                    <button class="bloch-btn" onclick="window.hackathonDashboard.blochCustomRotate('z')">Z</button>
                </div>
            </div>

            <div class="bloch-state-info" id="bloch-state-info">
                <strong>Current State:</strong> |0⟩<br>
                <strong>Coordinates:</strong> (0, 0, 1)<br>
                <strong>Operations:</strong> 0
            </div>
        `;
    }

    // Use global Blochy plotting function
    initBlochPlot(container) {
        console.log('🎨 Initializing Bloch plot with exact Blochy code...');
        
        try {
            // Use the global Blochy plotting function
            init_plotting(window.BLOCHSPHERE.concat(window.STATEARROW).concat(window.PHOSPHOR || []));
            console.log('✅ Blochy plot created successfully!');
        } catch (error) {
            console.error('❌ Error in initBlochPlot:', error);
            throw error;
        }
    }

    setupBlochControls() {
        // Event listeners are set up via onclick attributes in the HTML
        // This method can be used for additional setup if needed
        console.log('🎛️ Bloch controls setup complete');
    }

    createSimpleBlochSphere(container) {
        console.log('🔄 Creating simple fallback Bloch sphere...');
        
        // Create a simple 2D representation of the Bloch sphere
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 1rem;">
                <div style="position: relative; width: 200px; height: 200px; border: 3px solid var(--text-accent); border-radius: 50%; background: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(0,0,0,0) 70%);">
                    <!-- Bloch sphere circle -->
                    <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: var(--text-accent); font-weight: bold; font-size: 0.8rem;">|0⟩</div>
                    <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); color: var(--text-accent); font-weight: bold; font-size: 0.8rem;">|1⟩</div>
                    <div style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-accent); font-weight: bold; font-size: 0.8rem;">|+⟩</div>
                    <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--text-accent); font-weight: bold; font-size: 0.8rem;">|-⟩</div>
                    
                    <!-- State vector -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 4px; height: 4px; background: #ff6b6b; border-radius: 50%; box-shadow: 0 0 10px #ff6b6b;"></div>
                    
                    <!-- Grid lines -->
                    <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: rgba(6, 182, 212, 0.3);"></div>
                    <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: rgba(6, 182, 212, 0.3);"></div>
                </div>
                
                <div style="margin-top: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.8rem;">
                    <div><strong>Current State:</strong> |0⟩</div>
                    <div><strong>Coordinates:</strong> (0, 0, 1)</div>
                    <div style="margin-top: 0.5rem; color: var(--text-accent);">Interactive 3D version loading...</div>
                </div>
                
                <button onclick="window.hackathonDashboard.updateBlochSphereWidget()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--quantum-gradient); color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                    <i class="fas fa-sync-alt"></i> Retry 3D
                </button>
            </div>
        `;
    }

    // Bloch control methods
    blochRestart() {
        window.QMSTATEVECTOR = [gen_state(true)];
        window.BLOCHSPHERE = gen_bloch_sphere();
        window.STATEARROW = gen_vector_plot(state2vector(window.QMSTATEVECTOR[window.QMSTATEVECTOR.length-1]));
        window.PHOSPHOR = [];
        window.PHOSPHOR_ENABLED = true;
        this.update_state_plot();
        this.updateBlochStateInfo();
    }

    blochUndo() {
        if (window.QMSTATEVECTOR.length > 1) {
            window.QMSTATEVECTOR.pop();
            window.PHOSPHOR.pop();
            this.update_state_plot();
            this.updateBlochStateInfo();
        }
    }

    blochRotate(axis, angle) {
        window.QMSTATEVECTOR.push(rot(axis, angle, window.QMSTATEVECTOR[window.QMSTATEVECTOR.length-1]));
        this.rot_phosphor(axis, angle, window.QMSTATEVECTOR[window.QMSTATEVECTOR.length-2], Math.max(6, Math.round(angle/(0.5*Math.PI)*10)));
        this.update_state_plot();
        this.updateBlochStateInfo();
    }

    blochCustomRotate(axis) {
        const angleInput = document.getElementById('custom-angle');
        if (angleInput) {
            const angle = parseFloat(angleInput.value) * Math.PI / 180;
            this.blochRotate(axis, angle);
        }
    }

    blochHadamard() {
        const opX = math.matrix([[0, math.complex(0.5, 0)], [math.complex(0.5, 0), 0]]);
        const opZ = math.matrix([[math.complex(0.5, 0), 0], [0, math.complex(-0.5, 0)]]);
        const rot_op = math.add(math.multiply(opX, 1/Math.sqrt(2)), math.multiply(opZ, 1/Math.sqrt(2)));
        this.blochRotate(rot_op, Math.PI);
    }

    // Use global Blochy update function
    update_state_plot(full_update=false) {
        update_state_plot(full_update);
    }

    rot_phosphor(axis_op, angle, state, divider = 10) {
        const uarr = [];
        const varr = [];
        const warr = [];
        let [u, v, w] = state2vector(state);
        uarr.push(u);
        varr.push(v);
        warr.push(w);
        
        for (let i = 1; i <= divider; i++) {
            const staten = rot(axis_op, angle/divider*i, state);
            [u, v, w] = state2vector(staten);
            uarr.push(u);
            varr.push(v);
            warr.push(w);
        }
        
        const hist = {
            x: uarr, y: varr, z: warr,
            type: 'scatter3d',
            showscale: false,
            hoverinfo: 'skip', 
            mode: 'lines',
            opacity: 1.0,
            line: {color: '#06b6d4', width: 3}
        };
        window.PHOSPHOR.push(hist);
    }

    updateBlochPlot() {
        const plotContainer = document.getElementById('bloch-plot');
        if (plotContainer) {
            window.STATEARROW = this.gen_vector_plot(this.state2vector(window.QMSTATEVECTOR[window.QMSTATEVECTOR.length-1]));
            const data = window.BLOCHSPHERE.concat(window.STATEARROW).concat(window.PHOSPHOR);
            Plotly.react(plotContainer, data, {}, {});
        }
    }

    updateBlochStateInfo() {
        const stateInfo = document.getElementById('bloch-state-info');
        if (stateInfo && window.QMSTATEVECTOR.length > 0) {
            const [u, v, w] = this.state2vector(window.QMSTATEVECTOR[window.QMSTATEVECTOR.length-1]);
            const operations = window.QMSTATEVECTOR.length - 1;
            
            // Determine state representation
            let stateText = '|ψ⟩';
            if (Math.abs(w - 1) < 0.01) stateText = '|0⟩';
            else if (Math.abs(w + 1) < 0.01) stateText = '|1⟩';
            else if (Math.abs(u - 1) < 0.01 && Math.abs(v) < 0.01 && Math.abs(w) < 0.01) stateText = '|+⟩';
            else if (Math.abs(u + 1) < 0.01 && Math.abs(v) < 0.01 && Math.abs(w) < 0.01) stateText = '|-⟩';
            
            stateInfo.innerHTML = `
                <strong>Current State:</strong> ${stateText}<br>
                <strong>Coordinates:</strong> (${u.toFixed(2)}, ${v.toFixed(2)}, ${w.toFixed(2)})<br>
                <strong>Operations:</strong> ${operations}
            `;
        }
    }

    async updateCircuitWidget() {
        const contentElement = document.getElementById('circuit-content');
        if (!contentElement) return;

        try {
            // Create a working quantum circuit visualization
            this.createWorkingCircuitVisualization(contentElement);
        } catch (error) {
            console.error('Error creating circuit visualization:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading circuit visualization</p>';
        }
    }

    createWorkingCircuitVisualization(container) {
        // Clear any existing content
        container.innerHTML = '';
        
        try {
            // Create a quantum circuit visualization
            const data = [{
                type: 'scatter',
                mode: 'lines+markers',
                x: [0, 1, 2, 3, 4, 5],
                y: [0, 1, 0, 1, 0, 1],
                line: { color: '#06b6d4', width: 3 },
                marker: { size: 12, color: '#3b82f6', symbol: 'circle' },
                name: 'Quantum Circuit',
                text: ['H', 'CNOT', 'X', 'Y', 'Z', 'Measure'],
                textposition: 'top center',
                textfont: { color: '#ffffff', size: 12 }
            }];

            const layout = {
                title: {
                    text: 'Quantum Circuit - Quantum Spark',
                    font: { size: 16, color: '#06b6d4' }
                },
                xaxis: { 
                    title: 'Time Steps',
                    titlefont: { color: '#06b6d4' },
                    gridcolor: 'rgba(6, 182, 212, 0.3)',
                    range: [-0.5, 5.5]
                },
                yaxis: { 
                    title: 'Qubits',
                    titlefont: { color: '#06b6d4' },
                    gridcolor: 'rgba(6, 182, 212, 0.3)',
                    range: [-0.5, 1.5],
                    tickmode: 'array',
                    tickvals: [0, 1],
                    ticktext: ['Qubit 0', 'Qubit 1']
                },
                margin: { t: 50, b: 50, l: 50, r: 50 },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
            };

            const config = {
                responsive: true,
                displayModeBar: true,
                displaylogo: false
            };

            Plotly.newPlot(container, data, layout, config);
            console.log('✅ Circuit visualization created successfully!');
            
        } catch (error) {
            console.error('❌ Error creating circuit visualization:', error);
            
            // Fallback display
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ffffff; background: rgba(0,0,0,0.5); border-radius: 12px; border: 2px solid #00d4ff;">
                    <h2 style="color: #00d4ff; margin-bottom: 20px;">⚡ Quantum Circuit</h2>
                    <p style="font-size: 16px; margin-bottom: 15px;">Quantum Gate Visualization</p>
                    <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Gates:</strong> H, CNOT, X, Y, Z</p>
                        <p style="margin: 5px 0;"><strong>Qubits:</strong> 2</p>
                        <p style="margin: 5px 0;"><strong>Depth:</strong> 6</p>
                    </div>
                    <p style="font-size: 14px; opacity: 0.8;">Interactive circuit visualization loading...</p>
                </div>
            `;
        }
    }

    async updatePerformanceWidget() {
        const contentElement = document.getElementById('performance-content');
        if (!contentElement) return;

        try {
            const response = await fetch('/api/performance');
            const data = await response.json();
            
            if (data.success && data.performance_data) {
                const performanceData = data.performance_data;
                
                // Convert timestamps to readable format
                const readableTimestamps = performanceData.timestamps.map(ts => 
                    new Date(ts * 1000).toLocaleTimeString()
                );
                
                const plotData = [{
                    type: 'scatter',
                    mode: 'lines+markers',
                    x: readableTimestamps,
                    y: performanceData.values || [],
                    line: { color: '#10b981', width: 3 },
                    marker: { size: 6, color: '#10b981' },
                    name: 'Real Performance Metrics',
                    fill: 'tonexty'
                }];

                const layout = {
                    title: {
                        text: 'Real Performance Metrics - IBM Quantum',
                        font: { size: 16, color: '#10b981' }
                    },
                    xaxis: { 
                        title: 'Time',
                        titlefont: { color: '#10b981' },
                        gridcolor: 'rgba(16, 185, 129, 0.3)'
                    },
                    yaxis: { 
                        title: 'Fidelity',
                        titlefont: { color: '#10b981' },
                        gridcolor: 'rgba(16, 185, 129, 0.3)',
                        range: [0, 1]
                    },
                    margin: { t: 50, b: 50, l: 50, r: 50 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)'
                };

                const config = {
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false
                };

                Plotly.newPlot(contentElement, plotData, layout, config);
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No real performance data available. Please connect to IBM Quantum.</p>';
            }
        } catch (error) {
            console.error('Error fetching performance data:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading performance data</p>';
        }
    }

    async updateEntanglementWidget() {
        const contentElement = document.getElementById('entanglement-content');
        if (!contentElement) return;

        try {
            const response = await fetch('/api/entanglement');
            const data = await response.json();
            
            if (data.success && data.entanglement_data) {
                const entanglementData = data.entanglement_data;
                
                const plotData = [{
                    type: 'bar',
                    x: entanglementData.labels || [],
                    y: entanglementData.values || [],
                    marker: { 
                        color: entanglementData.values.map(v => 
                            v > 0.7 ? '#10b981' : v > 0.4 ? '#f59e0b' : '#ef4444'
                        ),
                        line: { color: 'white', width: 1 }
                    },
                    name: 'Real Entanglement Analysis',
                    text: entanglementData.values.map(v => v.toFixed(3)),
                    textposition: 'auto'
                }];

                const layout = {
                    title: {
                        text: 'Real Entanglement Analysis - IBM Quantum',
                        font: { size: 16, color: '#8b5cf6' }
                    },
                    xaxis: { 
                        title: 'Qubit Pairs',
                        titlefont: { color: '#8b5cf6' },
                        gridcolor: 'rgba(139, 92, 246, 0.3)'
                    },
                    yaxis: { 
                        title: 'Entanglement Value',
                        titlefont: { color: '#8b5cf6' },
                        gridcolor: 'rgba(139, 92, 246, 0.3)',
                        range: [0, 1]
                    },
                    margin: { t: 50, b: 50, l: 50, r: 50 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)'
                };

                const config = {
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false
                };

                Plotly.newPlot(contentElement, plotData, layout, config);
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No real entanglement data available. Please connect to IBM Quantum.</p>';
            }
        } catch (error) {
            console.error('Error fetching entanglement data:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading entanglement data</p>';
        }
    }

    createEnhancedBlochSphere() {
        // Create a more detailed wireframe sphere
        const phi = [];
        const theta = [];
        const x = [];
        const y = [];
        const z = [];
        
        const n = 30;
        for (let i = 0; i <= n; i++) {
            for (let j = 0; j <= n; j++) {
                const t = (i / n) * Math.PI;
                const p = (j / n) * 2 * Math.PI;
                
                phi.push(p);
                theta.push(t);
                x.push(Math.sin(t) * Math.cos(p));
                y.push(Math.sin(t) * Math.sin(p));
                z.push(Math.cos(t));
            }
        }
        
        return [{
            type: 'scatter3d',
            mode: 'markers',
            x: x,
            y: y,
            z: z,
            marker: {
                size: 2,
                color: 'rgba(6, 182, 212, 0.3)',
                symbol: 'circle'
            },
            name: 'Bloch Sphere',
            showlegend: false,
            hoverinfo: 'skip'
        }];
    }

    handleWidgetAction(widget, action) {
        const widgetType = widget.getAttribute('data-widget');
        
        switch (action) {
            case 'refresh':
                this.updateWidget(widgetType);
                this.showNotification(`${widgetType} widget refreshed`, 'success');
                break;
            case 'popup':
                this.openPopup(widget, widgetType);
                break;
            case 'fullscreen':
                this.openFullscreen(widget, widgetType);
                break;
            case 'remove':
                this.removeWidget(widget);
                break;
        }
    }

    openPopup(widget, widgetType) {
        this.popupWidget = widgetType;
        const popupOverlay = document.getElementById('popup-overlay');
        const popupTitle = document.getElementById('popup-title');
        const popupContent = document.getElementById('popup-content');
        
        popupTitle.textContent = `${widgetType.replace('-', ' ').toUpperCase()} - Team Quantum Spark`;
        
        // Clone widget content to popup
        const widgetContent = widget.querySelector('.widget-content');
        popupContent.innerHTML = widgetContent.innerHTML;
        
        // Fix onclick handlers for popup context
        if (widgetType === 'jobs') {
            // Update expand/collapse buttons to work in popup
            const expandButtons = popupContent.querySelectorAll('button[onclick*="showAllJobs"]');
            expandButtons.forEach(button => {
                button.setAttribute('onclick', 'window.hackathonDashboard.showAllJobsInPopup()');
            });
            
            const collapseButtons = popupContent.querySelectorAll('button[onclick*="showFewJobs"]');
            collapseButtons.forEach(button => {
                button.setAttribute('onclick', 'window.hackathonDashboard.showFewJobsInPopup()');
            });
        }
        
        // Re-render Plotly charts in popup
        setTimeout(() => {
            const plotlyDivs = popupContent.querySelectorAll('.plotly-graph-div');
            plotlyDivs.forEach(div => {
                Plotly.Plots.resize(div);
            });
        }, 100);
        
        popupOverlay.classList.add('active');
    }

    closePopup() {
        const popupOverlay = document.getElementById('popup-overlay');
        popupOverlay.classList.remove('active');
        this.popupWidget = null;
    }

    // Popup-specific methods for jobs widget
    showAllJobsInPopup() {
        const popupContent = document.getElementById('popup-content');
        if (!popupContent || !this.allJobs) return;

        const jobsHtml = this.allJobs.map(job => `
            <div style="padding: 1rem; border: 1px solid var(--glass-border); border-radius: var(--border-radius); margin-bottom: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 0.875rem; font-family: var(--font-mono);">${job.job_id || 'Job ' + job.id || 'Unknown Job'}</h4>
                    <span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; background: ${this.getJobStatusColor(job.status)}; color: white;">
                        ${job.status || 'Unknown'}
                    </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    <div style="margin-bottom: 0.25rem;"><i class="fas fa-server"></i> Backend: ${job.backend || 'N/A'}</div>
                    <div><i class="fas fa-calendar"></i> Created: ${this.formatJobDate(job.creation_date)}</div>
                </div>
            </div>
        `).join('');

        const collapseButton = `
            <div style="text-align: center; margin-top: 1rem;">
                <button onclick="window.hackathonDashboard.showFewJobsInPopup()" class="job-collapse-btn">
                    <i class="fas fa-compress"></i> Show Less
                </button>
            </div>
        `;

        popupContent.innerHTML = jobsHtml + collapseButton;
    }

    showFewJobsInPopup() {
        const popupContent = document.getElementById('popup-content');
        if (!popupContent || !this.allJobs) return;

        // Show only first 3 jobs
        const displayJobs = this.allJobs.slice(0, 3);
        const hasMoreJobs = this.allJobs.length > 3;

        const jobsHtml = displayJobs.map(job => `
            <div style="padding: 1rem; border: 1px solid var(--glass-border); border-radius: var(--border-radius); margin-bottom: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 0.875rem; font-family: var(--font-mono);">${job.job_id || 'Job ' + job.id || 'Unknown Job'}</h4>
                    <span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; background: ${this.getJobStatusColor(job.status)}; color: white;">
                        ${job.status || 'Unknown'}
                    </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    <div style="margin-bottom: 0.25rem;"><i class="fas fa-server"></i> Backend: ${job.backend || 'N/A'}</div>
                    <div><i class="fas fa-calendar"></i> Created: ${this.formatJobDate(job.creation_date)}</div>
                </div>
            </div>
        `).join('');

        const expandButton = hasMoreJobs ? `
            <div style="text-align: center; margin-top: 1rem;">
                <button onclick="window.hackathonDashboard.showAllJobsInPopup()" class="job-expand-btn">
                    <i class="fas fa-expand"></i> Show All ${this.allJobs.length} Jobs
                </button>
            </div>
        ` : '';

        popupContent.innerHTML = jobsHtml + expandButton;
    }

    openFullscreen(widget, widgetType) {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            const fullscreenContent = widget.querySelector('.widget-content');
            fullscreenContent.requestFullscreen().then(() => {
                // Re-render Plotly charts in fullscreen
                setTimeout(() => {
                    const plotlyDivs = fullscreenContent.querySelectorAll('.plotly-graph-div');
                    plotlyDivs.forEach(div => {
                        Plotly.Plots.resize(div);
                    });
                }, 100);
            });
        }
    }

    removeWidget(widget) {
        const widgetType = widget.getAttribute('data-widget');
        
        // Add removal animation
        widget.style.transform = 'scale(0.8)';
        widget.style.opacity = '0';
        
        setTimeout(() => {
            this.widgets.delete(widgetType);
            widget.remove();
            this.saveWidgetOrder();
            this.showNotification(`${widgetType} widget removed`, 'info');
        }, 300);
    }

    addWidget(widgetType) {
        if (this.widgets.has(widgetType)) {
            this.showNotification('Widget already exists', 'warning');
            return;
        }

        // Create widget HTML
        const widgetHtml = this.createWidgetHtml(widgetType);
        const widgetElement = document.createElement('div');
        widgetElement.innerHTML = widgetHtml;
        const widget = widgetElement.firstElementChild;

        // Add to grid with animation
        widget.style.opacity = '0';
        widget.style.transform = 'scale(0.8)';
        document.getElementById('widget-grid').appendChild(widget);
        this.widgets.set(widgetType, widget);

        // Animate in
        setTimeout(() => {
            widget.style.opacity = '1';
            widget.style.transform = 'scale(1)';
        }, 100);

        // Update the widget
        this.updateWidget(widgetType);
        this.saveWidgetOrder();
        
        this.showNotification(`Added ${widgetType} widget`, 'success');
    }

    createWidgetHtml(widgetType) {
        const widgetTemplates = {
            'backends': {
                title: 'Quantum Backends',
                icon: 'fas fa-server',
                contentId: 'backends-content'
            },
            'jobs': {
                title: 'Quantum Jobs',
                icon: 'fas fa-tasks',
                contentId: 'jobs-content'
            },
            'bloch-sphere': {
                title: '3D Bloch Sphere',
                icon: 'fas fa-globe',
                contentId: 'bloch-content',
                isVisualization: true
            },
            'circuit': {
                title: 'Quantum Circuit',
                icon: 'fas fa-project-diagram',
                contentId: 'circuit-content',
                isVisualization: true
            },
            'performance': {
                title: 'Performance',
                icon: 'fas fa-chart-line',
                contentId: 'performance-content',
                isVisualization: true
            },
            'entanglement': {
                title: 'Entanglement Analysis',
                icon: 'fas fa-link',
                contentId: 'entanglement-content',
                isVisualization: true
            }
        };

        const template = widgetTemplates[widgetType];
        if (!template) return '';

        const contentClass = template.isVisualization ? 'visualization-container' : '';
        
        return `
            <div class="widget fade-in" data-widget="${widgetType}">
                <div class="widget-header">
                    <h3 class="widget-title">
                        <i class="${template.icon}"></i>
                        ${template.title}
                    </h3>
                    <div class="widget-controls">
                        <button class="widget-btn" data-action="refresh" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="widget-btn" data-action="popup" title="Popup View">
                            <i class="fas fa-expand"></i>
                        </button>
                        <button class="widget-btn" data-action="fullscreen" title="Fullscreen">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button class="widget-btn" data-action="remove" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="loading" id="${widgetType}-loading">
                        <div class="spinner"></div>
                        <span>Loading ${template.title.toLowerCase()}...</span>
                    </div>
                    <div class="${contentClass}" id="${template.contentId}" style="display: none;">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    toggleCustomizationPanel() {
        const panel = document.getElementById('customization-panel');
        panel.classList.toggle('open');
    }

    async refreshAllWidgets() {
        this.showNotification('Refreshing all widgets...', 'info');
        await this.fetchDashboardData();
        this.updateMetrics();
        await this.updateAllWidgets();
        this.showNotification('All widgets refreshed successfully', 'success');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <i class="${icon}"></i>
            <div style="flex: 1;">
                <div style="font-weight: 500;">${message}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${new Date().toLocaleTimeString()}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getStatusColor(status) {
        const colors = {
            'active': '#10b981',
            'inactive': '#6b7280',
            'maintenance': '#f59e0b',
            'error': '#ef4444'
        };
        return colors[status] || colors.inactive;
    }

    getJobStatusColor(status) {
        const colors = {
            'completed': '#10b981',
            'running': '#3b82f6',
            'queued': '#f59e0b',
            'failed': '#ef4444',
            'cancelled': '#6b7280'
        };
        return colors[status] || colors.queued;
    }

    saveWidgetOrder() {
        const widgetOrder = Array.from(document.querySelectorAll('.widget')).map(widget => 
            widget.getAttribute('data-widget')
        );
        localStorage.setItem('quantum-spark-widget-order', JSON.stringify(widgetOrder));
    }

    loadWidgetOrder() {
        const savedOrder = localStorage.getItem('quantum-spark-widget-order');
        if (savedOrder) {
            try {
                const order = JSON.parse(savedOrder);
                const widgetGrid = document.getElementById('widget-grid');
                const widgets = Array.from(widgetGrid.children);
                
                // Reorder widgets based on saved order
                order.forEach(widgetType => {
                    const widget = widgets.find(w => w.getAttribute('data-widget') === widgetType);
                    if (widget) {
                        widgetGrid.appendChild(widget);
                    }
                });
            } catch (error) {
                console.error('Error loading widget order:', error);
            }
        }
    }
}

// ===== GLOBAL BLOCHY FUNCTIONS - EXACT COPIES =====
// These must be global functions, not class methods, to work with Blochy code

function state2vector(state) {
    // https://en.wikipedia.org/wiki/Bloch_sphere#u,_v,_w_representation
    r01 = math.multiply(state['_data'][0],math.conj(state['_data'][1]));
    r00 = math.multiply(state['_data'][0],math.conj(state['_data'][0]));
    r11 = math.multiply(state['_data'][1],math.conj(state['_data'][1]));
    u = -2*math.re(r01);
    v = 2*math.im(r01);
    w = math.re(r00-r11);
    return [u,v,w]
}

function rot(axis_op, angle, ...state) {
    //rot_op = (-1j*phi*op).expm()
    if (typeof(axis_op) === 'string') {
        if (axis_op === 'x') {
            op = math.matrix([[0,math.complex(0.5,0)],[math.complex(0.5,0),0]]);
        }
        else if (axis_op === 'y') {
            op =  math.matrix([[0,math.complex(0,-0.5)],[math.complex(0,0.5),0]]);
        }
        else if (axis_op === 'z') {
            op = math.matrix([[math.complex(0.5,0),0],[0,math.complex(-0.5,0)]]);
        }
        else {
            throw 'Unknown axis string';
        } 
    }
    else {
        op = axis_op;
    }

    rot_op = math.expm(math.multiply(math.complex(0,-angle),op));
    
    if (state.length === 0) {
        return rot_op
    }
    else {
        return math.multiply(rot_op,state[0])
    }
}

function gen_state(up_is_true) {
    if (up_is_true) {
        return math.matrix([1,0])
    }
    else {
        return math.matrix([0,1])
    }
}

function gen_bloch_sphere() {
    theta = linspace(0,Math.PI,20);
    phi = linspace(0,2*Math.PI,40);
    [u,v] = meshgrid(theta,phi);
    su = math.map(u,math.sin);
    xs = math.dotMultiply(math.map(v,math.cos),su);
    ys = math.dotMultiply(math.map(v,math.sin),su);
    zs = math.map(u,math.cos);

    var x = []
    var y = []
    var z = []
    var xb = []
    var yb = []
    var zb = []
    for (var i = 0; i < 12; i++) {
        //meridians 
        t = i*math.PI/6;
        xcurr = math.multiply(math.map(theta,math.sin),math.cos(t));
        ycurr = math.multiply(math.map(theta,math.sin),math.sin(t));
        zcurr = math.map(theta,math.cos);
        if ([0,3,6,9].includes(i)) {
            xb = xb.concat(xcurr);
            xb = xb.concat([null]);
            
            yb = yb.concat(ycurr);
            yb = yb.concat([null]);
            
            zb = zb.concat(zcurr);
            zb = zb.concat([null]);

        }
        else {
            x = x.concat(xcurr);
            x = x.concat([null]);
            
            y = y.concat(ycurr);
            y = y.concat([null]);
            
            z = z.concat(zcurr);
            z = z.concat([null]);
        }

    }
    for (var i = 1; i < 9; i++) {
        //parallels
        t = i*math.PI/6;
        xcurr = math.multiply(math.map(phi,math.cos),math.sin(t));
        ycurr = math.multiply(math.map(phi,math.sin),math.sin(t));
        zcurr = Array(phi.length).fill(math.cos(t));

        if ([3].includes(i)) {
            xb = xb.concat(xcurr);
            xb = xb.concat([null]);
            
            yb = yb.concat(ycurr);
            yb = yb.concat([null]);
            
            zb = zb.concat(zcurr);
            zb = zb.concat([null]);
        }
        else {
            x = x.concat(xcurr);
            x = x.concat([null]);
            
            y = y.concat(ycurr);
            y = y.concat([null]);
    
            z = z.concat(zcurr);
            z = z.concat([null]);
        }        
    }

    var sphere = {
        name: 'sphere',
        x:xs, y: ys, z: zs,
        type: 'surface',
        colorscale: [['0.0', '#AAAAAA' ], ['1.0', '#AAAAAA']],
        showscale: false,
        opacity:0.1,
        hoverinfo: 'skip',
        contours: {
            x : {
                highlight: false
            },
            y : {
                highlight: false
            },
            z : {
                highlight: false
            }
        }
    };

    var gridlines = {
        name: 'gridlines_bold',
        x:x, y: y, z: z,
        type: 'scatter3d',
        showscale: false,
        hoverinfo: 'skip', 
        mode: 'lines',
        opacity: 0.05,
        line: {color: '#000000', width:3},
    }

    var gridlines_bold = {
        name: 'gridlines_bold',
        x:xb, y: yb, z: zb,
        type: 'scatter3d',
        showscale: false,
        hoverinfo: 'skip', 
        mode: 'lines',
        opacity: 0.075,
        line: {color: '#000000', width:3},
    }

    var equator_plane = {
        name: 'equator_plane',
        x: xs, y:ys, z:math.multiply(zs,0),
        type: 'surface',
        colorscale: [['0.0', '#AAAAAA' ], ['1.0', '#AAAAAA']],
        showscale: false,
        opacity:0.075,
        hoverinfo: 'skip',

    }

    north_text = "0";
    south_text = "1";
    if (north_text != "") {
        north_text = "￨" + north_text + "〉"
    }
    if (south_text != "") {
        south_text = "￨" + south_text + "〉"
    }

    var axes = {
        name: 'axes',
        x: [-1,1,null,0,0,null,0,0], y:[0,0,null,-1,1,null,0,0], z:[0,0,null,0,0,null,-1,1],
        type: 'scatter3d',
        showscale: false,
        hoverinfo: 'skip', 
        mode: 'lines+text',
        opacity: 0.5,
        line: {color: '#000000', width:3},
        text: ["x","","","y","","","",north_text,""],
        textfont: {
            size:30,
            color: "#000000"
        },
        textposition: 'top center'
    }
    var lower_tag = {
        x: [0], y:[0], z:[-1],
        type: 'scatter3d',
        showscale: false,
        hoverinfo: 'skip', 
        mode: 'text',
        opacity: 0.5,
        line: {color: '#000000', width:3},
        text: [south_text],
        textfont: {
            size:30,
            color: "#000000"
        },
        textposition: 'bottom center'
    }

    return [sphere, gridlines, gridlines_bold,equator_plane,axes,lower_tag]
}

function gen_vector_plot(vector,normalize=true) {
    color = '#1a237e'; // Default color
    [u,v,w] = vector;
    if (normalize === true) {
        l = math.sqrt(u**2+v**2+w**2);
        u = u/l;
        v = v/l;
        w = w/l;
    }
    hovertext = '￨Ψ〉= ￨0〉+ 0.5 ￨1〉<extra></extra>';
    
    zax = [u,v,w];
    [q,p] = cylinder_axes(zax);

    xarr =Array(0);
    yarr = Array(0);
    zarr = Array(0);
    
    for (var i = 0; i < 7; i++) {
        phi = 2*Math.PI*i/6;
        r = 0.025;
        l = 0.9
        xarr.push([(q[0]*math.cos(phi)+p[0]*math.sin(phi))*r,(q[0]*math.cos(phi)+p[0]*math.sin(phi))*r+zax[0]*l]);
        yarr.push([(q[1]*math.cos(phi)+p[1]*math.sin(phi))*r,(q[1]*math.cos(phi)+p[1]*math.sin(phi))*r+zax[1]*l]);
        zarr.push([(q[2]*math.cos(phi)+p[2]*math.sin(phi))*r,(q[2]*math.cos(phi)+p[2]*math.sin(phi))*r+zax[2]*l]);
    }

    var upp = {
        name: 'tail',
        x:xarr, y: yarr, z: zarr,
        type: 'surface',
        colorscale: [['0.0', color], ['1.0',color]],
        showscale: false,
        opacity:1.0,
        hovertemplate: hovertext,
        contours: {
            x : {
                highlight: false
            },
            y : {
                highlight: false
            },
            z : {
                highlight: false
            }
        }
    };
    var head = {
        u: [0.3*(u)],
        v: [0.3*(v)],
        w: [0.3*(w)],
        sizemode: 'absolute',
        sizeref: .25,
        hovertemplate: hovertext,
        colorscale: [['0.0', color], ['1.0',color]],
        showscale: false,
        type: 'cone',
        anchor: 'tip',
        x: [u],
        y: [v],
        z: [w]
    }
    return [head,upp]
}

function cylinder_axes(v,k=[2,0,0]) {
    // v needs to be normalized, k must not be parallel to v
    // t is height
    //k = [2,0,0];
    //vp = (k+p2)-((k+p2)*p2)*p2;
    //c = vp/norm(vp);
    //p = (1-t)*p2 + c*d*cos(phi) + u*d*sin(phi);
    qp = math.subtract(k,math.dotMultiply(Array(3).fill(math.dot(v,k)),v));
    //console.log(qp);
    q = math.dotMultiply(qp,Array(3).fill(1/math.norm(qp,2)));
    //console.log("-----------");
    //console.log(q);
    p = math.cross(v,q);
    p = math.dotMultiply(p,Array(3).fill(1/math.norm(p,2)));
    //console.log("+++++++++++")
    //console.log(p);
    return [q,p]
}

function linspace(start, stop, num) {
    const step = (stop - start) / (num - 1);
    return Array.from({length: num}, (_, i) => start + i * step);
}

function meshgrid(x, y) {
    const resultX = [];
    const resultY = [];
    for (let i = 0; i < y.length; i++) {
        resultX.push([...x]);
        resultY.push(Array(x.length).fill(y[i]));
    }
    return [resultX, resultY];
}

function init_plotting(data) {
    const config = {
        displayModeBar: false, // hide toolbar
        responsive:true // resize 
    };

    var layout = {
        hovermode: 'closest',
        scene: {
            xaxis: {
                showspikes: false,
                showgrid: false,
                zeroline: false,
                showline: false,
                visible: false,
                ticks: '',
                showticklabels: false,
                range: [-1.1,1.1]
            }, 
            yaxis: {
                showspikes: false,
                showgrid: false,
                zeroline: false,
                showline: false,
                visible: false,
                ticks: '',
                showticklabels: false,
                range: [-1.1,1.1]
            },
            zaxis: {
                showspikes: false,
                showgrid: false,
                zeroline: false,
                showline: false,
                visible: false,
                ticks: '',
                showticklabels: false,
                range: [-1.1,1.1]
            },
            camera: {
                center: {
                    x:0, y:0,z:0
                },
                eye: {
                    x:-0.9, y:1, z:0.6
                },
                projection: 'perspective'
            }
        },
        showlegend: false,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
        annotations: [
            {
                showarrow: false,
                text: 'Quantum Spark',
                x:1.0,
                y:0.0,
                xref: 'paper',
                yref: 'paper', 
                xanchor: 'right',
                yanchor: 'bottom',
                opacity: 0.4
            }
        ]
    };

    Plotly.react('bloch-plot', data, layout, config);
}

function update_state_plot(full_update=false) {
    point_vector = state2vector(window.QMSTATEVECTOR[window.QMSTATEVECTOR.length-1]);
    new_data = gen_vector_plot(point_vector);
    if (window.PHOSPHOR_ENABLED === true) {
        phosphor_length = 10; // Default phosphor length
        startidx = window.PHOSPHOR.length-1-phosphor_length;
        if (startidx < 0) {
            startidx = 0;
        }
        stopidx = window.PHOSPHOR.length;
        phosphor_data = window.PHOSPHOR.slice(startidx,stopidx);
    }
    else {
        phosphor_data = []
    }
    
    init_plotting(window.BLOCHSPHERE.concat(new_data).concat(phosphor_data));
}

// Fix for Math.js exports issue
if (typeof exports === 'undefined') {
    window.exports = {};
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all libraries to load
    setTimeout(() => {
        try {
            // Check if required libraries are loaded
            console.log('🔍 Checking library dependencies...');
            console.log('Plotly available:', typeof Plotly !== 'undefined');
            console.log('Math.js available:', typeof math !== 'undefined');
            console.log('Sortable available:', typeof Sortable !== 'undefined');
            
            if (typeof Plotly === 'undefined') {
                console.error('❌ Plotly not loaded!');
                return;
            }
            
            if (typeof math === 'undefined') {
                console.error('❌ Math.js not loaded!');
                return;
            }
            
            window.hackathonDashboard = new HackathonDashboard();
            
            // Add team branding
            console.log('🚀 Quantum Spark - Amravati Quantum Hackathon 2024');
            console.log('👨‍💻 Developed by Satish Kumar');
            console.log('🏆 Ready to win the hackathon!');
        } catch (error) {
            console.error('❌ Error initializing dashboard:', error);
        }
    }, 100);
});