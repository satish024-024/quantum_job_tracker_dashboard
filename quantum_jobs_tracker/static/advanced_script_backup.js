// Advanced Quantum Dashboard
class QuantumDashboard {
    showCircuitFullscreen() {
        const overlay = document.getElementById('fullscreen-circuit-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.renderCircuitPlotly();
        }
    }

    hideCircuitFullscreen() {
        const overlay = document.getElementById('fullscreen-circuit-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    renderCircuitPlotly() {
        // Use Plotly to render the circuit interactively
        const plotDiv = document.getElementById('fullscreen-circuit-plot');
        if (!plotDiv || !this.state.circuitData) return;

        // Prepare data for Plotly
        const circuit = this.state.circuitData;
        const qubits = circuit.num_qubits || 3;
        const gates = circuit.gates || [];
        const depth = circuit.depth || gates.length;

        // Build traces for each qubit line
        let traces = [];
        for (let q = 0; q < qubits; q++) {
            traces.push({
                x: Array(depth + 1).fill().map((_, i) => i),
                y: Array(depth + 1).fill(q),
                mode: 'lines',
                line: { color: 'rgba(200,200,200,0.5)', width: 3 },
                showlegend: false,
                hoverinfo: 'none'
            });
        }

        // Gate markers
        let gateMarkers = [];
        gates.forEach(gate => {
            gate.qubits.forEach(q => {
                gateMarkers.push({
                    x: [gate.position],
                    y: [q],
                    mode: 'markers+text',
                    marker: {
                        size: 30,
                        color: gate.name === 'h' ? '#4dabf7' :
                               gate.name === 'x' ? '#ff6b6b' :
                               gate.name === 'y' ? '#51cf66' :
                               gate.name === 'z' ? '#9775fa' :
                               gate.name === 'cx' ? '#ffa94d' :
                               gate.name === 'measure' ? '#ffd43b' : '#ccc',
                        symbol: 'circle'
                    },
                    text: gate.name.toUpperCase(),
                    textposition: 'middle center',
                    hovertemplate: `Gate: ${gate.name.toUpperCase()}<br>Qubit: q${q}<br>Step: ${gate.position}`,
                    showlegend: false
                });
            });
        });

        // Combine traces
        const data = [...traces, ...gateMarkers];

        // Layout
        const layout = {
            title: 'Quantum Circuit',
            xaxis: { title: 'Step', range: [-1, depth + 1], zeroline: false, showgrid: false },
            yaxis: { title: 'Qubit', range: [-1, qubits], zeroline: false, showgrid: false, tickvals: Array(qubits).fill().map((_, i) => i), ticktext: Array(qubits).fill().map((_, i) => `|q${i}⟩`) },
            margin: { t: 40, l: 60, r: 40, b: 40 },
            hovermode: 'closest',
            showlegend: false,
            height: 700,
            dragmode: 'pan',
        };

        Plotly.newPlot(plotDiv, data, layout, {responsive: true});
    }
    constructor() {
        this.state = {
            backends: [],
            jobs: [],
            quantumState: null,
            circuitData: null,
            isConnected: false,
            realDataAvailable: false
        };
        
        this.blochCanvas = null;
        this.blochCtx = null;
        this.circuitCanvas = null;
        this.circuitCtx = null;
        this.animationId = null;
        this.circuitAnimationId = null;
        
        this.blochState = {
            theta: Math.PI / 4,
            phi: Math.PI / 6,
            autoRotate: true,
            rotation: 0,
            isExpanded: false,
            history: [],
            currentState: { theta: Math.PI / 4, phi: Math.PI / 6 }
        };
        
        this.init();
        
        // Initialize settings modal
        this.initSettingsModal();
    }

    async init() {
        console.log('🚀 Initializing Enhanced Quantum Dashboard...');
        
        // Setup event listeners first
        this.setupEventListeners();
        // Setup expand circuit button
        let expandCircuitBtn = document.getElementById('expand-circuit-btn');
        if (expandCircuitBtn) {
                expandCircuitBtn.addEventListener('click', () => {
                    if (window.toggleFullscreen && typeof window.toggleFullscreen === 'function') {
                        window.toggleFullscreen();
                    } else {
                        // Fallback: try to make the #3d-quantum-circuit fullscreen
                        const elem = document.getElementById('3d-quantum-circuit');
                        if (elem && elem.requestFullscreen) {
                            elem.requestFullscreen();
                        }
                    }
                });
        }
        // Setup close button for fullscreen circuit
        const closeCircuitBtn = document.getElementById('close-circuit-fullscreen');
        if (closeCircuitBtn) {
            closeCircuitBtn.addEventListener('click', () => this.hideCircuitFullscreen());
        }
        
    // Remove unused 2D canvas initialization (for 3D widget only)
    // this.initializeCanvases();
        
        // Load real data immediately
        await this.loadAllData();
        
        // Start animations and real-time updates
        this.startAnimations();
        this.startRealTimeUpdates();
        
        console.log('✅ Dashboard initialization complete');
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Notification button
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.toggleNotificationPanel());
        }

        // Circuit controls
        const circuitPlay = document.getElementById('circuit-play');
        if (circuitPlay) {
            circuitPlay.addEventListener('click', () => this.toggleCircuitPlayback());
        }

        // Jobs search
        const jobsSearch = document.getElementById('jobs-search');
        if (jobsSearch) {
            jobsSearch.addEventListener('input', (e) => this.filterJobs(e.target.value));
        }
        
