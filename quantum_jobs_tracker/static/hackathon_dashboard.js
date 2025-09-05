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
            console.log('📝 Registering widget:', widgetType);
            this.widgets.set(widgetType, widget);
        });

        console.log('📊 Total widgets registered:', this.widgets.size);
        console.log('🎯 Bloch sphere widget registered:', this.widgets.has('bloch-sphere'));
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
            case 'job_update':
                // Only show notifications for important job status changes
                if (data.new_status === 'completed') {
                    this.showNotification(`✅ Job completed: ${data.job_id}`, 'success');
                } else if (data.new_status === 'failed') {
                    this.showNotification(`❌ Job failed: ${data.job_id}`, 'error');
                }
                // Don't show notifications for other status changes to reduce spam
                this.updateWidget('jobs');
                this.updateMetrics();
                break;
            // Remove new_job and error notifications to reduce spam
        }
    }

    async loadInitialData() {
        try {
            await this.fetchDashboardData();
            this.updateMetrics();
            this.updateAllWidgets();
            // Remove success notification to reduce spam
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    async fetchDashboardData() {
        try {
            // Fetch dashboard state for metrics and connection status
            const dashboardResponse = await fetch('/api/dashboard_state');
            const dashboardData = await dashboardResponse.json();

            // Fetch backends data
            const backendsResponse = await fetch('/api/backends');
            const backendsData = await backendsResponse.json();

            // Fetch jobs data
            const jobsResponse = await fetch('/api/jobs');
            const jobsData = await jobsResponse.json();

            if (dashboardResponse.ok && !dashboardData.error) {
            this.state = {
                ...this.state,
                    backends: Array.isArray(backendsData) ? backendsData : (backendsData.backends || []),
                    jobs: Array.isArray(jobsData) ? jobsData : (jobsData.jobs || []),
                    metrics: dashboardData.metrics || {},
                    isConnected: dashboardData.connection_status?.is_connected || false
                };

                // Debug logging
                console.log('Dashboard data fetched:', {
                    backendsCount: this.state.backends.length,
                    jobsCount: this.state.jobs.length,
                    metrics: this.state.metrics,
                    connected: this.state.isConnected
                });

                this.updateConnectionStatus(dashboardData.connection_status?.is_connected || false);
        } else {
                throw new Error(dashboardData.message || dashboardData.error || 'Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw new Error('Failed to fetch dashboard data: ' + error.message);
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
        console.log('Updating backends widget with data:', backends);
        
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
        console.log('Updating jobs widget with data:', jobs);
        
        if (jobs.length === 0) {
            contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jobs found</p>';
            return;
        }

        // Check if this is an expand request (if widget has expanded class)
        const widget = contentElement.closest('.widget');
        const isExpanded = widget && widget.classList.contains('expanded');
        const jobsToShow = isExpanded ? jobs : jobs.slice(0, 3);
        const remainingCount = isExpanded ? 0 : Math.max(0, jobs.length - 3);

        const jobsHtml = jobsToShow.map(job => `
            <div style="padding: 1rem; border: 1px solid var(--glass-border); border-radius: var(--border-radius); margin-bottom: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(10px);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 0.875rem; font-family: var(--font-mono);">${job.id || job.job_id || 'Unknown Job'}</h4>
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

        let finalHtml = jobsHtml;

        // Add expand/collapse button if there are more jobs or if expanded
        if (remainingCount > 0 || isExpanded) {
            const buttonText = isExpanded ? 'Show Less' : `Show ${remainingCount} More Jobs`;
            const buttonIcon = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
            finalHtml += `
                <div class="expand-jobs" style="text-align: center; padding: 1rem; cursor: pointer; color: var(--text-accent); border: 1px dashed var(--glass-border); border-radius: var(--border-radius); background: rgba(6, 182, 212, 0.05);" onclick="this.closest('.widget').classList.toggle('expanded'); this.closest('.widget').querySelector('.widget-btn[data-action=refresh]').click()">
                    <i class="fas ${buttonIcon}"></i> ${buttonText}
                </div>
            `;
        }

        contentElement.innerHTML = finalHtml;
    }

    async updateBlochSphereWidget() {
        console.log('🔄 updateBlochSphereWidget called');

        const contentElement = document.getElementById('bloch-content');
        if (!contentElement) {
            console.error('❌ bloch-content element not found');
            return;
        }

        console.log('✅ Found bloch-content element');

        // Make sure the content is visible
        contentElement.style.display = 'block';

        // Initialize the exact Bloch sphere simulator
        await this.initExactBlochSphere();

        console.log('✅ Exact Bloch sphere widget ready');
    }

    async initExactBlochSphere() {
        console.log('🎯 Initializing exact Bloch sphere simulator...');

        // Wait for DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get the Bloch sphere container
        const container = document.getElementById('bloch-sphere');
        if (!container) {
            console.error('❌ Bloch sphere container not found');
            return;
        }

        console.log('✅ Found Bloch sphere container:', container);

        // Clear any existing content
        container.innerHTML = '';

        // Create the exact 3D Bloch sphere matching the reference
        this.createExactBlochSphere(container);

        // Setup quantum gate event listeners
        this.setupExactQuantumGateListeners();

        // Setup lambda gate controls
        this.setupLambdaControls();

        console.log('✅ Exact Bloch sphere initialization completed');
    }

    createExactBlochSphere(container) {
        console.log('🎨 Creating exact Bloch sphere simulator...');

        // Check Three.js availability
        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js not loaded!');
            container.innerHTML = '<div style="padding: 20px; color: red; text-align: center;">❌ Three.js not loaded</div>';
            return;
        }

        // Get container dimensions
        const width = container.offsetWidth || 600;
        const height = container.offsetHeight || 500;

        // Create scene with black background
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Create camera positioned to match reference
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(3, 2, 3);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 1);
        container.appendChild(renderer.domElement);

        // Create orbit controls for interaction
        let controls;
        try {
            if (typeof OrbitControls !== 'undefined') {
                controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.minDistance = 2;
                controls.maxDistance = 8;
                controls.enablePan = false;
                console.log('✅ OrbitControls initialized');
            } else {
                console.warn('⚠️ OrbitControls not available, using basic controls');
                controls = { update: () => {} };
            }
        } catch (error) {
            console.warn('⚠️ Error creating OrbitControls:', error);
            controls = { update: () => {} };
        }

        // Add lighting to match reference
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Create exact Bloch sphere geometry
        this.createExactBlochSphereGeometry(scene);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Store scene data
        container._blochScene = {
            scene, camera, renderer, controls, animate
        };

        // Start state display updates
        setInterval(() => {
            this.updateExactBlochSphereStateDisplay(container);
        }, 100);

        console.log('✅ Exact Bloch sphere created');
    }

    createExactBlochSphereGeometry(scene) {
        // Create transparent sphere with wireframe (matching reference)
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Main sphere (transparent)
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        // Wireframe (matching reference appearance)
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const wireframe = new THREE.Mesh(sphereGeometry, wireframeMaterial);
        scene.add(wireframe);

        // Create coordinate axes (matching reference colors)
        this.createExactCoordinateAxes(scene);

        // Create quantum state vector (matching reference)
        this.createExactQuantumStateVector(scene);
    }

    createExactCoordinateAxes(scene) {
        const axisLength = 1.2;
        const axisRadius = 0.01;

        // X-axis (red) - pointing left in reference
        const xGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength);
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        const xAxis = new THREE.Mesh(xGeometry, xMaterial);
        xAxis.rotation.z = Math.PI / 2;
        scene.add(xAxis);

        // Y-axis (green) - pointing right in reference
        const yGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength);
        const yMaterial = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
        const yAxis = new THREE.Mesh(yGeometry, yMaterial);
        scene.add(yAxis);

        // Z-axis (blue) - pointing up in reference
        const zGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength);
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
        const zAxis = new THREE.Mesh(zGeometry, zMaterial);
        zAxis.rotation.x = Math.PI / 2;
        scene.add(zAxis);

        // Add axis labels (matching reference)
        this.createAxisLabels(scene);
    }

    createAxisLabels(scene) {
        // Create text labels for axes (X, Y, Z)
        // For now, we'll use simple geometry as placeholders
        // In a full implementation, you'd use CSS2DRenderer or similar
        
        const labelGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        
        // X label
        const xLabelMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        const xLabel = new THREE.Mesh(labelGeometry, xLabelMaterial);
        xLabel.position.set(1.3, 0, 0);
        scene.add(xLabel);
        
        // Y label
        const yLabelMaterial = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
        const yLabel = new THREE.Mesh(labelGeometry, yLabelMaterial);
        yLabel.position.set(0, 1.3, 0);
        scene.add(yLabel);
        
        // Z label
        const zLabelMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
        const zLabel = new THREE.Mesh(labelGeometry, zLabelMaterial);
        zLabel.position.set(0, 0, 1.3);
        scene.add(zLabel);
    }

    createExactQuantumStateVector(scene) {
        // Create state vector (white sphere matching reference)
        const vectorGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const vectorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const vector = new THREE.Mesh(vectorGeometry, vectorMaterial);

        // Position at |0⟩ state initially (top of Z-axis)
        vector.position.set(0, 0, 1);
        vector.rotation.x = 0;

        scene.add(vector);

        // Create state vector line (thin white line from center to state)
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
        const stateLine = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(stateLine);

        // Store references
        scene.userData.stateVector = vector;
        scene.userData.stateLine = stateLine;
        scene.userData.currentState = { theta: 0, phi: 0 };
    }

    setupExactQuantumGateListeners() {
        console.log('🔧 Setting up exact quantum gate listeners...');

        // All quantum gate buttons
        const gateButtons = document.querySelectorAll('.quantum-gate');
        gateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const gateId = e.target.id || e.target.closest('button').id;
                this.applyExactQuantumGate(gateId);
            });
        });

        console.log('✅ Exact quantum gate listeners set up');
    }

    setupLambdaControls() {
        console.log('🔧 Setting up lambda controls...');

        const polarAngleSlider = document.getElementById('polar-angle');
        const polarAngleValue = document.getElementById('polar-angle-value');
        const applyLambdaBtn = document.getElementById('apply-lambda');

        if (polarAngleSlider && polarAngleValue) {
            polarAngleSlider.addEventListener('input', (e) => {
                polarAngleValue.textContent = e.target.value + '°';
            });
        }

        if (applyLambdaBtn) {
            applyLambdaBtn.addEventListener('click', () => {
                const angle = parseFloat(polarAngleSlider.value);
                this.applyLambdaGate(angle);
            });
        }

        console.log('✅ Lambda controls set up');
    }

    applyExactQuantumGate(gateId) {
        const container = document.getElementById('bloch-sphere');
        if (!container || !container._blochScene) return;

        const scene = container._blochScene.scene;
        const stateVector = scene.userData.stateVector;
        const stateLine = scene.userData.stateLine;
        if (!stateVector) return;

        const currentState = scene.userData.currentState;
        let newTheta = currentState.theta;
        let newPhi = currentState.phi;

        // Apply quantum gate transformations (matching reference behavior)
        switch (gateId) {
            case 'px-builtInGate': // Pauli-X (180° around X-axis)
                newTheta = Math.PI - currentState.theta;
                newPhi = -currentState.phi;
                break;
            case 'py-builtInGate': // Pauli-Y (180° around Y-axis)
                newTheta = Math.PI - currentState.theta;
                newPhi = Math.PI - currentState.phi;
                break;
            case 'pz-builtInGate': // Pauli-Z (180° around Z-axis)
                newPhi = currentState.phi + Math.PI;
                break;
            case 'h-builtInGate': // Hadamard (180° around X+Z axis)
                newTheta = Math.PI/2;
                newPhi = Math.PI - currentState.phi;
                break;
            case 'px-12-builtInGate': // X-90°
                // Rotate around X-axis by 90 degrees
                const currentPos = new THREE.Vector3(
                    Math.sin(currentState.theta) * Math.cos(currentState.phi),
                    Math.sin(currentState.theta) * Math.sin(currentState.phi),
                    Math.cos(currentState.theta)
                );
                const rotatedPos = new THREE.Vector3();
                this.rotateAroundAxis(rotatedPos, currentPos, new THREE.Vector3(1, 0, 0), Math.PI/2);
                newTheta = Math.acos(rotatedPos.z);
                newPhi = Math.atan2(rotatedPos.y, rotatedPos.x);
                break;
            case 'py-12-builtInGate': // Y-90°
                const currentPosY = new THREE.Vector3(
                    Math.sin(currentState.theta) * Math.cos(currentState.phi),
                    Math.sin(currentState.theta) * Math.sin(currentState.phi),
                    Math.cos(currentState.theta)
                );
                const rotatedPosY = new THREE.Vector3();
                this.rotateAroundAxis(rotatedPosY, currentPosY, new THREE.Vector3(0, 1, 0), Math.PI/2);
                newTheta = Math.acos(rotatedPosY.z);
                newPhi = Math.atan2(rotatedPosY.y, rotatedPosY.x);
                break;
            case 'pz-12-builtInGate': // Z-90°
                newPhi = currentState.phi + Math.PI/2;
                break;
            case 'pxi-12-builtInGate': // X-(-90°)
                const currentPosXi = new THREE.Vector3(
                    Math.sin(currentState.theta) * Math.cos(currentState.phi),
                    Math.sin(currentState.theta) * Math.sin(currentState.phi),
                    Math.cos(currentState.theta)
                );
                const rotatedPosXi = new THREE.Vector3();
                this.rotateAroundAxis(rotatedPosXi, currentPosXi, new THREE.Vector3(1, 0, 0), -Math.PI/2);
                newTheta = Math.acos(rotatedPosXi.z);
                newPhi = Math.atan2(rotatedPosXi.y, rotatedPosXi.x);
                break;
            case 'pyi-12-builtInGate': // Y-(-90°)
                const currentPosYi = new THREE.Vector3(
                    Math.sin(currentState.theta) * Math.cos(currentState.phi),
                    Math.sin(currentState.theta) * Math.sin(currentState.phi),
                    Math.cos(currentState.theta)
                );
                const rotatedPosYi = new THREE.Vector3();
                this.rotateAroundAxis(rotatedPosYi, currentPosYi, new THREE.Vector3(0, 1, 0), -Math.PI/2);
                newTheta = Math.acos(rotatedPosYi.z);
                newPhi = Math.atan2(rotatedPosYi.y, rotatedPosYi.x);
                break;
            case 'pzi-12-builtInGate': // Z-(-90°)
                newPhi = currentState.phi - Math.PI/2;
                break;
            case 's-builtInGate': // S-gate (Z-90°)
                newPhi = currentState.phi + Math.PI/2;
                break;
            case 'si-builtInGate': // S†-gate (Z-(-90°))
                newPhi = currentState.phi - Math.PI/2;
                break;
            case 'px-14-builtInGate': // X-45°
                const currentPosX14 = new THREE.Vector3(
                    Math.sin(currentState.theta) * Math.cos(currentState.phi),
                    Math.sin(currentState.theta) * Math.sin(currentState.phi),
                    Math.cos(currentState.theta)
                );
                const rotatedPosX14 = new THREE.Vector3();
                this.rotateAroundAxis(rotatedPosX14, currentPosX14, new THREE.Vector3(1, 0, 0), Math.PI/4);
                newTheta = Math.acos(rotatedPosX14.z);
                newPhi = Math.atan2(rotatedPosX14.y, rotatedPosX14.x);
                break;
            case 'py-14-builtInGate': // Y-45°
                const currentPosY14 = new THREE.Vector3(
                    Math.sin(currentState.theta) * Math.cos(currentState.phi),
                    Math.sin(currentState.theta) * Math.sin(currentState.phi),
                    Math.cos(currentState.theta)
                );
                const rotatedPosY14 = new THREE.Vector3();
                this.rotateAroundAxis(rotatedPosY14, currentPosY14, new THREE.Vector3(0, 1, 0), Math.PI/4);
                newTheta = Math.acos(rotatedPosY14.z);
                newPhi = Math.atan2(rotatedPosY14.y, rotatedPosY14.x);
                break;
            case 'pz-14-builtInGate': // Z-45°
                newPhi = currentState.phi + Math.PI/4;
                break;
            case 'pxi-14-builtInGate': // X-(-45°)
                const currentPosXi14 = new THREE.Vector3(
                    Math.sin(currentState.theta) * Math.cos(currentState.phi),
                    Math.sin(currentState.theta) * Math.sin(currentState.phi),
                    Math.cos(currentState.theta)
                );
                const rotatedPosXi14 = new THREE.Vector3();
                this.rotateAroundAxis(rotatedPosXi14, currentPosXi14, new THREE.Vector3(1, 0, 0), -Math.PI/4);
                newTheta = Math.acos(rotatedPosXi14.z);
                newPhi = Math.atan2(rotatedPosXi14.y, rotatedPosXi14.x);
                break;
            case 'pyi-14-builtInGate': // Y-(-45°)
                const currentPosYi14 = new THREE.Vector3(
                    Math.sin(currentState.theta) * Math.cos(currentState.phi),
                    Math.sin(currentState.theta) * Math.sin(currentState.phi),
                    Math.cos(currentState.theta)
                );
                const rotatedPosYi14 = new THREE.Vector3();
                this.rotateAroundAxis(rotatedPosYi14, currentPosYi14, new THREE.Vector3(0, 1, 0), -Math.PI/4);
                newTheta = Math.acos(rotatedPosYi14.z);
                newPhi = Math.atan2(rotatedPosYi14.y, rotatedPosYi14.x);
                break;
            case 'pzi-14-builtInGate': // Z-(-45°)
                newPhi = currentState.phi - Math.PI/4;
                break;
        }

        // Update state
        scene.userData.currentState = { theta: newTheta, phi: newPhi };

        // Calculate new position
        const x = Math.sin(newTheta) * Math.cos(newPhi);
        const y = Math.sin(newTheta) * Math.sin(newPhi);
        const z = Math.cos(newTheta);

        // Animate transition
        this.animateExactVectorTransition(stateVector, stateLine, stateVector.position, new THREE.Vector3(x, y, z));

        // Update state display
        this.updateExactBlochSphereStateDisplay(container);

        console.log(`🎯 Applied gate ${gateId}: θ=${newTheta.toFixed(3)}, φ=${newPhi.toFixed(3)}`);
    }

    updateExactBlochSphereStateDisplay(container) {
        if (!container || !container._blochScene) return;

        const scene = container._blochScene.scene;
        const currentState = scene.userData.currentState;

        // Calculate quantum state parameters
        const theta = currentState.theta;
        const phi = currentState.phi;
        const alpha = Math.cos(theta/2);
        const betaReal = Math.sin(theta/2) * Math.cos(phi);
        const betaImag = Math.sin(theta/2) * Math.sin(phi);
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);

        // Update display elements (matching reference format)
        this.updateDisplayElement('bloch-sphere-state-theta', (theta >= 0 ? '+' : '') + theta.toFixed(4));
        this.updateDisplayElement('bloch-sphere-state-phi', (phi >= 0 ? '+' : '') + phi.toFixed(4));
        this.updateDisplayElement('bloch-sphere-state-alpha', (alpha >= 0 ? '+' : '') + alpha.toFixed(4));
        this.updateDisplayElement('bloch-sphere-state-beta', 
            (betaReal >= 0 ? '+' : '') + betaReal.toFixed(4) + ' + i * ' + 
            (betaImag >= 0 ? '+' : '') + betaImag.toFixed(4));
        this.updateDisplayElement('bloch-sphere-state-x', (x >= 0 ? '+' : '') + x.toFixed(4));
        this.updateDisplayElement('bloch-sphere-state-y', (y >= 0 ? '+' : '') + y.toFixed(4));
        this.updateDisplayElement('bloch-sphere-state-z', (z >= 0 ? '+' : '') + z.toFixed(4));
    }

    animateExactVectorTransition(vector, line, startPos, endPos) {
        const duration = 1000; // 1 second animation
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            // Interpolate position
            const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, easedProgress);
            vector.position.copy(currentPos);

            // Update state line
            if (line) {
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    currentPos
                ]);
                line.geometry.dispose();
                line.geometry = lineGeometry;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    applyLambdaGate(angle) {
        const container = document.getElementById('bloch-sphere');
        if (!container || !container._blochScene) return;

        const scene = container._blochScene.scene;
        const stateVector = scene.userData.stateVector;
        const stateLine = scene.userData.stateLine;
        if (!stateVector) return;

        // Convert angle to radians
        const theta = (angle * Math.PI) / 180;
        const phi = 0; // Default azimuth angle

        // Update state
        scene.userData.currentState = { theta, phi };

        // Calculate new position
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);

        // Animate transition
        this.animateExactVectorTransition(stateVector, stateLine, stateVector.position, new THREE.Vector3(x, y, z));

        // Update state display
        this.updateExactBlochSphereStateDisplay(container);

        console.log(`🎯 Applied lambda gate: θ=${theta.toFixed(3)}, φ=${phi.toFixed(3)}`);
    }

    async waitForScripts() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30; // 3 seconds

            const checkScripts = () => {
                attempts++;

                // Check if Three.js is loaded
                if (typeof THREE !== 'undefined' &&
                    typeof OrbitControls !== 'undefined' &&
                    typeof CSS2DRenderer !== 'undefined') {

                    console.log('✅ Three.js libraries loaded successfully');
                    resolve();
                    return;
                }

                if (attempts >= maxAttempts) {
                    console.warn('⚠️ Script loading timeout, proceeding anyway');
                    // Resolve anyway to prevent infinite loading
                    resolve();
                    return;
                }

                setTimeout(checkScripts, 100);
            };

            checkScripts();
        });
    }

    async initializeBlochSphereDirect(container) {
        console.log('🚀 Starting Bloch sphere initialization...');

        // Clear loading state
        container.innerHTML = '';

        // Debug: Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js not loaded!');
            this.createFallbackBlochSphere(container);
            return;
        }

        console.log('✅ Three.js is available');

        // Create the 3D scene directly
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);

        // Get container dimensions
        const containerWidth = container.offsetWidth || 400;
        const containerHeight = container.offsetHeight || 300;

        // Create camera
        const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
        camera.position.set(3, 3, 3);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerWidth, containerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create label renderer
        let labelRenderer;
        try {
            labelRenderer = new CSS2DRenderer();
            labelRenderer.setSize(containerWidth, containerHeight);
            labelRenderer.domElement.style.position = 'absolute';
            labelRenderer.domElement.style.top = '0';
            container.appendChild(labelRenderer.domElement);
        } catch (error) {
            console.warn('⚠️ CSS2DRenderer not available, skipping labels');
            labelRenderer = { render: () => {}, domElement: document.createElement('div') };
        }

        // Create controls
        let controls;
        try {
            controls = new OrbitControls(camera, renderer.domElement);
            controls.minDistance = 2;
            controls.maxDistance = 10;
            controls.enablePan = false;
        } catch (error) {
            console.warn('⚠️ OrbitControls not available, using basic controls');
            controls = { update: () => {} }; // Fallback
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Create Bloch sphere geometry
        this.createBlochSphereGeometry(scene);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
        };

        animate();

        // Store references for cleanup
        container._blochSphereData = {
            scene, camera, renderer, labelRenderer, controls, animate
        };

        // Update state display
        setInterval(() => {
            this.updateBlochSphereStateDisplay(container);
        }, 100);

        console.log('🎯 Bloch sphere initialized successfully');

        // Add a simple test to verify rendering
        setTimeout(() => {
            if (renderer && renderer.domElement) {
                console.log('✅ Renderer canvas created:', renderer.domElement.tagName);
            }
        }, 100);
    }

    createBlochSphereGeometry(scene) {
        // Create sphere geometry
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        // Create wireframe
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireframe = new THREE.Mesh(sphereGeometry, wireframeMaterial);
        scene.add(wireframe);

        // Create axes
        this.createAxes(scene);

        // Create state vector
        this.createStateVector(scene);
    }

    createAxes(scene) {
        const axisLength = 1.2;
        const axisWidth = 0.01;

        // X axis (red)
        const xGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength);
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        const xAxis = new THREE.Mesh(xGeometry, xMaterial);
        xAxis.rotation.z = Math.PI / 2;
        scene.add(xAxis);

        // Y axis (green)
        const yGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength);
        const yMaterial = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
        const yAxis = new THREE.Mesh(yGeometry, yMaterial);
        scene.add(yAxis);

        // Z axis (blue)
        const zGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength);
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
        const zAxis = new THREE.Mesh(zGeometry, zMaterial);
        zAxis.rotation.x = Math.PI / 2;
        scene.add(zAxis);

        // Add axis labels
        this.createAxisLabels(scene);
    }

    createAxisLabels(scene) {
        // This would add CSS2D labels for X, Y, Z axes
        // For now, we'll skip this to keep it simple
    }

    createStateVector(scene) {
        // Create state vector (arrow)
        const vectorLength = 0.8;
        const vectorGeometry = new THREE.ConeGeometry(0.05, 0.2);
        const vectorMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const vector = new THREE.Mesh(vectorGeometry, vectorMaterial);

        // Position at |0⟩ state initially
        vector.position.set(0, 0, vectorLength / 2);
        vector.rotation.x = 0;

        scene.add(vector);

        // Store reference for updates
        scene.userData.stateVector = vector;
    }

    updateBlochSphereStateDisplay(container) {
        try {
            // Get the scene data
            const sceneData = container._blochSphereData;
            if (!sceneData || !sceneData.scene) return;

            const stateVector = sceneData.scene.userData.stateVector;
            if (!stateVector) return;

            // Calculate quantum state from vector position
            const position = stateVector.position;
            const theta = Math.acos(position.z / Math.sqrt(position.x**2 + position.y**2 + position.z**2));
            const phi = Math.atan2(position.y, position.x);

            // Update display elements
            this.updateElement('bloch-sphere-state-theta', theta.toFixed(4));
            this.updateElement('bloch-sphere-state-phi', phi.toFixed(4));
            this.updateElement('bloch-sphere-state-alpha', (Math.cos(theta/2)).toFixed(4));
            this.updateElement('bloch-sphere-state-beta', (Math.sin(theta/2) * Math.cos(phi)).toFixed(4) + ' + i' + (Math.sin(theta/2) * Math.sin(phi)).toFixed(4));
            this.updateElement('bloch-sphere-state-x', (Math.sin(theta) * Math.cos(phi)).toFixed(4));
            this.updateElement('bloch-sphere-state-y', (Math.sin(theta) * Math.sin(phi)).toFixed(4));
            this.updateElement('bloch-sphere-state-z', (Math.cos(theta)).toFixed(4));
        } catch (error) {
            console.warn('⚠️ Error updating Bloch sphere state display:', error);
        }
    }

    // Old fallback function removed - now using Three.js Bloch sphere

    async updateCircuitWidget() {
        const contentElement = document.getElementById('circuit-content');
        if (!contentElement) return;

        // Use a real quantum circuit visualization for the dashboard widget
        contentElement.innerHTML = `
            <div style="
                width: 100%; 
                height: 300px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
                border-radius: 8px;
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    width: 100%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <!-- Quantum Circuit Visualization -->
                    <div style="
                        width: 280px;
                        height: 200px;
                        position: relative;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 8px;
                        padding: 20px;
                    ">
                        <!-- Qubit lines -->
                        <div style="
                            position: absolute;
                            top: 30px;
                            left: 20px;
                            right: 20px;
                            height: 2px;
                            background: linear-gradient(90deg, #4dabf7, #06b6d4);
                            border-radius: 1px;
                        "></div>
                        <div style="
                            position: absolute;
                            top: 80px;
                            left: 20px;
                            right: 20px;
                            height: 2px;
                            background: linear-gradient(90deg, #4dabf7, #06b6d4);
                            border-radius: 1px;
                        "></div>
                        <div style="
                            position: absolute;
                            top: 130px;
                            left: 20px;
                            right: 20px;
                            height: 2px;
                            background: linear-gradient(90deg, #4dabf7, #06b6d4);
                            border-radius: 1px;
                        "></div>
                        
                        <!-- Quantum Gates -->
                        <!-- Hadamard Gate -->
                        <div style="
                            position: absolute;
                            top: 15px;
                            left: 60px;
                            width: 30px;
                            height: 30px;
                            background: #4dabf7;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 14px;
                            box-shadow: 0 0 10px rgba(77, 171, 247, 0.5);
                        ">H</div>
                        
                        <!-- CNOT Gate -->
                        <div style="
                            position: absolute;
                            top: 65px;
                            left: 60px;
                            width: 30px;
                            height: 30px;
                            background: #ffa94d;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 14px;
                            box-shadow: 0 0 10px rgba(255, 169, 77, 0.5);
                        ">⊕</div>
                        
                        <!-- Pauli-X Gate -->
                        <div style="
                            position: absolute;
                            top: 115px;
                            left: 60px;
                            width: 30px;
                            height: 30px;
                            background: #ff6b6b;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 14px;
                            box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
                        ">X</div>
                        
                        <!-- More gates -->
                        <div style="
                            position: absolute;
                            top: 15px;
                            left: 120px;
                            width: 30px;
                            height: 30px;
                            background: #51cf66;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 14px;
                            box-shadow: 0 0 10px rgba(81, 207, 102, 0.5);
                        ">Y</div>
                        
                        <div style="
                            position: absolute;
                            top: 65px;
                            left: 120px;
                            width: 30px;
                            height: 30px;
                            background: #9775fa;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 14px;
                            box-shadow: 0 0 10px rgba(151, 117, 250, 0.5);
                        ">Z</div>
                        
                        <div style="
                            position: absolute;
                            top: 115px;
                            left: 120px;
                            width: 30px;
                            height: 30px;
                            background: #20c997;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 14px;
                            box-shadow: 0 0 10px rgba(32, 201, 151, 0.5);
                        ">T</div>
                        
                        <!-- CNOT connection line -->
                        <div style="
                            position: absolute;
                            top: 80px;
                            left: 75px;
                            width: 2px;
                            height: 30px;
                            background: #ffa94d;
                            opacity: 0.7;
                        "></div>
                        
                        <!-- Qubit labels -->
                        <div style="
                            position: absolute;
                            top: 20px;
                            left: 5px;
                            color: #06b6d4;
                            font-size: 12px;
                            font-weight: bold;
                        ">q₀</div>
                        <div style="
                            position: absolute;
                            top: 70px;
                            left: 5px;
                            color: #06b6d4;
                            font-size: 12px;
                            font-weight: bold;
                        ">q₁</div>
                        <div style="
                            position: absolute;
                            top: 120px;
                            left: 5px;
                            color: #06b6d4;
                            font-size: 12px;
                            font-weight: bold;
                        ">q₂</div>
                    </div>
                    
                    <!-- Info overlay -->
                    <div style="
                        position: absolute;
                        bottom: 10px;
                        left: 10px;
                        right: 10px;
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        text-align: center;
                    ">
                        Click popup for interactive 3D quantum circuit
                    </div>
                </div>
            </div>
        `;
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
            // Show job status trends over time using real job data
            const jobs = this.state.jobs;

            if (jobs && jobs.length > 0) {
                // Group jobs by status for a simple bar chart
                const statusCounts = {};
                jobs.forEach(job => {
                    const status = job.status || 'unknown';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });
                
                const plotData = [{
                    type: 'bar',
                    x: Object.keys(statusCounts),
                    y: Object.values(statusCounts),
                    marker: {
                        color: '#10b981',
                        line: { color: '#059669', width: 2 }
                    },
                    name: 'Jobs by Status'
                }];

                const layout = {
                    title: {
                        text: 'Job Performance Overview - Quantum Spark',
                        font: { size: 16, color: '#10b981' }
                    },
                    xaxis: { 
                        title: 'Job Status',
                        titlefont: { color: '#10b981' },
                        gridcolor: 'rgba(16, 185, 129, 0.3)'
                    },
                    yaxis: { 
                        title: 'Number of Jobs',
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
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No job data available for performance analysis</p>';
            }
        } catch (error) {
            console.error('Error updating performance widget:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading performance data</p>';
        }
    }

    async updateEntanglementWidget() {
        const contentElement = document.getElementById('entanglement-content');
        if (!contentElement) return;

        try {
            // Use real backend data to show qubit connectivity/entanglement potential
            const backends = this.state.backends;

            if (backends && backends.length > 0) {
                // Show backend connectivity/entanglement capacity
                const entanglementData = backends.map(backend => ({
                    name: backend.name,
                    qubits: backend.num_qubits || 0,
                    connectivity: Math.floor((backend.num_qubits || 0) * 0.7) // Rough estimate
                }));
                
                const plotData = [{
                    type: 'bar',
                    x: entanglementData.map(b => b.name),
                    y: entanglementData.map(b => b.connectivity),
                    marker: { 
                        color: '#8b5cf6',
                        line: { color: '#a855f7', width: 2 }
                    },
                    name: 'Entanglement Pairs'
                }];

                const layout = {
                    title: {
                        text: 'Backend Connectivity - Quantum Spark',
                        font: { size: 16, color: '#8b5cf6' }
                    },
                    xaxis: { 
                        title: 'Quantum Backends',
                        titlefont: { color: '#8b5cf6' },
                        gridcolor: 'rgba(139, 92, 246, 0.3)'
                    },
                    yaxis: { 
                        title: 'Potential Entanglement Pairs',
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
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No backend data available for entanglement analysis</p>';
            }
        } catch (error) {
            console.error('Error updating entanglement widget:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading entanglement data</p>';
        }
    }

    async updateResultsWidget() {
        const contentElement = document.getElementById('results-content');
        if (!contentElement) return;

        try {
            // Show job status distribution using real job data
            const jobs = this.state.jobs;

            if (jobs && jobs.length > 0) {
                // Count jobs by status
                const statusCounts = {};
                jobs.forEach(job => {
                    const status = job.status || 'unknown';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });
                
                const resultsHtml = `
                    <div style="padding: 1rem;">
                        <h4 style="color: var(--text-accent); margin-bottom: 1rem;">Job Status Distribution</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                            ${Object.entries(statusCounts).map(([status, count]) => `
                                <div style="text-align: center; padding: 1rem; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-accent);">${count}</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary); text-transform: capitalize;">${status}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top: 1rem; padding: 0.5rem; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                Total Jobs: ${jobs.length} | Last Updated: ${new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                `;
                
                contentElement.innerHTML = resultsHtml;
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No job data available</p>';
            }
        } catch (error) {
            console.error('Error updating results widget:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading results data</p>';
        }
    }

    async updateQuantumStateWidget() {
        const contentElement = document.getElementById('quantum-state-content');
        if (!contentElement) return;

        try {
            // Show backend capabilities and quantum properties
            const backends = this.state.backends;
            
            if (backends && backends.length > 0) {
                const backend = backends[0]; // Show first available backend
                
                const stateHtml = `
                    <div style="padding: 1rem;">
                        <h4 style="color: var(--text-accent); margin-bottom: 1rem;">Backend Capabilities</h4>
                        <div style="background: var(--glass-bg); border-radius: 8px; padding: 1rem; border: 1px solid var(--glass-border);">
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Backend:</strong>
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${backend.name}</span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Qubits:</strong>
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${backend.num_qubits || 'N/A'}</span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Status:</strong>
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${backend.operational ? 'Operational' : 'Offline'}</span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Queue:</strong>
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${backend.pending_jobs || 0} jobs</span>
                            </div>
                            <div>
                                <strong>Connectivity:</strong>
                                <span style="font-family: var(--font-mono); color: var(--text-accent);">${Math.floor((backend.num_qubits || 0) * 0.7)} qubit pairs</span>
                            </div>
                        </div>
                    </div>
                `;
                
                contentElement.innerHTML = stateHtml;
            } else {
                contentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No backend data available</p>';
            }
        } catch (error) {
            console.error('Error updating quantum state widget:', error);
            contentElement.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading backend data</p>';
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
        
        // Handle different widget types
        if (widgetType === 'circuit') {
            // For 3D circuit, create a full-screen interface
            popupContent.innerHTML = `
                <div id="3d-quantum-circuit-popup" style="width: 100%; height: 100%; position: relative;"></div>
            `;
            
            // Initialize the 3D circuit in popup mode
            setTimeout(() => {
                if (typeof init3DQuantumCircuit === 'function') {
                    // Temporarily set the container to the popup
                    const originalContainer = window.circuitContainer;
                    window.circuitContainer = document.getElementById('3d-quantum-circuit-popup');
                    
                    // Initialize the circuit
                    init3DQuantumCircuit();
                    
                    // Restore original container
                    window.circuitContainer = originalContainer;
                }
            }, 200);
            
        } else if (widgetType === 'bloch-sphere') {
            // For Bloch sphere, create a full-screen interface
            popupContent.innerHTML = `
                <div id="bloch-3d-container-popup" style="width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center;"></div>
            `;
            
            // Initialize the Bloch sphere in popup mode
            setTimeout(() => {
                this.initializeBlochSpherePopup();
            }, 200);
            
        } else {
            // For other widgets, clone the content
        const widgetContent = widget.querySelector('.widget-content');
        popupContent.innerHTML = widgetContent.innerHTML;
        
        // Re-render Plotly charts in popup
        setTimeout(() => {
            const plotlyDivs = popupContent.querySelectorAll('.plotly-graph-div');
            plotlyDivs.forEach(div => {
                Plotly.Plots.resize(div);
            });
        }, 100);
        }
        
        popupOverlay.classList.add('active');
    }

    initializeBlochSpherePopup() {
        const popupContainer = document.getElementById('bloch-3d-container-popup');
        if (!popupContainer) return;

        // Clear the container and create the Bloch sphere canvas with toolbox
        popupContainer.innerHTML = `
            <div class="bloch-popup-container" style="width: 100%; height: 100%; display: flex; position: relative;">
                <!-- Main Bloch Sphere -->
                <div class="bloch-main-view" style="flex: 1; position: relative;">
                    <div id="bloch-sphere-popup" style="width: 100%; height: 100%; position: relative;"></div>
                <div id="bloch-sphere-state-popup" style="position: absolute; bottom: 10px; left: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <span>Theta: <span id="bloch-sphere-state-theta-popup">0.0000</span></span><br>
                            <span>Phi: <span id="bloch-sphere-state-phi-popup">90.0000</span></span>
                        </div>
                        <div>
                            <span>Alpha: <span id="bloch-sphere-state-alpha-popup">1.0000</span></span><br>
                            <span>Beta: <span id="bloch-sphere-state-beta-popup">0.0000 + i0.0000</span></span>
                        </div>
                        <div>
                            <span>X: <span id="bloch-sphere-state-x-popup">0.0000</span></span><br>
                            <span>Y: <span id="bloch-sphere-state-y-popup">0.0000</span></span><br>
                            <span>Z: <span id="bloch-sphere-state-z-popup">1.0000</span></span>
                        </div>
                        </div>
                    </div>
                </div>

                <!-- Toolbox Sidebar -->
                <div class="bloch-toolbox" style="width: 300px; background: rgba(0,0,0,0.9); padding: 20px; overflow-y: auto; border-left: 1px solid rgba(6,182,212,0.3);">
                    <h4 style="color: #06b6d4; margin-bottom: 20px; font-family: 'Orbitron', monospace;">Quantum Gates</h4>

                    <div style="margin-bottom: 20px;">
                        <h5 style="color: #f8fafc; margin-bottom: 10px;">Half-turn Gates</h5>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                            <button class="quantum-gate-btn" data-gate="px-builtInGate" style="background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">P<sub>x</sub></button>
                            <button class="quantum-gate-btn" data-gate="py-builtInGate" style="background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">P<sub>y</sub></button>
                            <button class="quantum-gate-btn" data-gate="pz-builtInGate" style="background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">P<sub>z</sub></button>
                            <button class="quantum-gate-btn" data-gate="h-builtInGate" style="background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">H</button>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h5 style="color: #f8fafc; margin-bottom: 10px;">Quarter-turn Gates</h5>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                            <button class="quantum-gate-btn" data-gate="px-12-builtInGate" style="background: #059669; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">P<sub>x</sub><sup>1/2</sup></button>
                            <button class="quantum-gate-btn" data-gate="py-12-builtInGate" style="background: #059669; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">P<sub>y</sub><sup>1/2</sup></button>
                            <button class="quantum-gate-btn" data-gate="pz-12-builtInGate" style="background: #059669; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">P<sub>z</sub><sup>1/2</sup></button>
                            <button class="quantum-gate-btn" data-gate="s-builtInGate" style="background: #059669; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px;">S</button>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h5 style="color: #f8fafc; margin-bottom: 10px;">Lambda Gates</h5>
                        <div style="margin-bottom: 10px;">
                            <label style="color: #cbd5e1; font-size: 12px;">Polar Angle:</label>
                            <input type="range" id="popup-polar-angle" min="0" max="360" value="0" style="width: 100%;">
                            <span id="popup-polar-value" style="color: #06b6d4; font-size: 12px;">0°</span>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label style="color: #cbd5e1; font-size: 12px;">Azimuth Angle:</label>
                            <input type="range" id="popup-azimuth-angle" min="0" max="360" value="0" style="width: 100%;">
                            <span id="popup-azimuth-value" style="color: #06b6d4; font-size: 12px;">0°</span>
                        </div>
                        <button id="popup-apply-lambda" style="background: #d97706; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%;">Apply Lambda Gate</button>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h5 style="color: #f8fafc; margin-bottom: 10px;">Custom Gate</h5>
                        <button id="popup-custom-gate-btn" style="background: #7c3aed; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%;">Create Custom Gate</button>
                    </div>
                </div>
            </div>
        `;

        // Initialize the advanced Bloch sphere in popup
        this.initAdvancedBlochSpherePopup();

        // Setup toolbox event listeners
        this.setupPopupToolboxEvents();
    }

    initAdvancedBlochSpherePopup() {
        const container = document.getElementById('bloch-sphere-popup');
        if (!container) {
            console.error('❌ Popup Bloch sphere container not found');
            return;
        }

        // Create the interactive Bloch sphere for popup
        this.createInteractiveBlochSphere(container);

        // Setup quantum gate event listeners for popup
        this.setupPopupQuantumGateListeners();
    }

    setupPopupQuantumGateListeners() {
        // Setup listeners for popup quantum gates
        const popupQuantumGates = document.querySelectorAll('.quantum-gate-btn');
        popupQuantumGates.forEach(button => {
            button.addEventListener('click', (e) => {
                const gateType = e.target.getAttribute('data-gate');
                this.applyQuantumGateToScene(gateType);
                                            });
                                        });
    }

    setupPopupToolboxEvents() {
        // Gate buttons
        document.querySelectorAll('.quantum-gate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gateType = e.target.getAttribute('data-gate');
                this.applyQuantumGate(gateType);
                                    });
                                });

        // Lambda gate controls
        const polarAngle = document.getElementById('popup-polar-angle');
        const azimuthAngle = document.getElementById('popup-azimuth-angle');
        const polarValue = document.getElementById('popup-polar-value');
        const azimuthValue = document.getElementById('popup-azimuth-value');

        if (polarAngle && polarValue) {
            polarAngle.addEventListener('input', (e) => {
                polarValue.textContent = e.target.value + '°';
            });
        }

        if (azimuthAngle && azimuthValue) {
            azimuthAngle.addEventListener('input', (e) => {
                azimuthValue.textContent = e.target.value + '°';
            });
        }

        // Apply lambda gate
        const applyLambdaBtn = document.getElementById('popup-apply-lambda');
        if (applyLambdaBtn) {
            applyLambdaBtn.addEventListener('click', () => {
                const polar = parseFloat(polarAngle.value);
                const azimuth = parseFloat(azimuthAngle.value);
                this.applyLambdaGate(polar, azimuth);
            });
        }

        // Custom gate button
        const customGateBtn = document.getElementById('popup-custom-gate-btn');
        if (customGateBtn) {
            customGateBtn.addEventListener('click', () => {
                this.showCustomGateModal();
            });
        }
    }

    applyQuantumGate(gateType) {
        // Get all Bloch sphere containers (widget, popup, fullscreen)
        const containers = [
            document.getElementById('bloch-sphere'),
            document.getElementById('bloch-sphere-popup'),
            document.getElementById('bloch-sphere-fullscreen')
        ];

        containers.forEach(container => {
            if (container && container._blochSphereData) {
                this.applyGateToBlochSphere(container, gateType);
            }
        });

        console.log('Applying gate:', gateType);
    }

    applyGateToBlochSphere(container, gateType) {
        const sceneData = container._blochSphereData;
        if (!sceneData || !sceneData.scene) return;

        const stateVector = sceneData.scene.userData.stateVector;
        if (!stateVector) return;

        // Get current position
        const currentPos = stateVector.position.clone();
        const currentLength = currentPos.length();

        // Apply quantum gate transformation
        let newPos = currentPos.clone();

        switch (gateType) {
            case 'px-builtInGate': // Pauli-X (180° around X-axis)
                newPos.set(currentPos.x, -currentPos.y, -currentPos.z);
                break;
            case 'py-builtInGate': // Pauli-Y (180° around Y-axis)
                newPos.set(-currentPos.x, currentPos.y, -currentPos.z);
                break;
            case 'pz-builtInGate': // Pauli-Z (180° around Z-axis)
                newPos.set(-currentPos.x, -currentPos.y, currentPos.z);
                break;
            case 'h-builtInGate': // Hadamard (180° around X+Z axis)
                // H|0⟩ = |+⟩, H|1⟩ = |-⟩
                const theta = Math.acos(currentPos.z);
                const phi = Math.atan2(currentPos.y, currentPos.x);
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);
                newPos.set(
                    sinTheta * Math.cos(phi + Math.PI),
                    sinTheta * Math.sin(phi + Math.PI),
                    cosTheta
                );
                break;
            case 'px-12-builtInGate': // X-90°
                this.rotateAroundAxis(newPos, currentPos, new THREE.Vector3(1, 0, 0), Math.PI / 2);
                break;
            case 'py-12-builtInGate': // Y-90°
                this.rotateAroundAxis(newPos, currentPos, new THREE.Vector3(0, 1, 0), Math.PI / 2);
                break;
            case 'pz-12-builtInGate': // Z-90°
                this.rotateAroundAxis(newPos, currentPos, new THREE.Vector3(0, 0, 1), Math.PI / 2);
                break;
            case 's-builtInGate': // S-gate (Z-90°)
                this.rotateAroundAxis(newPos, currentPos, new THREE.Vector3(0, 0, 1), Math.PI / 2);
                break;
        }

        // Normalize to keep on sphere surface
        newPos.normalize();

        // Animate the transition
        this.animateVectorTransition(stateVector, currentPos, newPos);
    }

    rotateAroundAxis(result, vector, axis, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const dot = vector.dot(axis);

        result.copy(axis);
        result.multiplyScalar(dot * (1 - cos));
        result.add(vector.clone().multiplyScalar(cos));
        result.add(axis.clone().cross(vector).multiplyScalar(sin));
    }

    animateVectorTransition(vector, startPos, endPos) {
        const duration = 1000; // 1 second animation
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            // Interpolate position
            const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, easedProgress);
            vector.position.copy(currentPos);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    applyLambdaGate(polar, azimuth) {
        if (typeof GlobalContext !== 'undefined') {
            GlobalContext.lambdaGatesProperties.polarAngle = polar.toString();
            GlobalContext.lambdaGatesProperties.azimuthAngle = azimuth.toString();
            console.log('Applied lambda gate:', polar, azimuth);
        }
    }

    updatePopupBlochSphereStateDisplay() {
        const container = document.getElementById('bloch-sphere-popup');
        if (container) {
            this.updateBlochSphereStateDisplay(container);
        }
    }





    createSimpleBlochSphere(container) {
        console.log('🔄 Creating simple Bloch sphere fallback...');

        try {
            // Clear container
            container.innerHTML = '';

            // Create basic Three.js scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a1a2e);

            const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
            camera.position.z = 2;

            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.offsetWidth || 400, container.offsetHeight || 300);
            container.appendChild(renderer.domElement);

            // Create basic sphere
            const geometry = new THREE.SphereGeometry(0.8, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: 0x06b6d4,
                wireframe: true,
                transparent: true,
                opacity: 0.7
            });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);

            // Add basic lighting
            const light = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(light);

            // Animation
            const animate = () => {
                requestAnimationFrame(animate);
                sphere.rotation.y += 0.005;
                renderer.render(scene, camera);
            };
            animate();

            console.log('✅ Simple Bloch sphere created');

        } catch (error) {
            console.error('❌ Even simple sphere failed:', error);
            this.createFallbackBlochSphere(container);
        }
    }

    createFallbackBlochSphere(container) {
        // Enhanced fallback that matches the dashboard design
        container.innerHTML = `
            <div style="
                width: 100%; 
                height: 100%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
                position: relative;
            ">
                <div style="
                    text-align: center; 
                    color: white;
                    background: rgba(0, 0, 0, 0.8);
                    padding: 30px;
                    border-radius: 10px;
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
                ">
                    <div style="
                        width: 80px;
                        height: 80px;
                        background: radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.8), rgba(59, 130, 246, 0.6));
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: pulse 2s ease-in-out infinite;
                    ">
                        <i class="fas fa-globe" style="font-size: 30px; color: white;"></i>
                    </div>
                    <h3 style="margin: 0 0 10px; color: #06b6d4;">Bloch Sphere</h3>
                    <p style="margin: 0 0 5px; opacity: 0.9;">Interactive 3D visualization</p>
                    <p style="font-size: 12px; opacity: 0.7; margin: 0;">Three.js Bloch sphere simulator</p>
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
            </style>
        `;
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
            if (widgetType === 'bloch-sphere') {
                // Special handling for Bloch sphere fullscreen
                this.openBlochSphereFullscreen(widget);
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
    }

    openBlochSphereFullscreen(widget) {
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.id = 'bloch-fullscreen-container';
        fullscreenContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000000;
            z-index: 9999;
            display: flex;
        `;

        fullscreenContainer.innerHTML = `
            <div class="bloch-fullscreen-main" style="flex: 1; position: relative;">
                <div id="bloch-sphere-fullscreen" style="width: 100%; height: 100%; position: relative;"></div>
                <div id="bloch-sphere-state-fullscreen" style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 15px; border-radius: 8px; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <span>Theta: <span id="bloch-sphere-state-theta-fullscreen">0.0000</span></span><br>
                            <span>Phi: <span id="bloch-sphere-state-phi-fullscreen">90.0000</span></span>
                        </div>
                        <div>
                            <span>Alpha: <span id="bloch-sphere-state-alpha-fullscreen">1.0000</span></span><br>
                            <span>Beta: <span id="bloch-sphere-state-beta-fullscreen">0.0000 + i0.0000</span></span>
                        </div>
                        <div>
                            <span>X: <span id="bloch-sphere-state-x-fullscreen">0.0000</span></span><br>
                            <span>Y: <span id="bloch-sphere-state-y-fullscreen">0.0000</span></span><br>
                            <span>Z: <span id="bloch-sphere-state-z-fullscreen">1.0000</span></span>
                        </div>
                    </div>
                </div>
                <button id="exit-fullscreen-btn" style="position: absolute; top: 20px; right: 20px; background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; z-index: 10000;">Exit Fullscreen</button>
            </div>

            <!-- Fullscreen Toolbox -->
            <div class="bloch-fullscreen-toolbox" style="width: 350px; background: rgba(0,0,0,0.95); padding: 25px; overflow-y: auto; border-left: 2px solid rgba(6,182,212,0.5);">
                <h3 style="color: #06b6d4; margin-bottom: 25px; font-family: 'Orbitron', monospace; text-align: center;">Advanced Quantum Toolbox</h3>

                <div style="margin-bottom: 25px;">
                    <h5 style="color: #f8fafc; margin-bottom: 15px; border-bottom: 1px solid #06b6d4; padding-bottom: 5px;">Built-in Gates</h5>

                    <div style="margin-bottom: 15px;">
                        <h6 style="color: #cbd5e1; margin-bottom: 10px;">Half-turn Gates (180°)</h6>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <button class="fullscreen-gate-btn" data-gate="px-builtInGate" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">P<sub>x</sub></button>
                            <button class="fullscreen-gate-btn" data-gate="py-builtInGate" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">P<sub>y</sub></button>
                            <button class="fullscreen-gate-btn" data-gate="pz-builtInGate" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">P<sub>z</sub></button>
                            <button class="fullscreen-gate-btn" data-gate="h-builtInGate" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">H</button>
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <h6 style="color: #cbd5e1; margin-bottom: 10px;">Quarter-turn Gates (90°)</h6>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <button class="fullscreen-gate-btn" data-gate="px-12-builtInGate" style="background: linear-gradient(135deg, #059669, #047857); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">P<sub>x</sub><sup>1/2</sup></button>
                            <button class="fullscreen-gate-btn" data-gate="py-12-builtInGate" style="background: linear-gradient(135deg, #059669, #047857); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">P<sub>y</sub><sup>1/2</sup></button>
                            <button class="fullscreen-gate-btn" data-gate="pz-12-builtInGate" style="background: linear-gradient(135deg, #059669, #047857); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">P<sub>z</sub><sup>1/2</sup></button>
                            <button class="fullscreen-gate-btn" data-gate="s-builtInGate" style="background: linear-gradient(135deg, #059669, #047857); color: white; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">S</button>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 25px;">
                    <h5 style="color: #f8fafc; margin-bottom: 15px; border-bottom: 1px solid #06b6d4; padding-bottom: 5px;">Lambda Gates</h5>
                    <div style="margin-bottom: 15px;">
                        <label style="color: #cbd5e1; font-size: 14px; display: block; margin-bottom: 5px;">Polar Angle: <span id="fullscreen-polar-value" style="color: #06b6d4;">0°</span></label>
                        <input type="range" id="fullscreen-polar-angle" min="0" max="360" value="0" style="width: 100%; height: 6px; border-radius: 3px; background: #374151;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="color: #cbd5e1; font-size: 14px; display: block; margin-bottom: 5px;">Azimuth Angle: <span id="fullscreen-azimuth-value" style="color: #06b6d4;">0°</span></label>
                        <input type="range" id="fullscreen-azimuth-angle" min="0" max="360" value="0" style="width: 100%; height: 6px; border-radius: 3px; background: #374151;">
                    </div>
                    <button id="fullscreen-apply-lambda" style="background: linear-gradient(135deg, #d97706, #b45309); color: white; border: none; padding: 12px 24px; border-radius: 6px; width: 100%; font-size: 14px; font-weight: bold;">Apply Lambda Gate</button>
                </div>

                <div style="margin-bottom: 25px;">
                    <h5 style="color: #f8fafc; margin-bottom: 15px; border-bottom: 1px solid #06b6d4; padding-bottom: 5px;">Custom Operations</h5>
                    <button id="fullscreen-custom-gate-btn" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border: none; padding: 12px 24px; border-radius: 6px; width: 100%; font-size: 14px; font-weight: bold; margin-bottom: 10px;">Create Custom Gate</button>
                    <button id="fullscreen-export-btn" style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none; padding: 12px 24px; border-radius: 6px; width: 100%; font-size: 14px; font-weight: bold;">Export Workspace</button>
                </div>
            </div>
        `;

        document.body.appendChild(fullscreenContainer);

        // Initialize fullscreen Bloch sphere
        this.initFullscreenBlochSphere();

        // Setup fullscreen event listeners
        this.setupFullscreenEvents();

        // Enter fullscreen
        fullscreenContainer.requestFullscreen().catch(err => {
            console.error('Error entering fullscreen:', err);
        });
    }

    initFullscreenBlochSphere() {
        const container = document.getElementById('bloch-sphere-fullscreen');
        if (!container) {
            console.error('❌ Fullscreen Bloch sphere container not found');
            return;
        }

        // Create the interactive Bloch sphere for fullscreen
        this.createInteractiveBlochSphere(container);

        // Setup quantum gate event listeners for fullscreen
        this.setupFullscreenQuantumGateListeners();
    }

    setupFullscreenQuantumGateListeners() {
        // Setup listeners for fullscreen quantum gates
        const fullscreenQuantumGates = document.querySelectorAll('.fullscreen-gate-btn');
        fullscreenQuantumGates.forEach(button => {
            button.addEventListener('click', (e) => {
                const gateType = e.target.getAttribute('data-gate');
                this.applyQuantumGateToScene(gateType);
            });
        });
    }

    setupFullscreenEvents() {
        // Exit fullscreen button
        const exitBtn = document.getElementById('exit-fullscreen-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                document.exitFullscreen().catch(err => {
                    console.error('Error exiting fullscreen:', err);
                });
            });
        }

        // Gate buttons
        document.querySelectorAll('.fullscreen-gate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gateType = e.target.getAttribute('data-gate');
                this.applyQuantumGate(gateType);
            });
        });

        // Lambda controls
        const polarAngle = document.getElementById('fullscreen-polar-angle');
        const azimuthAngle = document.getElementById('fullscreen-azimuth-angle');
        const polarValue = document.getElementById('fullscreen-polar-value');
        const azimuthValue = document.getElementById('fullscreen-azimuth-value');

        if (polarAngle && polarValue) {
            polarAngle.addEventListener('input', (e) => {
                polarValue.textContent = e.target.value + '°';
            });
        }

        if (azimuthAngle && azimuthValue) {
            azimuthAngle.addEventListener('input', (e) => {
                azimuthValue.textContent = e.target.value + '°';
            });
        }

        // Apply lambda gate
        const applyLambdaBtn = document.getElementById('fullscreen-apply-lambda');
        if (applyLambdaBtn) {
            applyLambdaBtn.addEventListener('click', () => {
                const polar = parseFloat(polarAngle.value);
                const azimuth = parseFloat(azimuthAngle.value);
                this.applyLambdaGate(polar, azimuth);
            });
        }

        // Custom operations
        const customGateBtn = document.getElementById('fullscreen-custom-gate-btn');
        const exportBtn = document.getElementById('fullscreen-export-btn');

        if (customGateBtn) {
            customGateBtn.addEventListener('click', () => {
                this.showCustomGateModal();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportWorkspace();
            });
        }

        // Handle fullscreen exit
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                const fullscreenContainer = document.getElementById('bloch-fullscreen-container');
                if (fullscreenContainer) {
                    document.body.removeChild(fullscreenContainer);
                }
            }
        });
    }

    updateFullscreenBlochSphereStateDisplay() {
        const container = document.getElementById('bloch-sphere-fullscreen');
        if (container) {
            this.updateBlochSphereStateDisplay(container);
        }
    }

    showCustomGateModal() {
        console.log('Custom gate modal would open here');
        // Implementation for custom gate creation modal
    }

    exportWorkspace() {
        console.log('Workspace export functionality would be implemented here');
        // Implementation for workspace export
    }

    updateDisplayElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
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
        }, 300);
    }

    addWidget(widgetType) {
        if (this.widgets.has(widgetType)) {
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
        await this.fetchDashboardData();
        this.updateMetrics();
        await this.updateAllWidgets();
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

// Global functions for testing
window.testWidgetSystem = function() {
    console.log('🧪 Testing Widget System...');
    const widget = document.querySelector('[data-widget="bloch-sphere"]');
    if (widget) {
        console.log('✅ Bloch sphere widget found');
        const content = widget.querySelector('#bloch-content');
        if (content) {
            console.log('✅ Widget content found');
            content.style.display = 'block';
            console.log('✅ Widget should now be visible');
        } else {
            console.error('❌ Widget content not found');
        }
    } else {
        console.error('❌ Bloch sphere widget not found');
    }
};

window.testBlochSphere = function() {
    console.log('🎯 Testing Exact Bloch Sphere...');

    const container = document.getElementById('bloch-sphere');
    if (!container) {
        alert('❌ Bloch sphere container not found!');
        return;
    }

    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        container.innerHTML = '<div style="padding: 20px; color: red; text-align: center;">❌ Three.js not loaded</div>';
        return;
    }

    console.log('✅ Three.js is available');

    // Test if the exact Bloch sphere is working
    if (window.hackathonDashboard) {
        console.log('✅ Dashboard found, testing exact Bloch sphere...');
        window.hackathonDashboard.initExactBlochSphere();
        
        // Test a quantum gate after a delay
        setTimeout(() => {
            console.log('🎯 Testing H gate...');
            const hButton = document.getElementById('h-builtInGate');
            if (hButton) {
                hButton.click();
                console.log('✅ H gate clicked!');
            } else {
                console.error('❌ H gate button not found');
            }
        }, 1000);
    } else {
        console.error('❌ Dashboard not found');
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hackathonDashboard = new HackathonDashboard();

    // Add team branding

    console.log('🚀 Quantum Spark - Amravati Quantum Hackathon 2024');
    console.log('👨‍💻 Developed by Satish Kumar');
    console.log('🏆 Ready to win the hackathon!');
});