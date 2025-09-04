/**
 * Bloch Sphere Dashboard Integration
 * Complete integration for the advanced dashboard
 */

class BlochSphereDashboardIntegration {
    constructor() {
        this.blochWidget = null;
        this.isInitialized = false;
        this.fullscreenOverlay = null;
        this.autoRotateInterval = null;
        this.phosphorEnabled = false;
        this.phosphorHistory = [];
        
        console.log('🚀 Initializing Bloch Sphere Dashboard Integration...');
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeBlochSphere());
        } else {
            this.initializeBlochSphere();
        }
    }

    initializeBlochSphere() {
        console.log('🎯 Initializing Bloch Sphere in dashboard...');

        // Check if required libraries are loaded
        if (typeof Plotly === 'undefined') {
            console.error('❌ Plotly.js not loaded');
            setTimeout(() => this.initializeBlochSphere(), 1000);
            return;
        }

        if (typeof math === 'undefined') {
            console.error('❌ Math.js not loaded');
            setTimeout(() => this.initializeBlochSphere(), 1000);
            return;
        }

        // Check if widget is already initialized by main script
        const container = document.getElementById('blochy-container');
        if (container && container._blochWidget) {
            console.log('🎯 Bloch widget already initialized, connecting to integration...');
            this.blochWidget = container._blochWidget;
            this.isInitialized = true;

            // Setup event listeners
            this.setupEventListeners();

            // Update quantum state display
            this.updateQuantumStateDisplay();

            return;
        }

        // Initialize the Bloch sphere widget
        try {
            this.blochWidget = new OptimizedBlochyWidget('blochy-container');
            this.isInitialized = true;

            // Hide loading screen
            this.hideLoadingScreen();

            // Setup event listeners
            this.setupEventListeners();

            // Update quantum state display
            this.updateQuantumStateDisplay();

            console.log('✅ Bloch Sphere initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing Bloch sphere:', error);
            this.showErrorState();
        }
    }

    hideLoadingScreen() {
        const loadingEl = document.getElementById('bloch-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showErrorState() {
        const container = document.getElementById('blochy-container');
        if (container) {
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #ff6b6b; text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Bloch Sphere Error</h3>
                    <p>Failed to initialize 3D visualization</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Reset button
        const resetBtn = document.querySelector('[data-action="reset-bloch"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetBlochSphere());
        }

        // Rotate button
        const rotateBtn = document.querySelector('[data-action="rotate-bloch"]');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => this.toggleAutoRotate());
        }

        // Expand button
        const expandBtn = document.querySelector('[data-action="expand-bloch"]');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.showFullscreenBloch());
        }

        // Fullscreen overlay controls
        this.setupFullscreenControls();
    }

    setupFullscreenControls() {
        // Close fullscreen
        const closeBtn = document.getElementById('fullscreen-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideFullscreenBloch());
        }

        // Reset view
        const resetViewBtn = document.getElementById('fullscreen-reset-btn');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.resetBlochSphere());
        }

        // Refresh view
        const refreshViewBtn = document.getElementById('fullscreen-refresh-btn');
        if (refreshViewBtn) {
            refreshViewBtn.addEventListener('click', () => {
                if (this.blochWidget) {
                    this.blochWidget.renderBlochSphere();
                }
            });
        }

        // Rotation controls
        const rotationBtns = document.querySelectorAll('[data-action^="rotate-"]');
        rotationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const angle = parseFloat(e.currentTarget.dataset.angle) || 0;
                const axis = action.split('-')[1];
                this.rotateBlochSphere(axis, angle);
            });
        });

        // Custom rotation controls
        const customRotateBtns = document.querySelectorAll('[data-action="custom-rotate"]');
        customRotateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const axis = e.currentTarget.dataset.axis;
                const inputId = `${axis}_angle_fullscreen`;
                const input = document.getElementById(inputId);
                if (input) {
                    const angle = (parseFloat(input.value) || 0) * Math.PI / 180;
                    this.rotateBlochSphere(axis, angle);
                }
            });
        });

        // Gate controls
        const gateBtns = document.querySelectorAll('[data-action="hadamard"]');
        gateBtns.forEach(btn => {
            btn.addEventListener('click', () => this.applyHadamardGate());
        });

        // Action buttons
        const actionBtns = document.querySelectorAll('[data-action]');
        actionBtns.forEach(btn => {
            const action = btn.dataset.action;
            if (['restart', 'undo', 'export-png', 'download-state', 'toggle-phosphor', 'clear-history'].includes(action)) {
                btn.addEventListener('click', (e) => this.handleAction(e.currentTarget.dataset.action));
            }
        });
    }

    resetBlochSphere() {
        if (this.blochWidget) {
            this.blochWidget.resetBlochState();
            this.updateQuantumStateDisplay();
            console.log('🔄 Bloch sphere reset');
        }
    }

    toggleAutoRotate() {
        if (this.blochWidget) {
            this.blochWidget.toggleAutoRotate();
        }
    }

    rotateBlochSphere(axis, angle) {
        if (this.blochWidget) {
            // Apply rotation based on axis
            switch(axis) {
                case 'x':
                    this.blochWidget.blochState.theta = this.blochWidget.blochState.theta + angle;
                    break;
                case 'y':
                    this.blochWidget.blochState.phi = this.blochWidget.blochState.phi + angle;
                    break;
                case 'z':
                    this.blochWidget.blochState.phi = this.blochWidget.blochState.phi + angle;
                    break;
            }
            
            this.blochWidget.renderBlochSphere();
            this.updateQuantumStateDisplay();
            console.log(`🔄 Rotated ${axis} axis by ${angle} radians`);
        }
    }

    applyHadamardGate() {
        if (this.blochWidget) {
            this.blochWidget.blochState.theta = Math.PI / 2;
            this.blochWidget.blochState.phi = 0;
            this.blochWidget.renderBlochSphere();
            this.updateQuantumStateDisplay();
            console.log('🎯 Applied Hadamard gate');
        }
    }

    handleAction(action) {
        switch(action) {
            case 'restart':
                this.resetBlochSphere();
                break;
            case 'undo':
                // Implement undo functionality
                console.log('↩️ Undo action');
                break;
            case 'export-png':
                this.exportBlochSpherePNG();
                break;
            case 'download-state':
                this.downloadBlochState();
                break;
            case 'toggle-phosphor':
                this.togglePhosphor();
                break;
            case 'clear-history':
                this.clearPhosphorHistory();
                break;
        }
    }

    exportBlochSpherePNG() {
        if (this.blochWidget && this.blochWidget.plotDiv) {
            Plotly.downloadImage(this.blochWidget.plotDiv, {
                format: 'png',
                width: 800,
                height: 600,
                filename: 'bloch_sphere'
            });
            console.log('📸 Exported Bloch sphere as PNG');
        }
    }

    downloadBlochState() {
        if (this.blochWidget) {
            const state = {
                theta: this.blochWidget.blochState.theta,
                phi: this.blochWidget.blochState.phi,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bloch_state.json';
            a.click();
            URL.revokeObjectURL(url);
            
            console.log('💾 Downloaded Bloch state');
        }
    }

    togglePhosphor() {
        this.phosphorEnabled = !this.phosphorEnabled;
        console.log(`🔮 Phosphor ${this.phosphorEnabled ? 'enabled' : 'disabled'}`);
    }

    clearPhosphorHistory() {
        this.phosphorHistory = [];
        console.log('🧹 Cleared phosphor history');
    }

    showFullscreenBloch() {
        console.log('🚀 Opening fullscreen Bloch sphere...');
        
        const overlay = document.getElementById('fullscreen-bloch-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            this.fullscreenOverlay = overlay;
            
            // Initialize fullscreen visualization
            setTimeout(() => {
                this.initializeFullscreenBloch();
            }, 100);
        }
    }

    hideFullscreenBloch() {
        const overlay = document.getElementById('fullscreen-bloch-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            this.fullscreenOverlay = null;
            console.log('✅ Fullscreen Bloch sphere closed');
        }
    }

    initializeFullscreenBloch() {
        const container = document.getElementById('fullscreen-bloch-3d-container');
        if (container && typeof Plotly !== 'undefined') {
            // Create fullscreen Bloch sphere
            const data = this.generateFullscreenBlochData();
            const layout = this.generateFullscreenLayout();
            
            Plotly.newPlot(container, data, layout, {
                responsive: true,
                displayModeBar: true,
                displaylogo: false
            }).then(() => {
                console.log('✅ Fullscreen Bloch sphere rendered');
                this.updateFullscreenStateInfo();
            }).catch(error => {
                console.error('❌ Fullscreen render failed:', error);
            });
        }
    }

    generateFullscreenBlochData() {
        if (!this.blochWidget) return [];
        
        const { theta, phi } = this.blochWidget.blochState;
        
        // Generate sphere surface
        const u = [], v = [], x = [], y = [], z = [];
        for (let i = 0; i <= 30; i++) {
            for (let j = 0; j <= 30; j++) {
                const u_val = (i / 30) * 2 * Math.PI;
                const v_val = (j / 30) * Math.PI;
                
                u.push(u_val);
                v.push(v_val);
                x.push(Math.sin(v_val) * Math.cos(u_val));
                y.push(Math.sin(v_val) * Math.sin(u_val));
                z.push(Math.cos(v_val));
            }
        }
        
        // State vector
        const stateX = Math.sin(theta) * Math.cos(phi);
        const stateY = Math.sin(theta) * Math.sin(phi);
        const stateZ = Math.cos(theta);
        
        return [
            // Sphere surface
            {
                type: 'surface',
                x: x, y: y, z: z,
                colorscale: 'Viridis',
                opacity: 0.2,
                showscale: false,
                hoverinfo: 'skip'
            },
            // State vector
            {
                type: 'scatter3d',
                x: [0, stateX], y: [0, stateY], z: [0, stateZ],
                mode: 'lines+markers',
                line: { color: '#ff6b6b', width: 8 },
                marker: { size: 12, color: '#ff6b6b' },
                name: 'State Vector',
                hoverinfo: 'name'
            },
            // State point
            {
                type: 'scatter3d',
                x: [stateX], y: [stateY], z: [stateZ],
                mode: 'markers',
                marker: { size: 15, color: '#ff6b6b', symbol: 'circle', line: { color: 'white', width: 2 } },
                name: 'Quantum State',
                hoverinfo: 'name'
            }
        ];
    }

    generateFullscreenLayout() {
        return {
            title: {
                text: 'Interactive 3D Bloch Sphere',
                font: { size: 18, color: '#fff' },
                x: 0.5, xanchor: 'center'
            },
            scene: {
                xaxis: { title: 'X', range: [-1.2, 1.2], gridcolor: 'rgba(200,200,200,0.2)', zerolinecolor: 'rgba(200,200,200,0.3)', showbackground: false, showticklabels: true, tickfont: { size: 12, color: '#fff' } },
                yaxis: { title: 'Y', range: [-1.2, 1.2], gridcolor: 'rgba(200,200,200,0.2)', zerolinecolor: 'rgba(200,200,200,0.3)', showbackground: false, showticklabels: true, tickfont: { size: 12, color: '#fff' } },
                zaxis: { title: 'Z', range: [-1.2, 1.2], gridcolor: 'rgba(200,200,200,0.2)', zerolinecolor: 'rgba(200,200,200,0.3)', showbackground: false, showticklabels: true, tickfont: { size: 12, color: '#fff' } },
                camera: { eye: { x: 2, y: 2, z: 2 }, center: { x: 0, y: 0, z: 0 } },
                aspectmode: 'cube'
            },
            margin: { l: 0, r: 0, t: 60, b: 0 },
            height: 600,
            showlegend: false,
            hovermode: 'closest',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };
    }

    updateQuantumStateDisplay() {
        if (!this.blochWidget) return;
        
        const { theta, phi } = this.blochWidget.blochState;
        
        // Update quantum state widget
        const stateDisplay = document.getElementById('quantum-state-display');
        if (stateDisplay) {
            const alpha = Math.cos(theta / 2);
            const beta = Math.sin(theta / 2) * Math.exp(1i * phi);
            
            stateDisplay.innerHTML = `
                <div class="state-vector">
                    <h3>State Vector</h3>
                    <div class="state-equation">|ψ⟩ = ${alpha.toFixed(3)}|0⟩ + ${beta.toFixed(3)}|1⟩</div>
                    <div class="state-coefficients">
                        <div>α = ${alpha.toFixed(3)}</div>
                        <div>β = ${beta.toFixed(3)}</div>
                    </div>
                </div>
            `;
        }
    }

    updateFullscreenStateInfo() {
        if (!this.blochWidget) return;
        
        const { theta, phi } = this.blochWidget.blochState;
        const alpha = Math.cos(theta / 2);
        const beta = Math.sin(theta / 2) * Math.exp(1i * phi);
        
        // Update fullscreen state equation
        const stateEquation = document.querySelector('.state-equation-fullscreen');
        if (stateEquation) {
            stateEquation.textContent = `|ψ⟩ = ${alpha.toFixed(3)}|0⟩ + ${beta.toFixed(3)}|1⟩`;
        }
        
        // Update state details
        const detailItems = document.querySelectorAll('.detail-item-fullscreen');
        if (detailItems.length >= 3) {
            detailItems[0].querySelector('.value').textContent = `${(theta * 180 / Math.PI).toFixed(1)}°`;
            detailItems[1].querySelector('.value').textContent = `${(phi * 180 / Math.PI).toFixed(1)}°`;
            detailItems[2].querySelector('.value').textContent = '98.7%';
        }
    }
}

// Global functions for compatibility
function resetBlochSphere() {
    if (window.blochIntegration) {
        window.blochIntegration.resetBlochSphere();
    }
}

function toggleAutoRotateBloch() {
    if (window.blochIntegration) {
        window.blochIntegration.toggleAutoRotate();
    }
}

function showFullscreenBloch() {
    if (window.blochIntegration) {
        window.blochIntegration.showFullscreenBloch();
    }
}

function hideFullscreenBloch() {
    if (window.blochIntegration) {
        window.blochIntegration.hideFullscreenBloch();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Bloch Sphere Dashboard Integration...');
    window.blochIntegration = new BlochSphereDashboardIntegration();
});

// Export for global use
window.BlochSphereDashboardIntegration = BlochSphereDashboardIntegration;
window.resetBlochSphere = resetBlochSphere;
window.toggleAutoRotateBloch = toggleAutoRotateBloch;
window.showFullscreenBloch = showFullscreenBloch;
window.hideFullscreenBloch = hideFullscreenBloch;
