// Quantum Spark - Main Dashboard
// Advanced Interactive Dashboard with AI Integration
class IndexDashboard {
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

    setupNotifications() {
        // Set up WebSocket connection for real-time notifications
        this.connectWebSocket();
    }

    connectWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws`;
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.showNotification('Real-time connection established', 'success');
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleNotification(data);
            };
            
            this.ws.onclose = () => {
                console.log('⚠️ WebSocket disconnected');
                this.showNotification('Real-time connection lost', 'warning');
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Error setting up WebSocket:', error);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    handleNotification(data) {
        switch (data.type) {
            case 'job_submitted':
                this.showNotification(`New job submitted: ${data.job_id}`, 'info');
                break;
            case 'job_completed':
                if (data.success) {
                    this.showNotification(`Job completed: ${data.job_id}`, 'success');
                } else {
                    this.showNotification(`Job failed: ${data.job_id}`, 'error');
                }
                break;
            case 'job_status_update':
                this.showNotification(`Job ${data.job_id} status: ${data.new_status}`, 'info');
                break;
            case 'backend_update':
                this.updateMetrics();
                break;
            case 'error':
                this.showNotification(`Error: ${data.message}`, 'error');
                break;
        }
    }

    async loadInitialData() {
        try {
            const response = await fetch('/api/dashboard_state');
            const data = await response.json();
            
            if (data.success) {
                this.state = { ...this.state, ...data.data };
                this.updateMetrics();
                this.updateAllWidgets();
                this.showNotification('Main dashboard loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    updateMetrics() {
        const backends = this.state.backends || [];
        const jobs = this.state.jobs || [];
        
        const activeBackends = backends.filter(b => b.status === 'active').length;
        const totalJobs = jobs.length;
        const runningJobs = jobs.filter(j => j.status === 'running').length;
        const completedJobs = jobs.filter(j => j.status === 'completed');
        const successfulJobs = completedJobs.filter(j => j.result && !j.error);
        const successRate = completedJobs.length > 0 ? 
            Math.round((successfulJobs.length / completedJobs.length) * 100) : 0;
        
        document.getElementById('active-backends').textContent = activeBackends;
        document.getElementById('total-jobs').textContent = totalJobs;
        document.getElementById('running-jobs').textContent = runningJobs;
        document.getElementById('success-rate').textContent = `${successRate}%`;
    }

    async updateAllWidgets() {
        const widgets = ['backends', 'jobs', 'bloch-sphere', 'circuit', 'performance', 'entanglement', 'results', 'quantum-state', 'ai-chat'];
        
        for (const widgetType of widgets) {
            const widget = this.widgets.get(widgetType);
            if (widget) {
                try {
                    await this.updateWidget(widgetType);
                } catch (error) {
                    console.error(`Error updating ${widgetType} widget:`, error);
                }
            }
        }
    }

    async updateWidget(widgetType) {
        const contentElement = document.getElementById(`${widgetType}-content`);
        if (!contentElement) return;

        // Show loading state
        contentElement.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                Updating ${widgetType}...
            </div>
        `;

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
        } catch (error) {
            console.error(`Error updating ${widgetType} widget:`, error);
            contentElement.innerHTML = `
                <div style="text-align: center; color: var(--danger-color); padding: 2rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading ${widgetType} data</p>
                </div>
            `;
        }
    }

    async updateBackendsWidget() {
        const contentElement = document.getElementById('backends-content');
        const backends = this.state.backends || [];
        
        if (backends.length === 0) {
            contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No backends available</p>';
            return;
        }

        const backendsHtml = backends.map(backend => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; margin-bottom: 0.5rem; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${backend.name}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${backend.qubits} qubits</div>
                </div>
                <span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; background: ${this.getStatusColor(backend.status)}; color: white;">
                    ${backend.status}
                </span>
            </div>
        `).join('');

        contentElement.innerHTML = backendsHtml;
    }

    async updateJobsWidget() {
        const contentElement = document.getElementById('jobs-content');
        const jobs = this.state.jobs || [];
        
        if (jobs.length === 0) {
            contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jobs available</p>';
            return;
        }

        const jobsHtml = jobs.slice(0, 5).map(job => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; margin-bottom: 0.5rem; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${job.job_id}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${job.backend}</div>
                </div>
                <span style="padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; background: ${this.getJobStatusColor(job.status)}; color: white;">
                    ${job.status}
                </span>
            </div>
        `).join('');

        contentElement.innerHTML = jobsHtml;
    }

    async updateBlochSphereWidget() {
        const contentElement = document.getElementById('bloch-content');
        
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
            const response = await fetch('/api/quantum_state');
            const data = await response.json();
            
            if (data.success && data.quantum_state) {
                const state = data.quantum_state;
                
                // Create enhanced 3D Bloch sphere using Plotly
                const sphereData = this.createEnhancedBlochSphere(state);
                
                const layout = {
                    title: '3D Bloch Sphere',
                    scene: {
                        xaxis: { title: 'X', range: [-1, 1] },
                        yaxis: { title: 'Y', range: [-1, 1] },
                        zaxis: { title: 'Z', range: [-1, 1] },
                        aspectmode: 'cube',
                        camera: {
                            eye: { x: 1.5, y: 1.5, z: 1.5 }
                        }
                    },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#f8fafc' }
                };
                
                const config = {
                    responsive: true,
                    displayModeBar: false
                };
                
                Plotly.newPlot(container, sphereData, layout, config);
            } else {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No quantum state data available</p>';
            }
        } catch (error) {
            console.error('Error creating fallback Bloch sphere:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading Bloch sphere</p>';
        }
    }

    createEnhancedBlochSphere(state) {
        // Generate sphere surface
        const phi = Array.from({length: 50}, (_, i) => i * Math.PI / 25);
        const theta = Array.from({length: 50}, (_, i) => i * 2 * Math.PI / 25);
        
        const x = [], y = [], z = [];
        for (let i = 0; i < phi.length; i++) {
            for (let j = 0; j < theta.length; j++) {
                x.push(Math.sin(phi[i]) * Math.cos(theta[j]));
                y.push(Math.sin(phi[i]) * Math.sin(theta[j]));
                z.push(Math.cos(phi[i]));
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
                color: '#06b6d4',
                opacity: 0.6
            },
            name: 'Bloch Sphere'
        }];
    }

    async updateCircuitWidget() {
        const contentElement = document.getElementById('circuit-content');
        
        try {
            // Initialize 3D circuit if available
            if (typeof init_3d_circuit === 'function') {
                console.log('🚀 Initializing 3D quantum circuit...');
                await init_3d_circuit();
                console.log('✅ 3D quantum circuit initialized');
            } else {
                // Fallback to 2D circuit
                console.log('🔄 Using 2D circuit visualization as fallback...');
                await this.create2DCircuitFallback(contentElement);
            }
        } catch (error) {
            console.error('Error initializing circuit:', error);
            // Final fallback
            await this.create2DCircuitFallback(contentElement);
        }
    }

    async create2DCircuitFallback(container) {
        try {
            const response = await fetch('/api/quantum_circuit');
            const data = await response.json();
            
            if (data.success && data.circuit_data) {
                const circuit = data.circuit_data;
                
                // Create 2D circuit visualization using Plotly
                const circuitData = [{
                    type: 'scatter',
                    mode: 'markers+lines',
                    x: circuit.qubits.map((_, i) => i),
                    y: circuit.qubits.map((_, i) => i),
                    marker: {
                        size: 10,
                        color: '#06b6d4'
                    },
                    line: {
                        color: '#06b6d4',
                        width: 2
                    },
                    name: 'Quantum Circuit'
                }];
                
                const layout = {
                    title: 'Quantum Circuit',
                    xaxis: { title: 'Qubit Index' },
                    yaxis: { title: 'Time Step' },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#f8fafc' }
                };
                
                const config = {
                    responsive: true,
                    displayModeBar: false
                };
                
                Plotly.newPlot(container, circuitData, layout, config);
            } else {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No circuit data available</p>';
            }
        } catch (error) {
            console.error('Error creating 2D circuit fallback:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading circuit</p>';
        }
    }

    async updatePerformanceWidget() {
        const contentElement = document.getElementById('performance-content');
        
        try {
            const response = await fetch('/api/performance');
            const data = await response.json();
            
            if (data.success && data.performance_data) {
                const perfData = data.performance_data;
                
                const performanceHtml = `
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        <div style="text-align: center; padding: 1rem; background: var(--glass-bg); border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-accent);">${perfData.cpu_usage || 0}%</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">CPU Usage</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--glass-bg); border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-accent);">${perfData.memory_usage || 0}%</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">Memory Usage</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--glass-bg); border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-accent);">${perfData.network_latency || 0}ms</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">Network Latency</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--glass-bg); border-radius: 8px;">
                            <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-accent);">${perfData.job_success_rate || 0}%</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">Success Rate</div>
                        </div>
                    </div>
                `;
                
                contentElement.innerHTML = performanceHtml;
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No performance data available</p>';
            }
        } catch (error) {
            console.error('Error loading performance data:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading performance data</p>';
        }
    }

    async updateEntanglementWidget() {
        const contentElement = document.getElementById('entanglement-content');
        
        try {
            const response = await fetch('/api/quantum_visualization_data');
            const data = await response.json();
            
            if (data.success && data.entanglement_data) {
                const entData = data.entanglement_data;
                
                const entanglementHtml = `
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2rem; font-weight: 600; color: var(--text-accent); margin-bottom: 1rem;">
                            ${entData.entanglement_measure || 0.75}
                        </div>
                        <div style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 1rem;">
                            Entanglement Measure
                        </div>
                        <div style="width: 100%; height: 4px; background: var(--glass-bg); border-radius: 2px; overflow: hidden;">
                            <div style="width: ${(entData.entanglement_measure || 0.75) * 100}%; height: 100%; background: var(--default-gradient); transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `;
                
                contentElement.innerHTML = entanglementHtml;
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No entanglement data available</p>';
            }
        } catch (error) {
            console.error('Error loading entanglement data:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading entanglement data</p>';
        }
    }

    async updateResultsWidget() {
        const contentElement = document.getElementById('results-content');
        
        try {
            const response = await fetch('/api/results');
            const data = await response.json();
            
            if (data.success && data.results) {
                const results = data.results;
                
                const resultsHtml = `
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        ${results.map(result => `
                            <div style="padding: 1rem; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                                <div style="font-weight: 600; margin-bottom: 0.5rem;">${result.measurement}</div>
                                <div style="font-size: 1.25rem; font-weight: 600; color: var(--text-accent);">${result.probability}%</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                contentElement.innerHTML = resultsHtml;
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No measurement results available</p>';
            }
        } catch (error) {
            console.error('Error loading results:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading results</p>';
        }
    }

    async updateQuantumStateWidget() {
        const contentElement = document.getElementById('quantum-state-content');
        
        try {
            const response = await fetch('/api/quantum_state_data');
            const data = await response.json();
            
            if (data.success && data.quantum_state) {
                const state = data.quantum_state;
                
                const stateHtml = `
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-accent); margin-bottom: 1rem;">
                            |ψ⟩ = ${state.alpha || '0.707'}|0⟩ + ${state.beta || '0.707'}|1⟩
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            Current Quantum State
                        </div>
                    </div>
                `;
                
                contentElement.innerHTML = stateHtml;
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No quantum state data available</p>';
            }
        } catch (error) {
            console.error('Error loading quantum state:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading quantum state</p>';
        }
    }

    async updateAIChatWidget() {
        const contentElement = document.getElementById('ai-chat-content');
        
        // Initialize AI chat functionality
        this.setupAIChat();
        
        const chatHtml = `
            <div style="height: 200px; overflow-y: auto; border: 1px solid var(--glass-border); border-radius: 8px; padding: 1rem; background: var(--glass-bg);">
                <div id="chat-messages" style="margin-bottom: 1rem;">
                    <div style="padding: 0.5rem; background: var(--glass-bg); border-radius: 8px; margin-bottom: 0.5rem;">
                        <strong>AI:</strong> Hello! I'm your quantum computing assistant. Ask me anything about quantum states, circuits, or quantum computing!
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="chat-input" placeholder="Ask about quantum computing..." style="flex: 1; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass-bg); color: var(--text-primary);">
                    <button id="chat-send" style="padding: 0.5rem 1rem; background: var(--default-gradient); color: white; border: none; border-radius: 6px; cursor: pointer;">Send</button>
                </div>
            </div>
        `;
        
        contentElement.innerHTML = chatHtml;
        
        // Set up chat event listeners
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('chat-send');
        
        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (message) {
                this.addChatMessage(message, 'user');
                chatInput.value = '';
                
                // Generate AI response
                setTimeout(() => {
                    const response = this.generateAIResponse(message);
                    this.addChatMessage(response, 'ai');
                }, 1000);
            }
        };
        
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    setupAIChat() {
        // AI chat functionality is set up in updateAIChatWidget
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'padding: 0.5rem; background: var(--glass-bg); border-radius: 8px; margin-bottom: 0.5rem;';
        
        if (sender === 'user') {
            messageDiv.style.cssText += 'text-align: right; background: var(--default-gradient); color: white;';
            messageDiv.innerHTML = `<strong>You:</strong> ${message}`;
        } else {
            messageDiv.innerHTML = `<strong>AI:</strong> ${message}`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateAIResponse(query) {
        const responses = [
            "That's a great question about quantum computing! Quantum states are represented as superpositions of basis states.",
            "Quantum circuits use quantum gates to manipulate qubits. Each gate performs a specific unitary transformation.",
            "Entanglement is a fundamental quantum phenomenon where particles become correlated in ways that classical physics cannot explain.",
            "The Bloch sphere is a geometric representation of quantum states on a unit sphere in 3D space.",
            "Quantum algorithms like Shor's algorithm and Grover's algorithm demonstrate quantum advantage over classical algorithms.",
            "Quantum error correction is crucial for building fault-tolerant quantum computers.",
            "Quantum gates include Pauli gates (X, Y, Z), Hadamard gate (H), and controlled gates like CNOT.",
            "Quantum measurement collapses the quantum state to one of the eigenstates of the measured observable."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async handleAIQuery() {
        const input = document.getElementById('ai-input');
        const query = input.value.trim();
        
        if (!query) return;
        
        input.value = '';
        
        try {
            if (this.aiClient) {
                const result = await this.aiClient.generateText({
                    model: 'gemini-pro',
                    prompt: `You are a quantum computing expert. Answer this question: ${query}`,
                    temperature: 0.7,
                    maxOutputTokens: 500
                });
                
                const response = await result.response;
                this.showNotification(`AI Response: ${response.text()}`, 'info', 10000);
            } else {
                // Fallback response
                const response = this.generateAIResponse(query);
                this.showNotification(`AI Response: ${response}`, 'info', 10000);
            }
        } catch (error) {
            console.error('Error with AI query:', error);
            this.showNotification('AI service temporarily unavailable', 'warning');
        }
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
        
        popupTitle.textContent = widget.querySelector('.widget-title').textContent;
        popupContent.innerHTML = widget.querySelector('.widget-content').innerHTML;
        
        popupOverlay.classList.add('active');
    }

    closePopup() {
        const popupOverlay = document.getElementById('popup-overlay');
        popupOverlay.classList.remove('active');
        this.popupWidget = null;
    }

    openFullscreen(widget, widgetType) {
        const content = widget.querySelector('.widget-content').innerHTML;
        const fullscreenContent = document.createElement('div');
        fullscreenContent.innerHTML = content;
        fullscreenContent.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
            background: var(--background-gradient); z-index: 2000; 
            padding: 2rem; overflow-y: auto;
        `;
        
        document.body.appendChild(fullscreenContent);
        
        fullscreenContent.requestFullscreen().then(() => {
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = `
                position: fixed; top: 1rem; right: 1rem; z-index: 2001;
                background: var(--danger-gradient); color: white; border: none;
                width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
                font-size: 1.2rem; font-weight: bold;
            `;
            closeBtn.onclick = () => {
                document.exitFullscreen();
                fullscreenContent.remove();
            };
            fullscreenContent.appendChild(closeBtn);
        });
    }

    removeWidget(widget) {
        const widgetType = widget.getAttribute('data-widget');
        this.widgets.delete(widgetType);
        widget.remove();
        this.saveWidgetOrder();
        this.showNotification(`${widgetType} widget removed`, 'info');
    }

    addWidget(widgetType) {
        if (this.widgets.has(widgetType)) {
            this.showNotification(`${widgetType} widget already exists`, 'warning');
            return;
        }
        
        const widgetGrid = document.getElementById('widget-grid');
        const widgetHtml = this.createWidgetHtml(widgetType);
        widgetGrid.insertAdjacentHTML('beforeend', widgetHtml);
        
        this.widgets.set(widgetType, true);
        this.updateWidget(widgetType);
        this.saveWidgetOrder();
        this.showNotification(`${widgetType} widget added`, 'success');
    }

    createWidgetHtml(widgetType) {
        const widgetConfig = {
            'backends': { icon: 'fas fa-server', title: 'Quantum Backends' },
            'jobs': { icon: 'fas fa-tasks', title: 'Quantum Jobs' },
            'bloch-sphere': { icon: 'fas fa-globe', title: '3D Bloch Sphere' },
            'circuit': { icon: 'fas fa-project-diagram', title: '3D Quantum Circuit' },
            'entanglement': { icon: 'fas fa-link', title: 'Entanglement Analysis' },
            'results': { icon: 'fas fa-chart-bar', title: 'Measurement Results' },
            'quantum-state': { icon: 'fas fa-atom', title: 'Quantum State' },
            'performance': { icon: 'fas fa-chart-line', title: 'Performance' },
            'ai-chat': { icon: 'fas fa-robot', title: 'AI Assistant' }
        };
        
        const config = widgetConfig[widgetType];
        
        return `
            <div class="widget fade-in" data-widget="${widgetType}">
                <div class="widget-header">
                    <div class="widget-title">
                        <i class="${config.icon}"></i>
                        ${config.title}
                    </div>
                    <div class="widget-controls">
                        <button class="widget-btn" data-action="refresh" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="widget-btn" data-action="popup" title="Popup View">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button class="widget-btn" data-action="fullscreen" title="Fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                        <button class="widget-btn" data-action="remove" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-content" id="${widgetType}-content">
                    <div class="loading">
                        <div class="spinner"></div>
                        Loading ${widgetType}...
                    </div>
                </div>
            </div>
        `;
    }

    toggleCustomizationPanel() {
        const panel = document.getElementById('customization-panel');
        panel.classList.toggle('active');
    }

    setupDragAndDrop() {
        const widgetGrid = document.getElementById('widget-grid');
        
        if (widgetGrid && typeof Sortable !== 'undefined') {
            this.sortable = new Sortable(widgetGrid, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onEnd: () => {
                    this.saveWidgetOrder();
                }
            });
        }
    }

    setupAI() {
        try {
            // Initialize Google Gemini AI
            if (typeof google !== 'undefined' && google.generativeai) {
                this.aiClient = google.generativeai;
                console.log('✅ Google Gemini AI initialized');
            } else {
                console.log('⚠️ Google Gemini AI not available');
            }
        } catch (error) {
            console.error('Error initializing AI:', error);
        }
    }

    initializeWidgets() {
        // Initialize all existing widgets
        const widgets = document.querySelectorAll('.widget[data-widget]');
        widgets.forEach(widget => {
            const widgetType = widget.getAttribute('data-widget');
            this.widgets.set(widgetType, true);
        });
        
        // Load saved widget order
        this.loadWidgetOrder();
    }

    refreshAllWidgets() {
        this.showNotification('Refreshing all widgets...', 'info');
        this.updateAllWidgets();
    }

    getStatusColor(status) {
        const colors = {
            'active': '#10b981',
            'inactive': '#6b7280',
            'maintenance': '#f59e0b',
            'error': '#ef4444'
        };
        return colors[status] || '#6b7280';
    }

    getJobStatusColor(status) {
        const colors = {
            'running': '#3b82f6',
            'completed': '#10b981',
            'failed': '#ef4444',
            'queued': '#f59e0b',
            'cancelled': '#6b7280'
        };
        return colors[status] || '#6b7280';
    }

    saveWidgetOrder() {
        const widgets = Array.from(document.querySelectorAll('.widget[data-widget]'));
        const widgetOrder = widgets.map(widget => widget.getAttribute('data-widget'));
        localStorage.setItem('quantum-spark-index-widget-order', JSON.stringify(widgetOrder));
    }

    loadWidgetOrder() {
        const savedOrder = localStorage.getItem('quantum-spark-index-widget-order');
        if (savedOrder) {
            try {
                const widgetOrder = JSON.parse(savedOrder);
                const widgetGrid = document.getElementById('widget-grid');
                
                // Reorder widgets based on saved order
                widgetOrder.forEach(widgetType => {
                    const widget = document.querySelector(`[data-widget="${widgetType}"]`);
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
    window.indexDashboard = new IndexDashboard();
    
    // Add team branding
    console.log('🚀 Quantum Spark - Main Dashboard');
    console.log('👨‍💻 Main Quantum Interface');
    console.log('🏆 Ready for quantum computing!');
});