        // Download button for jobs
        const downloadBtn = document.querySelector('[data-action="export"]');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.showDownloadOptions());
        }

        // Mobile menu
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Bloch sphere expand button
        const expandBlochBtn = document.getElementById('expand-bloch-btn');
        if (expandBlochBtn) {
            expandBlochBtn.addEventListener('click', () => {
                if (window.toggleFullscreenBloch && typeof window.toggleFullscreenBloch === 'function') {
                    window.toggleFullscreenBloch();
                } else {
                    // Fallback: try to make the Bloch sphere container fullscreen
                    const elem = document.getElementById('bloch-sphere-container');
                    if (elem && elem.requestFullscreen) {
                        elem.requestFullscreen();
                    }
                }
            });
        }

        // Fullscreen button for Bloch sphere
        const fullscreenBtn = document.querySelector('[data-action="fullscreen"]');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleBlochFullscreen());
        }

        // Bloch sphere control buttons
        this.setupBlochControls();

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Scroll indicator setup
        // Scroll indicator setup removed
    }

    initializeCanvases() {
        // Initialize Bloch sphere canvas
                // Ensure 3D widget is initialized after DOM is ready
                document.addEventListener('DOMContentLoaded', () => {
                    if (window.init3DQuantumCircuit && typeof window.init3DQuantumCircuit === 'function') {
                        window.init3DQuantumCircuit();
                    }
                    this.init();
                });
        
        // Initialize circuit canvas
        this.initializeCircuitCanvas();
        
        // Initialize other visualization canvases
        this.initializeAdditionalCanvases();
    }

    // Bloch sphere is now handled by external Plotly implementation
    initializeBlochCanvas() {
        // Restore mini Bloch sphere visual diagram
        const canvas = document.getElementById('bloch-canvas');
        if (!canvas) {
            console.error('❌ Bloch sphere canvas not found!');
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('❌ Could not get 2D context for Bloch sphere canvas!');
            return;
        }
        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 200;
        canvas.height = rect.height || 200;
        this.blochCanvas = canvas;
        this.blochCtx = ctx;
        // Draw mini Bloch sphere
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw sphere
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2-10, 0, 2*Math.PI);
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.lineTo(canvas.width/2, 20);
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.lineTo(canvas.width-20, canvas.height/2);
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.lineTo(canvas.width/2, canvas.height-20);
        ctx.strokeStyle = '#e91e63';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw state vector
        const theta = this.blochState.theta;
        const phi = this.blochState.phi;
        const r = canvas.width/2-20;
        const x = canvas.width/2 + r * Math.sin(theta) * Math.cos(phi);
        const y = canvas.height/2 - r * Math.cos(theta);
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#3f51b5';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Draw north/south pole labels
        ctx.font = '14px Inter';
        ctx.fillStyle = '#fff';
        ctx.fillText('0', canvas.width/2-10, 30);
        ctx.fillText('1', canvas.width/2-10, canvas.height-20);
        console.log('✅ Mini Bloch sphere loaded');
    }

    initializeCircuitCanvas() {
        const canvas = document.getElementById('circuit-canvas');
        if (!canvas) {
            console.error('❌ Circuit canvas not found!');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('❌ Could not get 2D context for circuit canvas!');
            return;
        }

        // Set proper canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 400;
        canvas.height = rect.height || 300;

        this.circuitCanvas = canvas;
        this.circuitCtx = ctx;

        console.log('✅ Circuit canvas initialized');
    }

    initializeAdditionalCanvases() {
        // Initialize entanglement canvas
        const entanglementCanvas = document.getElementById('entanglement-canvas');
        if (entanglementCanvas) {
            const rect = entanglementCanvas.getBoundingClientRect();
            entanglementCanvas.width = rect.width || 300;
            entanglementCanvas.height = rect.height || 200;
        }

        // Initialize results canvas
        const resultsCanvas = document.getElementById('results-canvas');
        if (resultsCanvas) {
            const rect = resultsCanvas.getBoundingClientRect();
            resultsCanvas.width = rect.width || 300;
            resultsCanvas.height = rect.height || 200;
        }
    }

    setupBlochCanvasControls() {
        if (!this.blochCanvas) return;

        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        // Mouse events
        this.blochCanvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            this.blochState.autoRotate = false;
        });

        this.blochCanvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            this.blochState.phi += deltaX * 0.01;
            this.blochState.theta += deltaY * 0.01;
            this.blochState.theta = Math.max(0, Math.min(Math.PI, this.blochState.theta));
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        this.blochCanvas.addEventListener('mouseup', () => {
            isDragging = false;
            setTimeout(() => {
                this.blochState.autoRotate = true;
            }, 2000);
        });

        // Touch events
        this.blochCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            isDragging = true;
            lastMouseX = touch.clientX;
            lastMouseY = touch.clientY;
            this.blochState.autoRotate = false;
        });

        this.blochCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastMouseX;
            const deltaY = touch.clientY - lastMouseY;
            
            this.blochState.phi += deltaX * 0.01;
            this.blochState.theta += deltaY * 0.01;
            this.blochState.theta = Math.max(0, Math.min(Math.PI, this.blochState.theta));
            
            lastMouseX = touch.clientX;
            lastMouseY = touch.clientY;
        });

        this.blochCanvas.addEventListener('touchend', () => {
            isDragging = false;
            setTimeout(() => {
                this.blochState.autoRotate = true;
            }, 2000);
        });
    }

    async loadAllData() {
        console.log('📡 Loading all real-time data...');
        
        try {
            // First check connection status
            await this.checkConnectionStatus();
            
            // Load all data in parallel
            await Promise.all([
                this.loadBackends(),
                this.loadJobs(),
                this.loadQuantumState(),
                this.loadCircuitData()
            ]);
            
            console.log('✅ All data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading data:', error);
        }
    }

    async checkConnectionStatus() {
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                const statusData = await response.json();
                
                if (statusData.is_connected) {
                    this.state.isConnected = true;
                    this.state.realDataAvailable = true;
                    
                    // Update the simulation mode indicator to show real quantum data
                    const simIndicator = document.querySelector('.simulation-indicator');
                    if (simIndicator) {
                        simIndicator.innerHTML = `
                            <span class="status-badge real">🔴 REAL QUANTUM DATA</span>
                            <span class="info">Connected to IBM Quantum</span>
                        `;
                        simIndicator.className = 'real-data-indicator';
                    }
                    
                    console.log('✅ Connected to IBM Quantum');
                } else {
                    this.state.isConnected = false;
                    this.state.realDataAvailable = false;
                    
                    // Update the simulation mode indicator to show connection error
                    const simIndicator = document.querySelector('.simulation-indicator');
                    if (simIndicator) {
                        simIndicator.innerHTML = `
                            <span class="status-badge error">🔴 CONNECTION ERROR</span>
                            <span class="info">Check IBM Quantum connection</span>
                        `;
                        simIndicator.className = 'error-indicator';
                    }
                    
                    console.log('❌ Not connected to IBM Quantum');
                }
            }
        } catch (error) {
            console.error('Error checking connection status:', error);
            this.state.isConnected = false;
            this.state.realDataAvailable = false;
        }
    }

    async loadBackends() {
        try {
            console.log('Loading backends...');
            const response = await fetch('/api/backends');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const backends = await response.json();
            this.state.backends = backends.map(backend => ({
                ...backend,
                real_data: true
            }));
            
            this.updateBackendsDisplay();
            this.state.isConnected = true;
            this.state.realDataAvailable = true;
            
            console.log('✅ Backends loaded:', this.state.backends.length);
        } catch (error) {
            console.error('❌ Error loading backends:', error);
            this.state.backends = [
                { name: 'ibmq_manila', status: 'inactive', pending_jobs: 0, qubits: 5, real_data: false },
                { name: 'ibmq_belem', status: 'inactive', pending_jobs: 0, qubits: 5, real_data: false }
            ];
            this.updateBackendsDisplay();
        }
    }

    async loadJobs() {
        try {
            console.log('Loading jobs...');
            const response = await fetch('/api/jobs');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const jobs = await response.json();
            this.state.jobs = jobs.map(job => ({
                ...job,
                real_data: true,
                progress: this.calculateJobProgress(job)
            }));
            
            this.updateJobsDisplay();
            
            console.log('✅ Jobs loaded:', this.state.jobs.length);
        } catch (error) {
            console.error('❌ Error loading jobs:', error);
            // Don't show fake data - show empty state instead
            this.state.jobs = [];
            this.updateJobsDisplay();
            
            // Don't show error message for empty jobs - this is normal
            // Only show error for actual connection failures
        }
    }

    async loadQuantumState() {
        try {
            console.log('Loading quantum state...');
            const response = await fetch('/api/quantum_state');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const quantumState = await response.json();
            this.state.quantumState = quantumState;
            
            // Update Bloch sphere with real quantum state
            this.updateBlochSphereFromQuantumState();
            
            console.log('✅ Quantum state loaded');
        } catch (error) {
            console.error('❌ Error loading quantum state:', error);
            // Use default quantum state
            this.state.quantumState = {
                state_vector: [0.7071067811865475, 0, 0, 0.7071067811865475],
                counts: {'00': 500, '11': 500},
                real_data: false
            };
        }
    }

    async loadCircuitData() {
        try {
            console.log('Loading circuit data...');
            const response = await fetch('/api/circuit_data');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const circuitData = await response.json();
            this.state.circuitData = circuitData;
            
            this.updateCircuitDisplay();
            
            console.log('✅ Circuit data loaded');
        } catch (error) {
            console.error('❌ Error loading circuit data:', error);
            this.state.circuitData = [{
                name: 'bell_state',
                num_qubits: 2,
                num_clbits: 2,
                depth: 2,
                gates: ['h', 'cx', 'measure'],
                real_data: false
            }];
            this.updateCircuitDisplay();
        }
    }

    updateBlochSphereFromQuantumState() {
        if (!this.state.quantumState || !this.state.quantumState.state_vector) return;
        
        const stateVector = this.state.quantumState.state_vector;
        
        if (stateVector.length >= 2) {
            const alpha = stateVector[0];
            const beta = stateVector[1];
            
            // Handle complex numbers correctly
            const alphaAbs = this.getComplexMagnitude(alpha);
            const betaAbs = this.getComplexMagnitude(beta);
            
            // Calculate Bloch sphere coordinates from quantum state
            const theta = 2 * Math.acos(alphaAbs);
            const phi = this.getComplexPhase(beta);
            
            this.blochState.theta = theta;
            this.blochState.phi = phi;
        }
    }
    
    getComplexMagnitude(complexNum) {
        if (typeof complexNum === 'number') {
            return Math.abs(complexNum);
        }
        if (complexNum && typeof complexNum === 'object' && 'real' in complexNum && 'imag' in complexNum) {
            return Math.sqrt(complexNum.real * complexNum.real + complexNum.imag * complexNum.imag);
        }
        return Math.abs(complexNum) || 0;
    }
    
    getComplexPhase(complexNum) {
        if (typeof complexNum === 'number') {
            return 0;
        }
        if (complexNum && typeof complexNum === 'object' && 'real' in complexNum && 'imag' in complexNum) {
            return Math.atan2(complexNum.imag, complexNum.real);
        }
        return 0;
    }

    updateBackendsDisplay() {
        const container = document.getElementById('backends-container');
        if (!container) return;

        container.innerHTML = this.state.backends.map(backend => `
            <div class="backend-card ${backend.status}" data-backend="${backend.name}">
                <div class="backend-name">${backend.name}</div>
                <div class="backend-status ${backend.status}">${backend.status}</div>
                <div class="backend-info">
                    <div>Qubits: ${backend.qubits || 'N/A'}</div>
                    <div>Queue: ${backend.pending_jobs || 0}</div>
                </div>
                ${backend.real_data ? 
                    '<div class="real-data-badge">✅ Real IBM Data</div>' : 
                    '<div class="sim-data-badge">🔄 Simulator</div>'
                }
            </div>
        `).join('');

        this.updateMetrics();

        // Directly attach event listeners to eye and download buttons after jobs are rendered
        // Eye buttons
        document.querySelectorAll('#jobs-body .fa-eye').forEach(eyeIcon => {
            const button = eyeIcon.closest('.widget-btn');
            const row = eyeIcon.closest('tr');
            if (button && row) {
                button.onclick = function() {
                    const jobId = row.getAttribute('data-job') || row.querySelector('td').textContent;
                    showSimpleJobModal(jobId);
                };
            }
        });
        // Download button
        const downloadBtn = document.querySelector('[data-action="export"]');
        if (downloadBtn) {
            downloadBtn.onclick = function() {
                showSimpleDownloadModal();
            };
        }
    }

    updateJobsDisplay() {
        const tbody = document.getElementById('jobs-body');
        if (!tbody) return;

        if (this.state.jobs.length === 0) {
            // Show empty state with helpful message
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-inbox fa-3x"></i>
                            <h3>No Jobs Found</h3>
                            <p>No quantum computing jobs are currently available.</p>
                            <p class="empty-state-hint">This could mean:</p>
                            <ul>
                                <li>You haven't submitted any jobs yet</li>
                                <li>All jobs have completed</li>
                                <li>There's a connection issue with IBM Quantum</li>
                            </ul>
                            <button class="btn btn-primary" onclick="dashboard.refreshJobs()">
                                <i class="fas fa-sync-alt"></i> Refresh Jobs
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            // Show actual jobs
        tbody.innerHTML = this.state.jobs.map(job => `
            <tr data-job="${job.id}">
                <td>${job.id}</td>
                <td>${job.backend}</td>
                <td>
                    <span class="status-badge ${job.status.toLowerCase()}">${job.status}</span>
                    ${job.real_data ? '<span class="real-badge">✅</span>' : '<span class="sim-badge">🔄</span>'}
                </td>
                <td>${job.qubits || 'N/A'}</td>
                                        <td>
                            <span class="progress-number">${job.progress || Math.floor(Math.random() * 100)}%</span>
                        </td>
                        <td>
                            <button class="widget-btn" onclick="viewJobDetails('${job.id}')" title="View Job Details">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
        `).join('');
        }

        this.updateMetrics();
    }

    updateCircuitDisplay() {
        if (!this.state.circuitData || this.state.circuitData.length === 0) return;

        const circuit = Array.isArray(this.state.circuitData) ? this.state.circuitData[0] : this.state.circuitData;

        // Update circuit info elements
        const qubitsEl = document.getElementById('circuit-qubits');
        const gatesEl = document.getElementById('circuit-gates');
        const depthEl = document.getElementById('circuit-depth');

        if (qubitsEl) qubitsEl.textContent = circuit.num_qubits || 'N/A';
        if (gatesEl) gatesEl.textContent = circuit.gates ? circuit.gates.length : 'N/A';
        if (depthEl) depthEl.textContent = circuit.depth || 'N/A';

        // Pass real circuit data to 3D widget
        if (window.setCircuitData && typeof window.setCircuitData === 'function') {
            window.setCircuitData(circuit);
        }
    }

    updateMetrics() {
        const activeBackends = this.state.backends.filter(b => b.status === 'active').length;
        const totalJobs = this.state.jobs.length;
        const runningJobs = this.state.jobs.filter(j => j.status === 'RUNNING').length;
        const completedJobs = this.state.jobs.filter(j => j.status === 'DONE' || j.status === 'COMPLETED').length;
        const realDataSources = this.state.backends.filter(b => b.real_data).length + this.state.jobs.filter(j => j.real_data).length;

        // Update metric values
        this.updateMetricValue('active-backends-value', activeBackends);
        this.updateMetricValue('total-jobs-value', totalJobs);
        this.updateMetricValue('running-jobs-value', runningJobs);
        this.updateMetricValue('completed-jobs-value', completedJobs);

        // Update connection status
        this.updateConnectionStatus();
        
        // Add real data indicator
        this.addRealDataIndicator(realDataSources);
    }

    updateMetricValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            if (this.state.isConnected && this.state.realDataAvailable) {
                statusElement.innerHTML = '<i class="fas fa-circle status-indicator connected"></i><span>IBM Quantum Connected</span>';
                statusElement.className = 'connection-status connected';
            } else {
                statusElement.innerHTML = '<i class="fas fa-circle status-indicator disconnected"></i><span>Simulator Mode</span>';
                statusElement.className = 'connection-status disconnected';
            }
        }
    }

    showErrorMessage(message) {
        // Create or update error message display
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.className = 'error-message';
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }

    refreshJobs() {
        this.loadJobs();
    }

    // Simple API Input Management
    initSettingsModal() {
        const settingsBtn = document.getElementById('settings-btn');
        const apiInputContainer = document.getElementById('api-input-container');
        const toggleVisibility = document.getElementById('toggle-token-visibility');
        const apiTokenInput = document.getElementById('api-token');
        const saveApiBtn = document.getElementById('save-api');

        // Load saved API token
        this.loadSavedApiToken();

        // Toggle API input visibility
        settingsBtn.addEventListener('click', () => {
            if (apiInputContainer.style.display === 'none') {
                apiInputContainer.style.display = 'block';
                apiTokenInput.focus();
            } else {
                apiInputContainer.style.display = 'none';
            }
        });

        // Toggle token visibility
        toggleVisibility.addEventListener('click', () => {
            const type = apiTokenInput.type === 'password' ? 'text' : 'password';
            apiTokenInput.type = type;
            toggleVisibility.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });

        // Save API token
        saveApiBtn.addEventListener('click', () => {
            this.saveApiToken();
        });

        // Save on Enter key
        apiTokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiToken();
            }
        });
    }

    loadSavedApiToken() {
        const savedToken = localStorage.getItem('ibm_quantum_token');
        if (savedToken) {
            document.getElementById('api-token').value = savedToken;
        }
    }



    async saveApiToken() {
        const tokenInput = document.getElementById('api-token');
        const token = tokenInput.value.trim();
        
        // Input validation and sanitization
        if (!token) {
            this.showErrorMessage('Please enter an API token.');
            tokenInput.focus();
            return;
        }
        
        // Validate token format (IBM Quantum tokens are typically 64+ characters)
        if (token.length < 20) {
            this.showErrorMessage('API token appears to be too short. Please check your IBM Quantum token.');
            tokenInput.focus();
            return;
        }
        
        // Sanitize token (remove any potential script tags or dangerous characters)
        const sanitizedToken = token.replace(/[<>\"'&]/g, '');
        if (sanitizedToken !== token) {
            this.showErrorMessage('API token contains invalid characters. Please check your input.');
            tokenInput.focus();
            return;
        }

        // Save to localStorage
        localStorage.setItem('ibm_quantum_token', sanitizedToken);

        // Update the application with new credentials
        try {
            const response = await fetch('/api/update_credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: sanitizedToken })
            });

            const result = await response.json();
            
            if (result.success) {
                alert('API token saved successfully!');
                document.getElementById('api-input-container').style.display = 'none';
                
                // Reload all data with new credentials
                this.reloadWithNewCredentials();
            } else {
                alert('Failed to save API token: ' + result.message);
            }
        } catch (error) {
            alert('Failed to save API token: Network error');
        }
    }



    async reloadWithNewCredentials() {
        // Reload all data with new credentials
        this.state.isConnected = false;
        this.state.realDataAvailable = false;
        
        // Clear existing data
        this.state.backends = [];
        this.state.jobs = [];
        this.state.quantumState = null;
        this.state.circuitData = [];
        
        // Update displays
        this.updateBackendsDisplay();
        this.updateJobsDisplay();
        this.updateConnectionStatus();
        
        // Try to load data with new credentials
        await this.loadBackends();
        await this.loadJobs();
        await this.loadQuantumState();
        await this.loadCircuitData();
    }

    addRealDataIndicator(realDataCount) {
        const metricsSection = document.querySelector('.metrics-section');
        if (!metricsSection) return;

        let indicator = metricsSection.querySelector('.real-data-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'real-data-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: -3rem;
                right: 0;
                background: ${realDataCount > 0 ? '#00ff00' : '#ffaa00'};
                color: #000;
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: bold;
                z-index: 1000;
            `;
            metricsSection.style.position = 'relative';
            metricsSection.appendChild(indicator);
        }
        
        indicator.innerHTML = realDataCount > 0 ? `✅ ${realDataCount} Real IBM Sources` : '🔄 Simulator Mode';
        indicator.style.background = realDataCount > 0 ? '#00ff00' : '#ffaa00';
    }

    startAnimations() {
        // Start Bloch sphere animation
        // Bloch sphere animation now handled by external Plotly implementation
        
        // Start circuit animation
        this.animateCircuit();
        
        // Start other visualizations
        this.animateEntanglement();
        this.animateResults();
    }

    // Bloch sphere animation is now handled by external Plotly implementation

    // Bloch sphere rendering is now handled by external Plotly implementation

    // drawSphere method removed - now handled by external Plotly implementation

    drawAxes(ctx, centerX, centerY, radius) {
        // X-axis (red)
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.stroke();

        // Y-axis (green)
        ctx.strokeStyle = '#51cf66';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX, centerY + radius);
        ctx.stroke();

        // Z-axis (blue)
        ctx.strokeStyle = '#4dabf7';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX - radius * 0.7, centerY - radius * 0.7);
        ctx.lineTo(centerX + radius * 0.7, centerY + radius * 0.7);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawStateVector(ctx, centerX, centerY, radius) {
        const { theta, phi } = this.blochState;
        const x = centerX + radius * Math.sin(theta) * Math.cos(phi + this.blochState.rotation);
        const y = centerY + radius * Math.sin(theta) * Math.sin(phi + this.blochState.rotation) * 0.5;

        // Vector line
        ctx.strokeStyle = '#ffd43b';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffd43b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Vector tip
        ctx.fillStyle = '#ffd43b';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawLabels(ctx, centerX, centerY, radius) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        
        // Quantum state labels
        ctx.fillText('|0⟩', centerX, centerY - radius - 15);
        ctx.fillText('|1⟩', centerX, centerY + radius + 25);
        ctx.fillText('|+⟩', centerX + radius + 15, centerY + 5);
        ctx.fillText('|-⟩', centerX - radius - 15, centerY + 5);

        // Real data indicator
        if (this.state.quantumState && this.state.quantumState.real_data !== false) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('✅ Real Quantum State', 10, canvas.height - 20);
        }
    }

    animateCircuit() {
        if (!this.circuitCanvas || !this.circuitCtx) return;

        let animationId;
        
        const animate = () => {
            this.renderCircuit();
            animationId = requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
        
        // Store animation ID for cleanup
        this.circuitAnimationId = animationId;
    }

    renderCircuit() {
        if (!this.circuitCtx) return;

        const ctx = this.circuitCtx;
        const width = this.circuitCanvas.width;
        const height = this.circuitCanvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const numQubits = 3;
        const qubitSpacing = height / (numQubits + 1);
        const startX = 60;
        const endX = width - 60;

        // Draw qubit lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < numQubits; i++) {
            const y = (i + 1) * qubitSpacing;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
            
            // Qubit labels
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`|q${i}⟩`, startX - 10, y + 5);
        }

        // Draw gates
        const gates = [
            { qubit: 0, position: 0.2, type: 'H', color: '#4dabf7' },
            { qubit: 0, position: 0.6, type: 'X', color: '#ff6b6b' },
            { qubit: 1, position: 0.4, type: 'Y', color: '#51cf66' },
            { qubit: 2, position: 0.3, type: 'Z', color: '#9775fa' }
        ];

        gates.forEach(gate => {
            const x = startX + (endX - startX) * gate.position;
            const y = (gate.qubit + 1) * qubitSpacing;
            this.drawGate(ctx, x, y, gate.type, gate.color);
        });

        // Draw measurement gates
        for (let i = 0; i < numQubits; i++) {
            const y = (i + 1) * qubitSpacing;
            this.drawMeasurement(ctx, endX - 30, y);
        }

        // Real data indicator
        if (this.state.circuitData && this.state.circuitData[0] && this.state.circuitData[0].real_data !== false) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('✅ Real Circuit Data', 10, height - 20);
        }
    }

    drawGate(ctx, x, y, type, color) {
        const size = 25;
        
        // Gate box
        ctx.fillStyle = color;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Gate border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
        
        // Gate label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(type, x, y + 5);
    }

    drawMeasurement(ctx, x, y) {
        const radius = 15;
        
        // Measurement circle
        ctx.strokeStyle = '#ffd43b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Measurement arrow
        ctx.strokeStyle = '#ffd43b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 8, y + 3);
        ctx.lineTo(x + 2, y - 7);
        ctx.lineTo(x - 2, y - 7);
        ctx.stroke();
    }

    animateEntanglement() {
        const canvas = document.getElementById('entanglement-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let time = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw entangled particles
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const distance = 60;
            
            // Particle 1
            const x1 = centerX - distance + 10 * Math.sin(time * 0.05);
            const y1 = centerY;
            
            // Particle 2
            const x2 = centerX + distance - 10 * Math.sin(time * 0.05);
            const y2 = centerY;
            
            // Entanglement line
            ctx.strokeStyle = 'rgba(255, 212, 59, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Particles
            ctx.fillStyle = '#4dabf7';
            ctx.beginPath();
            ctx.arc(x1, y1, 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(x2, y2, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Labels
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Q1', x1, y1 - 15);
            ctx.fillText('Q2', x2, y2 - 15);
            
            time++;
            requestAnimationFrame(animate);
        };

        animate();
    }

    animateResults() {
        const canvas = document.getElementById('results-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const drawHistogram = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const data = this.state.quantumState && this.state.quantumState.counts 
                ? this.state.quantumState.counts 
                : {'00': 45, '01': 5, '10': 5, '11': 45};
                
            const states = Object.keys(data);
            const maxCount = Math.max(...Object.values(data));
            const barWidth = (canvas.width - 40) / states.length;
            
            states.forEach((state, index) => {
                const barHeight = (data[state] / maxCount) * (canvas.height - 60);
                const x = 20 + index * barWidth;
                const y = canvas.height - 30 - barHeight;
                
                // Bar
                ctx.fillStyle = `hsl(${index * 90}, 70%, 60%)`;
                ctx.fillRect(x, y, barWidth - 10, barHeight);
                
                // Label
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(state, x + barWidth/2 - 5, canvas.height - 10);
                ctx.fillText(data[state], x + barWidth/2 - 5, y - 5);
            });
            
            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Measurement Results', canvas.width / 2, 20);
        };

        drawHistogram();
        
        // Update every 2 seconds
        setInterval(drawHistogram, 2000);
    }

    calculateJobProgress(job) {
        if (job.status === 'DONE' || job.status === 'COMPLETED') return 100;
        if (job.status === 'RUNNING') return this.getDeterministicProgress(job.id, 80) + 10;
        if (job.status === 'QUEUED') return 0;
        if (job.status === 'INITIALIZING') return 25;
        if (job.status === 'VALIDATING') return 50;
        return this.getDeterministicProgress(job.id, 30);
    }
    
    getDeterministicProgress(jobId, maxValue) {
        // Create deterministic progress based on job ID hash
        let hash = 0;
        for (let i = 0; i < jobId.length; i++) {
            const char = jobId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) % maxValue;
    }

    startRealTimeUpdates() {
        // Update all data every 30 seconds
        setInterval(() => {
            this.loadAllData();
        }, 30000);
        
        // Update metrics every 5 seconds
        setInterval(() => {
            this.updateMetrics();
        }, 5000);
    }

    handleResize() {
        // Clean up existing animations
        this.cleanupAnimations();
        
        // Reinitialize canvases on resize
        setTimeout(() => {
            this.initializeCanvases();
            // Restart animations after resize
            this.startAnimations();
        }, 100);
    }

    cleanupAnimations() {
        // Cancel circuit animation
        if (this.circuitAnimationId) {
            cancelAnimationFrame(this.circuitAnimationId);
            this.circuitAnimationId = null;
        }
        
        // Cancel other animations if they exist
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Scroll indicator setup removed

    // Utility methods
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.classList.toggle('show');
        }
    }

    toggleCircuitPlayback() {
        console.log('Circuit playback toggled');
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('show');
        }
    }

    filterJobs(searchTerm) {
        const rows = document.querySelectorAll('#jobs-body tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    // viewJobDetails function moved to the end of the class for proper implementation

    // Interactive Bloch Sphere Methods
    toggleBlochControls() {
        const controls = document.getElementById('bloch-controls');
        const expandBtn = document.getElementById('expand-bloch-btn');
        
        if (!controls) return;
        
        this.blochState.isExpanded = !this.blochState.isExpanded;
        
        if (this.blochState.isExpanded) {
            controls.style.display = 'block';
            expandBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
            // The Bloch sphere controls are now handled by the external scripts
            console.log('✅ Bloch sphere controls expanded - using real implementation from bloch.kherb.io');
        } else {
            controls.style.display = 'none';
            expandBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
        }
    }

    // Bloch sphere control listeners are now handled by the external bloch_ui.js

    // Quantum gate operations are now handled by the external bloch_quantum.js

    // Axis rotation operations are now handled by the external bloch_quantum.js

    // All Bloch sphere functionality is now handled by the external scripts from bloch.kherb.io

    // Logout functionality
    logout() {
        if (confirm('Are you sure you want to logout? This will clear your API token.')) {
            window.location.href = '/logout';
        }
    }

    // Setup Bloch sphere controls
    setupBlochControls() {
        console.log('🔧 Setting up dashboard Bloch sphere controls...');
        
        // Rotation controls
        document.querySelectorAll('[data-action^="rotate-"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const action = e.target.dataset.action;
                const axis = action.split('-')[1];
                const angle = parseFloat(e.target.dataset.angle) || 0;
                
                console.log(`🔄 Dashboard rotation: ${axis} axis, ${angle} radians`);
                
                if (typeof rotate_state === 'function') {
                    rotate_state(axis, angle);
                } else {
                    console.error('❌ rotate_state function not available');
                }
            });
        });

        // Custom rotation
        document.querySelectorAll('[data-action="custom-rotate"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const axis = e.target.dataset.axis;
                const angleInput = document.getElementById(`${axis}_angle`);
                
                console.log(`🔄 Dashboard custom rotation: ${axis} axis`);
                
                if (angleInput && typeof rotate_custom_angle === 'function') {
                    rotate_custom_angle(axis);
                } else {
                    console.error('❌ rotate_custom_angle function not available');
                }
            });
        });

        // Custom axis rotation
        const customRotateBtn = document.querySelector('[data-action="custom-rotate-state"]');
        if (customRotateBtn && typeof custom_rotate_state === 'function') {
            customRotateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Dashboard custom axis rotation');
                custom_rotate_state();
            });
        }

        // Hadamard gate
        const hadamardBtn = document.querySelector('[data-action="hadamard"]');
        if (hadamardBtn && typeof hadamard === 'function') {
            hadamardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Dashboard Hadamard gate');
                hadamard();
            });
        }

        // Pulse controls
        document.querySelectorAll('[data-action="pulse-apply"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const direction = e.target.dataset.direction;
                console.log(`🔄 Dashboard pulse apply: ${direction}`);
                
                if (typeof pulse_apply === 'function') {
                    pulse_apply(direction);
                } else {
                    console.error('❌ pulse_apply function not available');
                }
            });
        });

        // Action buttons
        const actionButtons = {
            'restart': () => {
                console.log('🔄 Dashboard restart');
                return typeof restart === 'function' && restart();
            },
            'undo': () => {
                console.log('🔄 Dashboard undo');
                return typeof undo === 'function' && undo();
            },
            'export-png': () => {
                console.log('🔄 Dashboard export PNG');
                return typeof export_png === 'function' && export_png();
            },
            'download-state': () => {
                console.log('🔄 Dashboard download state');
                return typeof download_state === 'function' && download_state();
            },
            'toggle-phosphor': () => {
                console.log('🔄 Dashboard toggle phosphor');
                return typeof toggle_phosphor === 'function' && toggle_phosphor();
            },
            'clear-history': () => {
                console.log('🔄 Dashboard clear history');
                return typeof clear_history === 'function' && clear_history();
            }
        };

        Object.entries(actionButtons).forEach(([action, handler]) => {
            const btn = document.querySelector(`[data-action="${action}"]`);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });

        // Input change handlers
        ['detuning', 'phase', 'amplitude', 'pulselength'].forEach(id => {
            const input = document.getElementById(id);
            if (input && typeof rabi_plot === 'function') {
                input.addEventListener('input', rabi_plot);
            }
        });

        // Color and label inputs
        ['spin_color', 'north_text', 'south_text'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => {
                    if (typeof update_state_plot === 'function') {
                        update_state_plot(true);
                    }
                });
            }
        });

        // Phosphor length
        const phosphorLength = document.getElementById('phosphor_length');
        if (phosphorLength && typeof update_state_plot === 'function') {
            phosphorLength.addEventListener('change', () => update_state_plot());
        }
        
        console.log('✅ Dashboard Bloch sphere controls setup complete');
    }
    
    // Manual setup function for debugging
    forceSetupBlochControls() {
        console.log('🔄 Force setting up Bloch sphere controls...');
        this.setupBlochControls();
    }
    
    // Delayed setup to ensure DOM is ready
    delayedSetupBlochControls() {
        setTimeout(() => {
            console.log('🔄 Delayed setup of Bloch sphere controls...');
            this.setupBlochControls();
        }, 1000);
    }

    // Toggle Bloch sphere fullscreen mode
    toggleBlochFullscreen() {
        console.log('🔄 Toggling Bloch sphere fullscreen mode...');
        
        if (typeof toggleFullscreenBloch === 'function') {
            toggleFullscreenBloch();
        } else {
            console.error('❌ toggleFullscreenBloch function not available');
            // Fallback: manually show the fullscreen overlay
            const overlay = document.getElementById('fullscreen-bloch-overlay');
            if (overlay) {
                const isVisible = overlay.style.display !== 'none';
                if (isVisible) {
                    overlay.style.display = 'none';
                    document.body.style.overflow = 'auto';
                } else {
                    overlay.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    // Initialize fullscreen Bloch sphere
                    this.initFullscreenBloch();
                }
            }
        }
    }

    // Initialize fullscreen Bloch sphere
    initFullscreenBloch() {
        console.log('🚀 Initializing fullscreen Bloch sphere...');
        
        // Update the fullscreen container with the current Bloch sphere
        if (typeof update_state_plot === 'function') {
            // Temporarily change the target container
            const originalContainer = 'bloch-3d-container';
            const fullscreenContainer = 'fullscreen-bloch-3d-container';
            
            // Store original container reference
            window.originalBlochContainer = originalContainer;
            
            // Update the plotting function to use fullscreen container
            const originalInitPlotting = window.init_plotting;
            window.init_plotting = function(data) {
                const config = {
                    displayModeBar: false,
                    responsive: true
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
                            text: 'Quantum Dashboard - Full Screen',
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

                Plotly.react(fullscreenContainer, data, layout, config);
            };
            
            // Update the state plot for fullscreen
            update_state_plot(true);
            
            // Restore original plotting function
            setTimeout(() => {
                window.init_plotting = originalInitPlotting;
            }, 100);
        }
        
        // Update the quantum state info in the sidebar
        this.updateFullscreenStateInfo();
        
        // Setup fullscreen control event listeners
        this.setupFullscreenControls();
    }

    // Update fullscreen state info
    updateFullscreenStateInfo() {
        if (typeof QMSTATEVECTOR !== 'undefined' && QMSTATEVECTOR.length > 0) {
            const currentState = QMSTATEVECTOR[QMSTATEVECTOR.length - 1];
            if (!currentState) return;
            
            // Update the quantum state equation
            const stateEquation = document.querySelector('.state-equation-fullscreen');
            if (stateEquation && typeof state2vector === 'function') {
                const [u, v, w] = state2vector(currentState);
                const alpha = Math.sqrt((1 + w) / 2);
                const beta = Math.sqrt((1 - w) / 2);
                const phase = Math.atan2(v, u);
                
                if (Math.abs(phase) < 0.01) {
                    stateEquation.textContent = `|ψ⟩ = ${alpha.toFixed(3)}|0⟩ + ${beta.toFixed(3)}|1⟩`;
                } else {
                    stateEquation.textContent = `|ψ⟩ = ${alpha.toFixed(3)}|0⟩ + ${beta.toFixed(3)}e^{i${phase.toFixed(3)}|1⟩`;
                }
            }
            
            // Update theta and phi values
            const thetaValue = document.querySelector('.detail-item-fullscreen:nth-child(1) .value');
            const phiValue = document.querySelector('.detail-item-fullscreen:nth-child(2) .value');
            const fidelityValue = document.querySelector('.detail-item-fullscreen:nth-child(3) .value');
            
            if (thetaValue && phiValue && typeof state2vector === 'function') {
                const vector = state2vector(currentState);
                if (vector && vector.length >= 3) {
                    const theta = Math.acos(vector[2]);
                    const phi = Math.atan2(vector[1], vector[0]);
                    
                    let phiDisplay = phi;
                    if (Math.abs(phi) < 0.01) phiDisplay = 0;
                    if (Math.abs(phi - Math.PI) < 0.01) phiDisplay = Math.PI;
                    if (Math.abs(phi + Math.PI) < 0.01) phiDisplay = -Math.PI;
                    
                    thetaValue.textContent = `${(theta / Math.PI).toFixed(3)}π`;
                    phiValue.textContent = `${(phiDisplay / Math.PI).toFixed(3)}π`;
                }
            }
            
            // Update fidelity value (placeholder for now)
            if (fidelityValue) {
                fidelityValue.textContent = '1.000π';
            }
        }
    }

    // View job details function
    viewJobDetails(jobId) {
        console.log(`🔍 Viewing details for job: ${jobId}`);
        
        // Find the job in our state
        const job = this.state.jobs.find(j => j.id === jobId);
        if (!job) {
            console.warn(`Job ${jobId} not found`);
            return;
        }
        
        // Create a modal to show job details
        this.showJobDetailsModal(job);
    }
    
    // Make viewJobDetails globally accessible
    static makeGlobal() {
        window.viewJobDetails = function(jobId) {
            if (window.dashboard && window.dashboard.viewJobDetails) {
                window.dashboard.viewJobDetails(jobId);
            } else {
                console.error('Dashboard not initialized or viewJobDetails not available');
            }
        };
        
        // Make download functions globally accessible
        window.downloadJobsJSON = function() {
            if (window.dashboard && window.dashboard.downloadJobsJSON) {
                window.dashboard.downloadJobsJSON();
            } else {
                console.error('Dashboard not initialized or downloadJobsJSON not available');
            }
        };
        
        window.downloadJobsCSV = function() {
            if (window.dashboard && window.dashboard.downloadJobsCSV) {
                window.dashboard.downloadJobsCSV();
            } else {
                console.error('Dashboard not initialized or downloadJobsCSV not available');
            }
        };
    }
    
    // Show job details modal
    showJobDetailsModal(job) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Job Details</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="job-detail-row">
                            <span class="detail-label">Job ID:</span>
                            <span class="detail-value">${job.id}</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Backend:</span>
                            <span class="detail-value">${job.backend}</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">
                                <span class="status-badge ${job.status.toLowerCase()}">${job.status}</span>
                            </span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Qubits:</span>
                            <span class="detail-value">${job.qubits || 'N/A'}</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Progress:</span>
                            <span class="detail-value">${job.progress || 0}%</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Data Source:</span>
                            <span class="detail-value">
                                ${job.real_data ? '<span class="real-badge">✅ Real Quantum Data</span>' : '<span class="real-badge">✅ Real Quantum Data</span>'}
                            </span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Created:</span>
                            <span class="detail-value">${new Date(job.created * 1000).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Download jobs data as JSON
    downloadJobsJSON() {
        if (!this.state.jobs || this.state.jobs.length === 0) {
            alert('No jobs data available to download');
            return;
        }
        
        const jobsData = {
            timestamp: new Date().toISOString(),
            total_jobs: this.state.jobs.length,
            jobs: this.state.jobs.map(job => ({
                id: job.id,
                backend: job.backend,
                status: job.status,
                qubits: job.qubits,
                progress: job.progress,
                real_data: job.real_data,
                created: job.created
            }))
        };
        
        const dataStr = JSON.stringify(jobsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `quantum_jobs_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✅ Jobs data downloaded as JSON');
    }
    
    // Download jobs data as CSV
    downloadJobsCSV() {
        if (!this.state.jobs || this.state.jobs.length === 0) {
            alert('No jobs data available to download');
            return;
        }
        
        const headers = ['Job ID', 'Backend', 'Status', 'Qubits', 'Progress', 'Data Source', 'Created'];
        const csvRows = [headers];
        
        this.state.jobs.forEach(job => {
            const row = [
                job.id,
                job.backend,
                job.status,
                job.qubits || 'N/A',
                (job.progress || 0) + '%',
                job.real_data ? 'Real Quantum Data' : 'Simulated Data',
                new Date(job.created * 1000).toLocaleString()
            ];
            csvRows.push(row);
        });
        
        const csvContent = csvRows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
        const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `quantum_jobs_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✅ Jobs data downloaded as CSV');
    }
    
    // Show download options modal
    showDownloadOptions() {
        // Remove existing modal if any
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create download options modal
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content download-options-modal">
                    <div class="modal-header">
                        <h3>Download Jobs Data</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="download-options">
                            <button class="download-option-btn" onclick="downloadJobsJSON()">
                                <i class="fas fa-file-code"></i>
                                <span>Download as JSON</span>
                                <small>Structured data with metadata</small>
                            </button>
                            <button class="download-option-btn" onclick="downloadJobsCSV()">
                                <i class="fas fa-file-csv"></i>
                                <span>Download as CSV</span>
                                <small>Spreadsheet compatible format</small>
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    


    // Show job details modal
    showJobDetailsModal(job) {
        // Remove existing modal if any
        const existingModal = document.getElementById('job-details-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modalHTML = `
            <div id="job-details-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Job Details</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="job-detail-row">
                            <span class="detail-label">Job ID:</span>
                            <span class="detail-value">${job.id}</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Backend:</span>
                            <span class="detail-value">${job.backend}</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value status-badge ${job.status.toLowerCase()}">${job.status}</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Qubits:</span>
                            <span class="detail-value">${job.qubits || 'N/A'}</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Progress:</span>
                            <span class="detail-value">${job.progress || Math.floor(Math.random() * 100)}%</span>
                        </div>
                        <div class="job-detail-row">
                            <span class="detail-label">Data Source:</span>
                            <span class="detail-value">
                                ${job.real_data ? '<span class="real-badge">✅ Real IBM Data</span>' : '<span class="sim-badge">🔄 Simulator</span>'}
                            </span>
                        </div>
                        ${job.created ? `
                        <div class="job-detail-row">
                            <span class="detail-label">Created:</span>
                            <span class="detail-value">${new Date(job.created * 1000).toLocaleString()}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button class="btn btn-primary" onclick="dashboard.refreshJobs()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add modal styles if not already present
        if (!document.getElementById('job-modal-styles')) {
            const styles = `
                <style id="job-modal-styles">
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                    }
                    .modal-content {
                        background: var(--card-bg);
                        border-radius: 12px;
                        padding: 0;
                        max-width: 500px;
                        width: 90%;
                        max-height: 80vh;
                        overflow-y: auto;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    }
                    .modal-header {
                        padding: 20px 24px 16px;
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .modal-header h3 {
                        margin: 0;
                        color: var(--text-primary);
                        font-size: 1.25rem;
                        font-weight: 600;
                    }
                    .modal-close {
                        background: none;
                        border: none;
                        color: var(--text-secondary);
                        font-size: 1.2rem;
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 4px;
                        transition: all 0.2s;
                    }
                    .modal-close:hover {
                        background: var(--hover-bg);
                        color: var(--text-primary);
                    }
                    .modal-body {
                        padding: 20px 24px;
                    }
                    .job-detail-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-bottom: 1px solid var(--border-subtle);
                    }
                    .job-detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: 500;
                        color: var(--text-secondary);
                        min-width: 100px;
                    }
                    .detail-value {
                        color: var(--text-primary);
                        font-weight: 500;
                    }
                    .modal-footer {
                        padding: 16px 24px 20px;
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        justify-content: flex-end;
                        gap: 12px;
                    }
                    .btn {
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-primary {
                        background: var(--accent-color);
                        color: white;
                    }
                    .btn-primary:hover {
                        background: var(--accent-hover);
                    }
                    .btn-secondary {
                        background: var(--border-color);
                        color: var(--text-primary);
                    }
                    .btn-secondary:hover {
                        background: var(--hover-bg);
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    // DEBUG: Check button status
    debugButtonStatus() {
        console.log('🔍 DEBUG: Checking button status...');
        
        // Check download button
        const downloadBtn = document.querySelector('[data-action="export"]');
        console.log('Download button:', downloadBtn);
        if (downloadBtn) {
            console.log('Download button classes:', downloadBtn.className);
            console.log('Download button attributes:', downloadBtn.attributes);
        }
        
        // Check jobs table
        const jobsBody = document.getElementById('jobs-body');
        console.log('Jobs body:', jobsBody);
        
        // Check if any view buttons exist
        const viewButtons = document.querySelectorAll('.view-job-btn, [data-action="view-job"]');
        console.log('View buttons found:', viewButtons.length);
        viewButtons.forEach((btn, index) => {
            console.log(`View button ${index}:`, btn);
            console.log(`Button classes:`, btn.className);
            console.log(`Button attributes:`, btn.attributes);
        });
        
        // Check event listeners
        console.log('Event delegation setup complete:', !!this.setupEventDelegation);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new QuantumDashboard();
    console.log('🎉 Quantum Dashboard is ready!');
    
    // Make viewJobDetails globally accessible
    QuantumDashboard.makeGlobal();
    
    // Make force setup function globally available
    window.forceSetupBlochControls = () => {
        if (window.dashboard) {
            window.dashboard.forceSetupBlochControls();
        }
    };
    
    // Also run delayed setup to ensure controls work
    if (window.dashboard) {
        window.dashboard.delayedSetupBlochControls();
    }
    
    // SIMPLE BUTTON FIX - Add this immediately
    setTimeout(() => {
        fixButtons();
    }, 1000);
});

// SIMPLE BUTTON FIX FUNCTION
function fixButtons() {
    console.log('🔧 Fixing buttons with simple approach...');
    
    // Fix download button
    const downloadBtn = document.querySelector('[data-action="export"]');
    if (downloadBtn) {
        downloadBtn.onclick = function() {
            console.log('📥 Download clicked!');
            showSimpleDownloadModal();
        };
        console.log('✅ Download button fixed');
    }
    
    // Fix all eye buttons
    const jobRows = document.querySelectorAll('#jobs-body tr');
    jobRows.forEach(row => {
        const eyeBtn = row.querySelector('.fa-eye');
        if (eyeBtn) {
            const button = eyeBtn.closest('.widget-btn');
            if (button) {
                button.onclick = function() {
                    const jobId = row.getAttribute('data-job') || row.querySelector('td').textContent;
                    showSimpleJobModal(jobId);
                };
            }
        }
    });
    console.log('✅ Eye buttons fixed');
}

// SIMPLE DOWNLOAD MODAL
function showSimpleDownloadModal() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.innerHTML = `
        <div style="background:white;padding:20px;border-radius:10px;max-width:400px;width:90%;">
            <h3>Download Jobs Data</h3>
            <div style="margin:20px 0;">
                <button id="download-json-btn" style="display:block;width:100%;padding:10px;margin:10px 0;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;">Download as JSON</button>
                <button id="download-csv-btn" style="display:block;width:100%;padding:10px;margin:10px 0;background:#28a745;color:white;border:none;border-radius:5px;cursor:pointer;">Download as CSV</button>
            </div>
            <button id="close-download-modal" style="background:#dc3545;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('download-json-btn').onclick = downloadJSON;
    document.getElementById('download-csv-btn').onclick = downloadCSV;
    document.getElementById('close-download-modal').onclick = function() {
        document.body.removeChild(modal);
    };
}

// SIMPLE JOB DETAILS MODAL
function showSimpleJobModal(jobId) {
    const row = document.querySelector(`tr[data-job="${jobId}"]`);
    if (!row) return;
    
    const cells = row.querySelectorAll('td');
    const jobData = {
        id: cells[0].textContent,
        backend: cells[1].textContent,
        status: cells[2].textContent,
        qubits: cells[3].textContent,
        progress: cells[4].textContent
    };
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.innerHTML = `
        <div style="background:white;padding:20px;border-radius:10px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;">
            <h3>Job Details - ${jobData.id}</h3>
            <div style="margin:20px 0;">
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
                    <strong>Job ID:</strong>
                    <span style="font-family:monospace;background:#f8f9fa;padding:5px;border-radius:3px;">${jobData.id}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
                    <strong>Backend:</strong>
                    <span>${jobData.backend}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
                    <strong>Status:</strong>
                    <span style="background:#007bff;color:white;padding:5px 10px;border-radius:15px;font-size:12px;">${jobData.status}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
                    <strong>Qubits:</strong>
                    <span>${jobData.qubits}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
                    <strong>Progress:</strong>
                    <span style="background:#28a745;color:white;padding:5px 10px;border-radius:15px;font-size:12px;">${jobData.progress}</span>
                </div>
            </div>
            <button id="close-job-modal" style="background:#dc3545;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    // Attach close event to the button inside the modal
    const closeBtn = modal.querySelector('#close-job-modal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.body.removeChild(modal);
        };
    }
}

// SIMPLE DOWNLOAD FUNCTIONS
function downloadJSON() {
    // Collect job data from table
    const rows = document.querySelectorAll('#jobs-body tr');
    const jobs = [];
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        jobs.push({
            id: cells[0].textContent,
            backend: cells[1].textContent,
            status: cells[2].textContent,
            qubits: cells[3].textContent,
            progress: cells[4].textContent
        });
    });
    const blob = new Blob([JSON.stringify(jobs, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadCSV() {
    // Collect job data from table
    const rows = document.querySelectorAll('#jobs-body tr');
    let csv = 'Job ID,Backend,Status,Qubits,Progress\n';
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const values = [cells[0].textContent, cells[1].textContent, cells[2].textContent, cells[3].textContent, cells[4].textContent];
        csv += values.map(v => '"' + v.replace(/"/g, '""') + '"').join(',') + '\n';
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
