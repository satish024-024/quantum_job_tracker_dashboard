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
        // Create EventSource for real-time notifications
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
            // Reconnect after 5 seconds
            setTimeout(() => {
                if (this.eventSource.readyState === EventSource.CLOSED) {
                    this.setupSSE();
                }
            }, 5000);
        };
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
        const widgets = ['backends', 'jobs', 'bloch-sphere', 'circuit', 'performance', 'entanglement', 'results', 'quantum-state', 'ai-chat'];
        
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
                case 'results':
                    await this.updateResultsWidget();
                    break;
                case 'quantum-state':
                    await this.updateQuantumStateWidget();
                    break;
                case 'ai-chat':
                    await this.updateAIChatWidget();
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

        const jobsHtml = jobs.slice(0, 5).map(job => `
            <div style="padding: 1rem; border: 1px solid var(--glass-border); border-radius: var(--border-radius); margin-bottom: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 0.875rem; font-family: var(--font-mono);">${job.job_id || 'Unknown Job'}</h4>
                    <span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; background: ${this.getJobStatusColor(job.status)}; color: white;">
                        ${job.status}
                    </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    <div style="margin-bottom: 0.25rem;"><i class="fas fa-server"></i> Backend: ${job.backend || 'N/A'}</div>
                    <div><i class="fas fa-calendar"></i> Created: ${new Date(job.creation_date || Date.now()).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');

        contentElement.innerHTML = jobsHtml;
    }

    async updateBlochSphereWidget() {
        const contentElement = document.getElementById('bloch-content');
        if (!contentElement) return;

        try {
            // Initialize Blochy sphere if available
            if (typeof init_bloch_sphere === 'function') {
                console.log('🚀 Initializing Blochy sphere...');
                await init_bloch_sphere();
                console.log('✅ Blochy sphere initialized');
            } else {
                // Fallback to enhanced Plotly sphere
                console.log('🔄 Using enhanced Plotly sphere as fallback...');
                await this.createEnhancedBlochSphereFallback(contentElement);
            }
        } catch (error) {
            console.error('Error initializing Bloch sphere:', error);
            // Final fallback
            await this.createEnhancedBlochSphereFallback(contentElement);
        }
    }

    async createEnhancedBlochSphereFallback(container) {
        try {
            // Fetch real quantum state data from API
            const response = await fetch('/api/quantum_state');
            const data = await response.json();
            
            if (data.success && data.state_data) {
                const stateData = data.state_data;
                
                // Create enhanced 3D Bloch sphere
                const x = stateData.x || [0];
                const y = stateData.y || [0];
                const z = stateData.z || [1];
                
                // Create sphere surface
                const sphereData = this.createEnhancedBlochSphere();
                
                // Add quantum state point
                const statePoint = {
                    type: 'scatter3d',
                    mode: 'markers',
                    x: x,
                    y: y,
                    z: z,
                    marker: {
                        size: 15,
                        color: '#06b6d4',
                        symbol: 'circle',
                        line: { color: 'white', width: 3 }
                    },
                    name: 'Quantum State',
                    text: [`|ψ⟩ = ${stateData.alpha || 'α'}|0⟩ + ${stateData.beta || 'β'}|1⟩`],
                    hovertemplate: '<b>Quantum State</b><br>%{text}<br>X: %{x:.3f}<br>Y: %{y:.3f}<br>Z: %{z:.3f}<extra></extra>'
                };

                const plotData = [...sphereData, statePoint];

                const layout = {
                    title: {
                        text: '3D Bloch Sphere - Quantum Spark',
                        font: { size: 16, color: '#06b6d4' }
                    },
                    scene: {
                        xaxis: { 
                            title: 'X', 
                            range: [-1.2, 1.2],
                            showgrid: true,
                            gridcolor: 'rgba(6, 182, 212, 0.3)',
                            titlefont: { color: '#06b6d4' }
                        },
                        yaxis: { 
                            title: 'Y', 
                            range: [-1.2, 1.2],
                            showgrid: true,
                            gridcolor: 'rgba(6, 182, 212, 0.3)',
                            titlefont: { color: '#06b6d4' }
                        },
                        zaxis: { 
                            title: 'Z', 
                            range: [-1.2, 1.2],
                            showgrid: true,
                            gridcolor: 'rgba(6, 182, 212, 0.3)',
                            titlefont: { color: '#06b6d4' }
                        },
                        aspectmode: 'cube',
                        camera: {
                            eye: { x: 1.5, y: 1.5, z: 1.5 }
                        },
                        bgcolor: 'rgba(0,0,0,0)'
                    },
                    margin: { t: 50, b: 0, l: 0, r: 0 },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)'
                };

                const config = {
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
                };

                Plotly.newPlot(container, plotData, layout, config);
            } else {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No quantum state data available</p>';
            }
        } catch (error) {
            console.error('Error creating fallback Bloch sphere:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading quantum state data</p>';
        }
    }

    async updateCircuitWidget() {
        const contentElement = document.getElementById('circuit-content');
        if (!contentElement) return;

        try {
            // Initialize 3D quantum circuit if available
            if (typeof init3DQuantumCircuit === 'function') {
                console.log('🚀 Initializing 3D quantum circuit...');
                init3DQuantumCircuit();
                console.log('✅ 3D quantum circuit initialized');
            } else {
                // Fallback to 2D circuit visualization
                console.log('🔄 Using 2D circuit visualization as fallback...');
                await this.create2DCircuitFallback(contentElement);
            }
        } catch (error) {
            console.error('Error initializing 3D circuit:', error);
            // Final fallback
            await this.create2DCircuitFallback(contentElement);
        }
    }

    async create2DCircuitFallback(container) {
        try {
            const response = await fetch('/api/quantum_circuit');
            const data = await response.json();
            
            if (data.success && data.circuit_data) {
                const circuitData = data.circuit_data;
                
                const plotData = [{
                    type: 'scatter',
                    mode: 'lines+markers',
                    x: circuitData.x || [],
                    y: circuitData.y || [],
                    line: { color: '#06b6d4', width: 3 },
                    marker: { size: 10, color: '#3b82f6', symbol: 'circle' },
                    name: 'Quantum Circuit'
                }];

                const layout = {
                    title: {
                        text: 'Quantum Circuit - Team Quantum Spark',
                        font: { size: 16, color: '#06b6d4' }
                    },
                    xaxis: { 
                        title: 'Time Steps',
                        titlefont: { color: '#06b6d4' },
                        gridcolor: 'rgba(6, 182, 212, 0.3)'
                    },
                    yaxis: { 
                        title: 'Qubits',
                        titlefont: { color: '#06b6d4' },
                        gridcolor: 'rgba(6, 182, 212, 0.3)'
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

                Plotly.newPlot(container, plotData, layout, config);
            } else {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No circuit data available</p>';
            }
        } catch (error) {
            console.error('Error creating 2D circuit fallback:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading circuit data</p>';
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
                
                const plotData = [{
                    type: 'scatter',
                    mode: 'lines',
                    x: performanceData.timestamps || [],
                    y: performanceData.values || [],
                    line: { color: '#10b981', width: 3 },
                    name: 'Performance',
                    fill: 'tonexty'
                }];

                const layout = {
                    title: {
                        text: 'Performance Metrics - Quantum Spark',
                        font: { size: 16, color: '#10b981' }
                    },
                    xaxis: { 
                        title: 'Time',
                        titlefont: { color: '#10b981' },
                        gridcolor: 'rgba(16, 185, 129, 0.3)'
                    },
                    yaxis: { 
                        title: 'Value',
                        titlefont: { color: '#10b981' },
                        gridcolor: 'rgba(16, 185, 129, 0.3)'
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
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No performance data available</p>';
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
                        color: '#8b5cf6',
                        gradient: {
                            color: '#a855f7',
                            type: 'vertical'
                        }
                    },
                    name: 'Entanglement'
                }];

                const layout = {
                    title: {
                        text: 'Entanglement Analysis - Quantum Spark',
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
                        gridcolor: 'rgba(139, 92, 246, 0.3)'
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
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No entanglement data available</p>';
            }
        } catch (error) {
            console.error('Error fetching entanglement data:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading entanglement data</p>';
        }
    }

    async updateResultsWidget() {
        const contentElement = document.getElementById('results-content');
        if (!contentElement) return;

        try {
            const response = await fetch('/api/measurement_results');
            const data = await response.json();
            
            if (data.success && data.results) {
                const results = data.results;
                
                const resultsHtml = `
                    <div style="padding: 1rem;">
                        <h4 style="color: var(--text-accent); margin-bottom: 1rem;">Measurement Results</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                            ${Object.entries(results).map(([key, value]) => `
                                <div style="text-align: center; padding: 1rem; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-accent);">${value}</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${key}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                contentElement.innerHTML = resultsHtml;
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No measurement results available</p>';
            }
        } catch (error) {
            console.error('Error fetching results data:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading results data</p>';
        }
    }

    async updateQuantumStateWidget() {
        const contentElement = document.getElementById('quantum-state-content');
        if (!contentElement) return;

        try {
            const response = await fetch('/api/quantum_state_data');
            const data = await response.json();
            
            if (data.success && data.quantum_state) {
                const state = data.quantum_state;
                
                const stateHtml = `
                    <div style="padding: 1rem;">
                        <h4 style="color: var(--text-accent); margin-bottom: 1rem;">Quantum State Information</h4>
                        <div style="background: var(--glass-bg); border-radius: 8px; padding: 1rem; border: 1px solid var(--glass-border);">
                            <div style="margin-bottom: 0.5rem;">
                                <strong>State Vector:</strong> 
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${state.state_vector || '|ψ⟩'}</span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Amplitude:</strong> 
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${state.amplitude || 'α'}</span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Phase:</strong> 
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${state.phase || 'φ'}</span>
                            </div>
                            <div>
                                <strong>Fidelity:</strong> 
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${state.fidelity || '0.95'}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                contentElement.innerHTML = stateHtml;
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No quantum state data available</p>';
            }
        } catch (error) {
            console.error('Error fetching quantum state data:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading quantum state data</p>';
        }
    }

    async updateAIChatWidget() {
        const contentElement = document.getElementById('ai-chat-content');
        if (!contentElement) return;

        // Initialize AI chat functionality
        this.setupAIChat();
    }

    setupAIChat() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        const chatMessages = document.getElementById('chat-messages');

        if (!chatInput || !sendButton || !chatMessages) return;

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;

            // Add user message
            this.addChatMessage(message, 'user');
            chatInput.value = '';

            // Simulate AI response
            setTimeout(() => {
                const response = this.generateAIResponse(message);
                this.addChatMessage(response, 'ai');
            }, 1000);
        };

        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const icon = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${icon} ${message}
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateAIResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('bloch') || lowerQuery.includes('sphere')) {
            return "The Bloch sphere is a geometric representation of the pure state space of a two-level quantum mechanical system. It's a unit sphere where each point represents a unique quantum state. The north pole represents |0⟩, the south pole represents |1⟩, and points on the equator represent superposition states.";
        } else if (lowerQuery.includes('circuit') || lowerQuery.includes('gate')) {
            return "Quantum circuits are composed of quantum gates that manipulate qubits. Common gates include Hadamard (H), Pauli-X/Y/Z, CNOT, and rotation gates. These gates create entanglement and superposition, enabling quantum algorithms like Shor's and Grover's.";
        } else if (lowerQuery.includes('entanglement')) {
            return "Quantum entanglement is a phenomenon where particles become correlated in such a way that measuring one instantly affects the other, regardless of distance. This is fundamental to quantum computing and enables quantum teleportation and superdense coding.";
        } else if (lowerQuery.includes('job') || lowerQuery.includes('backend')) {
            return "Quantum jobs are computational tasks submitted to quantum backends. Each job contains a quantum circuit and parameters. Backends are quantum processors or simulators that execute these jobs. IBM Quantum provides access to real quantum hardware and simulators.";
        } else if (lowerQuery.includes('quantum') || lowerQuery.includes('computing')) {
            return "Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information. Unlike classical bits, quantum bits (qubits) can exist in multiple states simultaneously, potentially solving certain problems exponentially faster than classical computers.";
        } else {
            return "I can help explain quantum computing concepts, analyze quantum states, interpret circuit diagrams, and provide insights about quantum algorithms. What specific aspect of quantum computing would you like to explore?";
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
                title: '3D Bloch Sphere (Blochy)',
                icon: 'fas fa-globe',
                contentId: 'bloch-content',
                isVisualization: true
            },
            'circuit': {
                title: '3D Quantum Circuit',
                icon: 'fas fa-cube',
                contentId: 'circuit-content',
                isVisualization: true
            },
            'entanglement': {
                title: 'Entanglement Analysis',
                icon: 'fas fa-link',
                contentId: 'entanglement-content',
                isVisualization: true
            },
            'results': {
                title: 'Measurement Results',
                icon: 'fas fa-chart-bar',
                contentId: 'results-content'
            },
            'quantum-state': {
                title: 'Quantum State',
                icon: 'fas fa-atom',
                contentId: 'quantum-state-content'
            },
            'performance': {
                title: 'Performance',
                icon: 'fas fa-chart-line',
                contentId: 'performance-content',
                isVisualization: true
            },
            'ai-chat': {
                title: 'AI Assistant',
                icon: 'fas fa-robot',
                contentId: 'ai-chat-content',
                isChat: true
            }
        };

        const template = widgetTemplates[widgetType];
        if (!template) return '';

        const contentClass = template.isVisualization ? 'visualization-container' : '';
        const loadingText = template.isChat ? 'Initializing AI assistant...' : `Loading ${template.title.toLowerCase()}...`;
        
        let contentHtml = '';
        if (template.isChat) {
            contentHtml = `
                <div class="chat-container">
                    <div class="chat-messages" id="chat-messages">
                        <div class="message ai-message">
                            <div class="message-content">
                                <i class="fas fa-robot"></i>
                                Hello! I'm your quantum computing AI assistant. Ask me anything about quantum states, circuits, or quantum computing concepts!
                            </div>
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <input type="text" id="chat-input" placeholder="Ask about quantum computing..." class="chat-input">
                        <button id="send-message" class="send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
        } else if (template.isVisualization) {
            if (widgetType === 'bloch-sphere') {
                contentHtml = '<div id="bloch-3d-container" style="width: 100%; height: 300px; position: relative;"></div>';
            } else if (widgetType === 'circuit') {
                contentHtml = '<div id="3d-quantum-circuit" style="width: 100%; height: 300px; position: relative;"></div>';
            }
        }
        
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
                        <span>${loadingText}</span>
                    </div>
                    <div class="${contentClass}" id="${template.contentId}" style="display: none;">
                        ${contentHtml}
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

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hackathonDashboard = new HackathonDashboard();
    
    // Add team branding
    console.log('🚀 Quantum Spark - Amravati Quantum Hackathon 2024');
    console.log('👨‍💻 Developed by Satish Kumar');
    console.log('🏆 Ready to win the hackathon!');
});