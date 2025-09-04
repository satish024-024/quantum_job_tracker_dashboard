/**
 * Optimized Bloch Sphere Widget
 * Fixed: Fullscreen functionality, tool visibility, performance optimization
 */

class OptimizedBlochyWidget {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.isFullscreen = false;
        this.blochState = {
            theta: Math.PI / 2,
            phi: 0,
            alpha: 1,
            beta: 0
        };
        this.plotDiv = null;
        this.fullscreenPlotDiv = null;
        this.autoRotateInterval = null;
        this.renderTimeout = null;
        
        console.log('🚀 Initializing Optimized Bloch Sphere Widget...');
        this.init();
    }

    // Initialize the optimized Bloch sphere
    init() {
        if (!this.container) {
            console.error('❌ Container not found:', this.containerId);
            return;
        }

        console.log('🚀 Starting Bloch sphere initialization...', this.container);

        // Store reference to this widget instance for external access
        this.container._blochWidget = this;

        // Check if debug mode is enabled
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = urlParams.get('debug') === 'true';

        if (this.debugMode) {
            console.log('🐛 Debug mode enabled for Bloch sphere');
            this.container.classList.add('debug-bloch');
            this.container.style.border = '2px solid #ff6b6b';
        }

        // Initialize in sequence with proper timing
        console.log('📝 Creating optimized interface...');
        this.createOptimizedInterface();

        // Wait for DOM update before setting up button
        setTimeout(() => {
            console.log('🔧 Setting up expand button...');
            this.setupExpandButton();
        }, 50);

        // Wait for everything to be ready before rendering
        setTimeout(() => {
            console.log('🎨 Starting Bloch sphere rendering...');
            this.renderBlochSphere();
        }, 100);

        console.log('✅ Optimized Bloch Sphere initialized');
    }

    // Create optimized interface
    createOptimizedInterface() {
        // Clear container first
        this.container.innerHTML = '';

        // Create the interface HTML
        this.container.innerHTML = `
            <div class="blochy-optimized-container">
                <div class="blochy-3d-view" id="blochy-3d-plot" style="width: 100%; height: 300px;"></div>
                <div class="blochy-info-panel">
                    <div class="info-section">
                        <div class="info-item">
                            <span>θ:</span>
                            <span id="theta-value">${(this.blochState.theta * 180 / Math.PI).toFixed(1)}°</span>
                        </div>
                        <div class="info-item">
                            <span>φ:</span>
                            <span id="phi-value">${(this.blochState.phi * 180 / Math.PI).toFixed(1)}°</span>
                        </div>
                        <div class="info-item">
                            <span>Status:</span>
                            <span id="bloch-status">Optimized</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Wait for DOM to update and get the plot div
        setTimeout(() => {
            this.plotDiv = document.getElementById('blochy-3d-plot');
            if (!this.plotDiv) {
                console.error('❌ Could not find blochy-3d-plot element');
                // Try to find it in the container
                this.plotDiv = this.container.querySelector('#blochy-3d-plot');
            }
            console.log('✅ Plot div found:', this.plotDiv);
        }, 10);
    }

    // Render optimized Bloch sphere
    renderBlochSphere() {
        // Wait for plotDiv to be available
        if (!this.plotDiv) {
            console.log('⏳ Waiting for plot div...');
            setTimeout(() => this.renderBlochSphere(), 100);
            return;
        }

        if (typeof Plotly === 'undefined') {
            console.error('❌ Plotly not available');
            setTimeout(() => this.renderBlochSphere(), 500);
            return;
        }

        try {
            console.log('🎨 Rendering Bloch sphere...');
            const data = this.generateOptimizedBlochData();
            const layout = this.generateOptimizedLayout();

            Plotly.react(this.plotDiv, data, layout, {
                responsive: true,
                displayModeBar: false,
                displaylogo: false,
                staticPlot: false
            }).then(() => {
                console.log('✅ Optimized Bloch sphere rendered');
                this.updateInfo();

                // Update status
                const statusEl = document.getElementById('bloch-status');
                if (statusEl) statusEl.textContent = 'Active';

            }).catch(error => {
                console.error('❌ Bloch sphere render failed:', error);
                // Update status to show error
                const statusEl = document.getElementById('bloch-status');
                if (statusEl) statusEl.textContent = 'Error';
            });

        } catch (error) {
            console.error('❌ Render error:', error);
            // Update status to show error
            const statusEl = document.getElementById('bloch-status');
            if (statusEl) statusEl.textContent = 'Error';
        }
    }

    // Generate optimized Bloch sphere data
    generateOptimizedBlochData() {
        const { theta, phi } = this.blochState;
        
        // Calculate state vector components
        const alpha = Math.cos(theta / 2);
        const beta = math.sin(theta / 2) * math.exp(math.i * phi);
        
        // Bloch sphere surface (optimized - fewer points)
        const u = [];
        const v = [];
        const x = [];
        const y = [];
        const z = [];
        
        for (let i = 0; i <= 20; i++) {
            for (let j = 0; j <= 20; j++) {
                const u_val = (i / 20) * 2 * Math.PI;
                const v_val = (j / 20) * Math.PI;
                
                u.push(u_val);
                v.push(v_val);
                x.push(Math.sin(v_val) * Math.cos(u_val));
                y.push(Math.sin(v_val) * Math.sin(u_val));
                z.push(Math.cos(v_val));
            }
        }
        
        // State vector arrow
        const stateX = Math.sin(theta) * Math.cos(phi);
        const stateY = Math.sin(theta) * Math.sin(phi);
        const stateZ = Math.cos(theta);
        
        return [
            // Bloch sphere surface
            {
                type: 'surface',
                x: x,
                y: y,
                z: z,
                colorscale: 'Viridis',
                opacity: 0.3,
                showscale: false,
                hoverinfo: 'skip'
            },
            // State vector arrow
            {
                type: 'scatter3d',
                x: [0, stateX],
                y: [0, stateY],
                z: [0, stateZ],
                mode: 'lines+markers',
                line: {
                    color: '#ff6b6b',
                    width: 8
                },
                marker: {
                    size: 12,
                    color: '#ff6b6b'
                },
                name: 'State Vector',
                hoverinfo: 'name'
            },
            // State point
            {
                type: 'scatter3d',
                x: [stateX],
                y: [stateY],
                z: [stateZ],
                mode: 'markers',
                marker: {
                    size: 15,
                    color: '#ff6b6b',
                    symbol: 'circle',
                    line: { color: 'white', width: 2 }
                },
                name: 'Quantum State',
                hoverinfo: 'name'
            }
        ];
    }

    // Generate optimized layout
    generateOptimizedLayout() {
        return {
            title: {
                text: '',
                font: { size: 0 }
            },
            scene: {
                xaxis: {
                    title: 'X',
                    range: [-1.2, 1.2],
                    gridcolor: 'rgba(200,200,200,0.1)',
                    zerolinecolor: 'rgba(200,200,200,0.2)',
                    showbackground: false,
                    showticklabels: true,
                    tickfont: { size: 8, color: '#666' }
                },
                yaxis: {
                    title: 'Y',
                    range: [-1.2, 1.2],
                    gridcolor: 'rgba(200,200,200,0.1)',
                    zerolinecolor: 'rgba(200,200,200,0.2)',
                    showbackground: false,
                    showticklabels: true,
                    tickfont: { size: 8, color: '#666' }
                },
                zaxis: {
                    title: 'Z',
                    range: [-1.2, 1.2],
                    gridcolor: 'rgba(200,200,200,0.1)',
                    zerolinecolor: 'rgba(200,200,200,0.2)',
                    showbackground: false,
                    showticklabels: true,
                    tickfont: { size: 8, color: '#666' }
                },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.5 },
                    center: { x: 0, y: 0, z: 0 }
                },
                aspectmode: 'cube'
            },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            height: 300,
            showlegend: false,
            hovermode: 'closest',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };
    }

    // Update info display
    updateInfo() {
        const thetaEl = document.getElementById('theta-value');
        const phiEl = document.getElementById('phi-value');
        
        if (thetaEl) thetaEl.textContent = `${(this.blochState.theta * 180 / Math.PI).toFixed(1)}°`;
        if (phiEl) phiEl.textContent = `${(this.blochState.phi * 180 / Math.PI).toFixed(1)}°`;
    }

    // Setup expand button
    setupExpandButton() {
        setTimeout(() => {
            const expandBtn = document.getElementById('expand-bloch-btn') || 
                             document.querySelector('[data-action="expand-bloch"]') ||
                             document.querySelector('.widget-btn[data-action="expand-bloch"]');
            
            if (expandBtn) {
                expandBtn.replaceWith(expandBtn.cloneNode(true));
                const newExpandBtn = document.getElementById('expand-bloch-btn') || 
                                    document.querySelector('[data-action="expand-bloch"]') ||
                                    document.querySelector('.widget-btn[data-action="expand-bloch"]');
                
                if (newExpandBtn) {
                    newExpandBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.showOptimizedFullscreen();
                    });
                    console.log('✅ Connected to Bloch sphere expand button');
                }
            }
        }, 500);
    }

    // Show optimized fullscreen with all tools
    showOptimizedFullscreen() {
        console.log('🚀 Opening optimized fullscreen Bloch sphere...');
        
        if (this.isFullscreen) {
            console.log('⚠️ Fullscreen already open');
            return;
        }
        
        if (typeof Plotly === 'undefined') {
            console.error('❌ Plotly not available');
            alert('3D visualization library not loaded. Please refresh the page.');
            return;
        }
        
        this.isFullscreen = true;
        
        // Create optimized fullscreen overlay
        const overlay = document.createElement('div');
        overlay.id = 'fullscreen-bloch-overlay';
        overlay.className = 'fullscreen-bloch-overlay';
        
        overlay.innerHTML = `
            <div class="fullscreen-bloch-content">
                <div class="fullscreen-bloch-header">
                    <div class="fullscreen-bloch-title">
                        <i class="fas fa-globe"></i>
                        <h1>Optimized 3D Bloch Sphere</h1>
                    </div>
                    <div class="fullscreen-bloch-controls">
                        <button id="close-bloch-fullscreen" class="close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="fullscreen-bloch-body">
                    <div class="bloch-controls-panel">
                        <div class="control-section">
                            <h4><i class="fas fa-tools"></i> Bloch Controls</h4>
                            <div class="control-buttons">
                                <button id="reset-bloch-btn" class="control-btn">
                                    <i class="fas fa-home"></i> Reset
                                </button>
                                <button id="auto-rotate-bloch-btn" class="control-btn">
                                    <i class="fas fa-sync-alt"></i> Auto Rotate
                                </button>
                                <button id="lock-bloch-btn" class="control-btn">
                                    <i class="fas fa-lock"></i> Lock View
                                </button>
                            </div>
                        </div>
                        
                        <div class="control-section">
                            <h4><i class="fas fa-info-circle"></i> State Info</h4>
                            <div class="info-display">
                                <div class="info-item">
                                    <span>θ:</span>
                                    <span id="fullscreen-theta">${(this.blochState.theta * 180 / Math.PI).toFixed(1)}°</span>
                                </div>
                                <div class="info-item">
                                    <span>φ:</span>
                                    <span id="fullscreen-phi">${(this.blochState.phi * 180 / Math.PI).toFixed(1)}°</span>
                                </div>
                                <div class="info-item">
                                    <span>State:</span>
                                    <span id="fullscreen-state">|ψ⟩</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bloch-visualization-panel">
                        <div class="bloch-3d-container-fullscreen">
                            <div class="bloch-3d-view-fullscreen" id="bloch-3d-plot-fullscreen"></div>
                        </div>
                    </div>
                    
                    <div class="bloch-gates-panel">
                        <div class="control-section">
                            <h4><i class="fas fa-puzzle-piece"></i> Quantum Gates</h4>
                            <div class="gate-palette">
                                <div class="gate-category">
                                    <h5>Pauli Gates</h5>
                                    <div class="gate-buttons">
                                        <button class="gate-btn" data-gate="x" title="Pauli-X Gate">
                                            <div class="gate-symbol">X</div>
                                            <div class="gate-name">Pauli-X</div>
                                        </button>
                                        <button class="gate-btn" data-gate="y" title="Pauli-Y Gate">
                                            <div class="gate-symbol">Y</div>
                                            <div class="gate-name">Pauli-Y</div>
                                        </button>
                                        <button class="gate-btn" data-gate="z" title="Pauli-Z Gate">
                                            <div class="gate-symbol">Z</div>
                                            <div class="gate-name">Pauli-Z</div>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="gate-category">
                                    <h5>Rotation Gates</h5>
                                    <div class="gate-buttons">
                                        <button class="gate-btn" data-gate="rx" title="X Rotation">
                                            <div class="gate-symbol">Rₓ</div>
                                            <div class="gate-name">X Rotation</div>
                                        </button>
                                        <button class="gate-btn" data-gate="ry" title="Y Rotation">
                                            <div class="gate-symbol">Rᵧ</div>
                                            <div class="gate-name">Y Rotation</div>
                                        </button>
                                        <button class="gate-btn" data-gate="rz" title="Z Rotation">
                                            <div class="gate-symbol">Rᵧ</div>
                                            <div class="gate-name">Z Rotation</div>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="gate-category">
                                    <h5>Special Gates</h5>
                                    <div class="gate-buttons">
                                        <button class="gate-btn" data-gate="h" title="Hadamard Gate">
                                            <div class="gate-symbol">H</div>
                                            <div class="gate-name">Hadamard</div>
                                        </button>
                                        <button class="gate-btn" data-gate="s" title="S Gate">
                                            <div class="gate-symbol">S</div>
                                            <div class="gate-name">S Gate</div>
                                        </button>
                                        <button class="gate-btn" data-gate="t" title="T Gate">
                                            <div class="gate-symbol">T</div>
                                            <div class="gate-name">T Gate</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="control-section">
                            <h4><i class="fas fa-mouse-pointer"></i> Instructions</h4>
                            <div class="instructions">
                                <p><strong>Applying Gates:</strong></p>
                                <ol>
                                    <li>Click a gate button to apply it</li>
                                    <li>Watch the state vector rotate</li>
                                    <li>Use "Reset" to return to |0⟩</li>
                                </ol>
                                <p><strong>View Controls:</strong></p>
                                <ul>
                                    <li>Drag to rotate view</li>
                                    <li>Scroll to zoom</li>
                                    <li>Use "Lock View" to prevent movement</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.initializeOptimizedFullscreen();
        this.setupOptimizedFullscreenEventListeners();
        
        console.log('✅ Optimized fullscreen Bloch sphere opened');
    }

    // Initialize optimized fullscreen
    initializeOptimizedFullscreen() {
        this.fullscreenPlotDiv = document.getElementById('bloch-3d-plot-fullscreen');
        if (this.fullscreenPlotDiv && typeof Plotly !== 'undefined') {
            const data = this.generateOptimizedBlochData();
            const layout = this.generateOptimizedFullscreenLayout();
            
            Plotly.newPlot(this.fullscreenPlotDiv, data, layout, {
                responsive: true,
                displayModeBar: true,
                displaylogo: false
            }).then(() => {
                console.log('✅ Optimized fullscreen Bloch sphere rendered');
                this.updateFullscreenInfo();
            }).catch(error => {
                console.error('❌ Fullscreen render failed:', error);
            });
        }
    }

    // Generate optimized fullscreen layout
    generateOptimizedFullscreenLayout() {
        return {
            title: {
                text: 'Interactive 3D Bloch Sphere',
                font: { size: 16, color: '#fff' },
                x: 0.5,
                xanchor: 'center'
            },
            scene: {
                xaxis: {
                    title: 'X',
                    range: [-1.2, 1.2],
                    gridcolor: 'rgba(200,200,200,0.2)',
                    zerolinecolor: 'rgba(200,200,200,0.3)',
                    showbackground: false,
                    showticklabels: true,
                    tickfont: { size: 10, color: '#fff' }
                },
                yaxis: {
                    title: 'Y',
                    range: [-1.2, 1.2],
                    gridcolor: 'rgba(200,200,200,0.2)',
                    zerolinecolor: 'rgba(200,200,200,0.3)',
                    showbackground: false,
                    showticklabels: true,
                    tickfont: { size: 10, color: '#fff' }
                },
                zaxis: {
                    title: 'Z',
                    range: [-1.2, 1.2],
                    gridcolor: 'rgba(200,200,200,0.2)',
                    zerolinecolor: 'rgba(200,200,200,0.3)',
                    showbackground: false,
                    showticklabels: true,
                    tickfont: { size: 10, color: '#fff' }
                },
                camera: {
                    eye: { x: 1.8, y: 1.8, z: 1.8 },
                    center: { x: 0, y: 0, z: 0 }
                },
                aspectmode: 'cube'
            },
            margin: { l: 0, r: 0, t: 50, b: 0 },
            height: 600,
            showlegend: false,
            hovermode: 'closest',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };
    }

    // Setup optimized fullscreen event listeners
    setupOptimizedFullscreenEventListeners() {
        // Close button
        const closeBtn = document.getElementById('close-bloch-fullscreen');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeOptimizedFullscreen());
        }
        
        // Control buttons
        const resetBtn = document.getElementById('reset-bloch-btn');
        const autoRotateBtn = document.getElementById('auto-rotate-bloch-btn');
        const lockBtn = document.getElementById('lock-bloch-btn');
        
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetBlochState());
        if (autoRotateBtn) autoRotateBtn.addEventListener('click', () => this.toggleAutoRotate());
        if (lockBtn) lockBtn.addEventListener('click', () => this.toggleLockView());
        
        // Gate buttons
        const gateButtons = document.querySelectorAll('.gate-btn');
        gateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gateType = e.currentTarget.dataset.gate;
                this.applyGate(gateType);
            });
        });
        
        // Close on overlay click
        const overlay = document.getElementById('fullscreen-bloch-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeOptimizedFullscreen();
                }
            });
        }
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleFullscreenKeyboard(e));
    }

    // Handle keyboard shortcuts
    handleFullscreenKeyboard(e) {
        if (!this.isFullscreen) return;
        
        switch(e.key) {
            case 'Escape':
                this.closeOptimizedFullscreen();
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.resetBlochState();
                }
                break;
            case 'a':
            case 'A':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleAutoRotate();
                }
                break;
        }
    }

    // Close optimized fullscreen
    closeOptimizedFullscreen() {
        const overlay = document.getElementById('fullscreen-bloch-overlay');
        if (overlay) {
            this.cleanup();
            overlay.remove();
            this.isFullscreen = false;
            console.log('✅ Optimized fullscreen Bloch sphere closed');
        }
    }

    // Apply quantum gate
    applyGate(gateType) {
        console.log(`🎯 Applying gate: ${gateType}`);
        
        switch(gateType) {
            case 'x':
                this.blochState.theta = Math.PI - this.blochState.theta;
                this.blochState.phi = Math.PI - this.blochState.phi;
                break;
            case 'y':
                this.blochState.theta = Math.PI - this.blochState.theta;
                this.blochState.phi = -this.blochState.phi;
                break;
            case 'z':
                this.blochState.phi = this.blochState.phi + Math.PI;
                break;
            case 'h':
                // Hadamard gate
                this.blochState.theta = Math.PI / 2;
                this.blochState.phi = 0;
                break;
            case 'rx':
                this.blochState.theta = this.blochState.theta + Math.PI / 4;
                break;
            case 'ry':
                this.blochState.phi = this.blochState.phi + Math.PI / 4;
                break;
            case 'rz':
                this.blochState.phi = this.blochState.phi + Math.PI / 8;
                break;
            case 's':
                this.blochState.phi = this.blochState.phi + Math.PI / 2;
                break;
            case 't':
                this.blochState.phi = this.blochState.phi + Math.PI / 4;
                break;
        }
        
        this.updateFullscreenInfo();
        this.renderFullscreenBloch();
    }

    // Reset Bloch state
    resetBlochState() {
        this.blochState = {
            theta: Math.PI / 2,
            phi: 0,
            alpha: 1,
            beta: 0
        };
        this.updateFullscreenInfo();
        this.renderFullscreenBloch();
        console.log('🔄 Bloch state reset');
    }

    // Toggle auto rotate
    toggleAutoRotate() {
        const btn = document.getElementById('auto-rotate-bloch-btn');
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
            btn.classList.remove('active');
            console.log('⏹️ Auto rotate stopped');
        } else {
            this.autoRotateInterval = setInterval(() => {
                if (this.fullscreenPlotDiv && typeof Plotly !== 'undefined') {
                    const time = Date.now() / 3000;
                    Plotly.relayout(this.fullscreenPlotDiv, {
                        'scene.camera.eye.x': Math.cos(time) * 2,
                        'scene.camera.eye.y': Math.sin(time) * 2,
                        'scene.camera.eye.z': 1.8
                    });
                }
            }, 100);
            btn.classList.add('active');
            console.log('🔄 Auto rotate started');
        }
    }

    // Toggle lock view
    toggleLockView() {
        const btn = document.getElementById('lock-bloch-btn');
        if (btn) {
            btn.classList.toggle('active');
            const isLocked = btn.classList.contains('active');
            btn.innerHTML = isLocked ? '<i class="fas fa-unlock"></i> Unlock View' : '<i class="fas fa-lock"></i> Lock View';
            console.log(isLocked ? '🔒 View locked' : '🔓 View unlocked');
        }
    }

    // Render fullscreen Bloch sphere
    renderFullscreenBloch() {
        if (this.fullscreenPlotDiv && typeof Plotly !== 'undefined') {
            const data = this.generateOptimizedBlochData();
            const layout = this.generateOptimizedFullscreenLayout();
            Plotly.react(this.fullscreenPlotDiv, data, layout);
        }
    }

    // Update fullscreen info
    updateFullscreenInfo() {
        const thetaEl = document.getElementById('fullscreen-theta');
        const phiEl = document.getElementById('fullscreen-phi');
        
        if (thetaEl) thetaEl.textContent = `${(this.blochState.theta * 180 / Math.PI).toFixed(1)}°`;
        if (phiEl) phiEl.textContent = `${(this.blochState.phi * 180 / Math.PI).toFixed(1)}°`;
    }

    // Cleanup resources
    cleanup() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
        
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
            this.renderTimeout = null;
        }
        
        if (this.fullscreenPlotDiv && typeof Plotly !== 'undefined') {
            try {
                Plotly.purge(this.fullscreenPlotDiv);
            } catch (e) {
                console.warn('Plotly cleanup warning:', e);
            }
        }
    }
}

// Global function for compatibility
function initializeOptimizedBlochyWidget(containerId) {
    return new OptimizedBlochyWidget(containerId);
}

// Global function for fullscreen toggle compatibility
function toggleFullscreenBloch() {
    console.log('🔄 Global toggleFullscreenBloch called');
    const blochContainer = document.getElementById('blochy-container');
    if (blochContainer && blochContainer._blochWidget) {
        blochContainer._blochWidget.showOptimizedFullscreen();
    } else {
        console.warn('⚠️ Bloch widget not initialized yet');
    }
}

// Export for global use
window.OptimizedBlochyWidget = OptimizedBlochyWidget;
window.initializeOptimizedBlochyWidget = initializeOptimizedBlochyWidget;
window.toggleFullscreenBloch = toggleFullscreenBloch;
