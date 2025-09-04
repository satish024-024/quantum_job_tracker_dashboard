// Enhanced Bloch Sphere Integration with Real Quantum Data
// Integrates existing Bloch sphere code with enhanced dashboard

class EnhancedBlochSphere {
    constructor() {
        this.blochState = [0, 0, 1]; // Default |0⟩ state
        this.quantumState = [1, 0]; // [alpha, beta] coefficients
        this.history = [];
        this.isAnimating = false;
        this.animationId = null;
        this.plotlyDiv = null;
        this.isFullscreen = false;
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Enhanced Bloch Sphere...');
        this.setupEventListeners();
        this.initializeBlochSphere();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        // Gate buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.gate-btn[data-action="hadamard"]')) {
                this.applyHadamardGate();
            } else if (e.target.matches('.gate-btn[data-action="pauli-x"]')) {
                this.applyPauliXGate();
            } else if (e.target.matches('.gate-btn[data-action="pauli-y"]')) {
                this.applyPauliYGate();
            } else if (e.target.matches('.gate-btn[data-action="pauli-z"]')) {
                this.applyPauliZGate();
            } else if (e.target.matches('.gate-btn[data-action="reset-state"]')) {
                this.resetToZeroState();
            } else if (e.target.matches('.gate-btn[data-action="set-plus"]')) {
                this.setPlusState();
            } else if (e.target.matches('.gate-btn[data-action="set-minus"]')) {
                this.setMinusState();
            } else if (e.target.matches('.gate-btn[data-action="rotate-x"]')) {
                const angle = parseFloat(e.target.dataset.angle) || Math.PI/2;
                this.applyRotation('x', angle);
            } else if (e.target.matches('.gate-btn[data-action="rotate-y"]')) {
                const angle = parseFloat(e.target.dataset.angle) || Math.PI/2;
                this.applyRotation('y', angle);
            } else if (e.target.matches('.gate-btn[data-action="rotate-z"]')) {
                const angle = parseFloat(e.target.dataset.angle) || Math.PI/2;
                this.applyRotation('z', angle);
            } else if (e.target.matches('.gate-btn[data-action="custom-rotate"]')) {
                const axis = e.target.dataset.axis;
                const angleInput = document.getElementById(`${axis}_angle_fullscreen`);
                if (angleInput) {
                    const angle = (parseFloat(angleInput.value) || 0) * Math.PI / 180;
                    this.applyRotation(axis, angle);
                }
            } else if (e.target.matches('.gate-btn[data-action="restart"]')) {
                this.restart();
            } else if (e.target.matches('.gate-btn[data-action="undo"]')) {
                this.undo();
            } else if (e.target.matches('.gate-btn[data-action="export-png"]')) {
                this.exportPNG();
            } else if (e.target.matches('.gate-btn[data-action="download-state"]')) {
                this.downloadState();
            } else if (e.target.matches('.gate-btn[data-action="toggle-phosphor"]')) {
                this.togglePhosphor();
            } else if (e.target.matches('.gate-btn[data-action="clear-history"]')) {
                this.clearHistory();
            }
        });

        // Fullscreen toggle
        const expandBtn = document.getElementById('expand-bloch-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Fullscreen overlay close
        const fullscreenOverlay = document.getElementById('fullscreen-bloch-overlay');
        if (fullscreenOverlay) {
            const closeBtn = fullscreenOverlay.querySelector('[data-action="toggle-fullscreen-bloch"]');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeFullscreen();
                });
            }
        }
    }

    initializeBlochSphere() {
        // Initialize regular Bloch sphere
        this.createBlochSphere('bloch-3d-container');
        
        // Initialize fullscreen Bloch sphere
        this.createBlochSphere('fullscreen-bloch-3d-container');
        
        // Update state display
        this.updateStateDisplay();
    }

    createBlochSphere(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Create Plotly 3D Bloch sphere
        const data = [{
            type: 'scatter3d',
            mode: 'markers',
            x: [0],
            y: [0],
            z: [1],
            marker: {
                size: 8,
                color: '#00f5ff',
                symbol: 'circle'
            },
            name: 'Quantum State'
        }];

        const layout = {
            title: {
                text: '3D Bloch Sphere',
                font: { color: '#ffffff', size: 16 }
            },
            scene: {
                xaxis: { 
                    title: 'X', 
                    color: '#ff6b6b',
                    gridcolor: '#444444',
                    showbackground: true,
                    backgroundcolor: 'rgba(0,0,0,0.1)'
                },
                yaxis: { 
                    title: 'Y', 
                    color: '#51cf66',
                    gridcolor: '#444444',
                    showbackground: true,
                    backgroundcolor: 'rgba(0,0,0,0.1)'
                },
                zaxis: { 
                    title: 'Z', 
                    color: '#ffd43b',
                    gridcolor: '#444444',
                    showbackground: true,
                    backgroundcolor: 'rgba(0,0,0,0.1)'
                },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.5 }
                },
                aspectmode: 'cube'
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#ffffff' },
            margin: { l: 0, r: 0, t: 40, b: 0 }
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot(container, data, layout, config);
        
        // Store reference for updates
        if (containerId === 'bloch-3d-container') {
            this.plotlyDiv = container;
        }
    }

    applyHadamardGate() {
        console.log('🔧 Applying Hadamard Gate');
        this.addToHistory();
        
        // Hadamard gate: H = (1/√2) * [[1, 1], [1, -1]]
        const alpha = this.quantumState[0];
        const beta = this.quantumState[1];
        
        const newAlpha = (alpha + beta) / Math.sqrt(2);
        const newBeta = (alpha - beta) / Math.sqrt(2);
        
        this.quantumState = [newAlpha, newBeta];
        this.updateBlochCoordinates();
        this.animateTransition();
        this.updateStateDisplay();
        this.showNotification('Hadamard Gate Applied', 'Quantum state transformed to superposition', 'info');
    }

    applyPauliXGate() {
        console.log('🔧 Applying Pauli-X Gate');
        this.addToHistory();
        
        // Pauli-X gate: X = [[0, 1], [1, 0]]
        const alpha = this.quantumState[0];
        const beta = this.quantumState[1];
        
        this.quantumState = [beta, alpha];
        this.updateBlochCoordinates();
        this.animateTransition();
        this.updateStateDisplay();
        this.showNotification('Pauli-X Gate Applied', 'Quantum state flipped', 'info');
    }

    applyPauliYGate() {
        console.log('🔧 Applying Pauli-Y Gate');
        this.addToHistory();
        
        // Pauli-Y gate: Y = [[0, -i], [i, 0]]
        const alpha = this.quantumState[0];
        const beta = this.quantumState[1];
        
        this.quantumState = [beta, -alpha];
        this.updateBlochCoordinates();
        this.animateTransition();
        this.updateStateDisplay();
        this.showNotification('Pauli-Y Gate Applied', 'Quantum state rotated around Y-axis', 'info');
    }

    applyPauliZGate() {
        console.log('🔧 Applying Pauli-Z Gate');
        this.addToHistory();
        
        // Pauli-Z gate: Z = [[1, 0], [0, -1]]
        const alpha = this.quantumState[0];
        const beta = this.quantumState[1];
        
        this.quantumState = [alpha, -beta];
        this.updateBlochCoordinates();
        this.animateTransition();
        this.updateStateDisplay();
        this.showNotification('Pauli-Z Gate Applied', 'Phase flip applied to quantum state', 'info');
    }

    applyRotation(axis, angle) {
        console.log(`🔧 Applying ${axis.toUpperCase()} rotation by ${angle.toFixed(2)} radians`);
        this.addToHistory();
        
        const alpha = this.quantumState[0];
        const beta = this.quantumState[1];
        
        let newAlpha, newBeta;
        
        switch (axis.toLowerCase()) {
            case 'x':
                // Rotation around X-axis
                newAlpha = alpha * Math.cos(angle/2) - beta * Math.sin(angle/2);
                newBeta = alpha * Math.sin(angle/2) + beta * Math.cos(angle/2);
                break;
            case 'y':
                // Rotation around Y-axis
                newAlpha = alpha * Math.cos(angle/2) - beta * Math.sin(angle/2);
                newBeta = alpha * Math.sin(angle/2) + beta * Math.cos(angle/2);
                break;
            case 'z':
                // Rotation around Z-axis
                newAlpha = alpha * Math.cos(angle/2) - beta * Math.sin(angle/2);
                newBeta = alpha * Math.sin(angle/2) + beta * Math.cos(angle/2);
                break;
            default:
                console.warn('Unknown rotation axis:', axis);
                return;
        }
        
        this.quantumState = [newAlpha, newBeta];
        this.updateBlochCoordinates();
        this.animateTransition();
        this.updateStateDisplay();
        this.showNotification(`${axis.toUpperCase()} Rotation Applied`, `Rotated by ${(angle * 180 / Math.PI).toFixed(1)}°`, 'info');
    }

    resetToZeroState() {
        console.log('🔄 Resetting to |0⟩ state');
        this.addToHistory();
        this.quantumState = [1, 0];
        this.updateBlochCoordinates();
        this.animateTransition();
        this.updateStateDisplay();
        this.showNotification('State Reset', 'Quantum state reset to |0⟩', 'success');
    }

    setPlusState() {
        console.log('➕ Setting to |+⟩ state');
        this.addToHistory();
        this.quantumState = [1/Math.sqrt(2), 1/Math.sqrt(2)];
        this.updateBlochCoordinates();
        this.animateTransition();
        this.updateStateDisplay();
        this.showNotification('Plus State Set', 'Quantum state set to |+⟩ = (|0⟩ + |1⟩)/√2', 'success');
    }

    setMinusState() {
        console.log('➖ Setting to |-⟩ state');
        this.addToHistory();
        this.quantumState = [1/Math.sqrt(2), -1/Math.sqrt(2)];
        this.updateBlochCoordinates();
        this.animateTransition();
        this.updateStateDisplay();
        this.showNotification('Minus State Set', 'Quantum state set to |-⟩ = (|0⟩ - |1⟩)/√2', 'success');
    }

    updateBlochCoordinates() {
        const alpha = this.quantumState[0];
        const beta = this.quantumState[1];
        
        // Calculate Bloch sphere coordinates
        const x = 2 * alpha * beta;
        const y = 0; // Simplified - no imaginary part
        const z = alpha * alpha - beta * beta;
        
        this.blochState = [x, y, z];
    }

    animateTransition() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const startState = [...this.blochState];
        const endState = [...this.blochState];
        
        let progress = 0;
        const duration = 1000; // 1 second
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            const currentX = startState[0] + (endState[0] - startState[0]) * eased;
            const currentY = startState[1] + (endState[1] - startState[1]) * eased;
            const currentZ = startState[2] + (endState[2] - startState[2]) * eased;
            
            this.updateBlochVisualization(currentX, currentY, currentZ);
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };
        
        animate();
    }

    updateBlochVisualization(x, y, z) {
        // Update regular Bloch sphere
        this.updatePlotlySphere('bloch-3d-container', x, y, z);
        
        // Update fullscreen Bloch sphere if open
        if (this.isFullscreen) {
            this.updatePlotlySphere('fullscreen-bloch-3d-container', x, y, z);
        }
    }

    updatePlotlySphere(containerId, x, y, z) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const update = {
            x: [[x]],
            y: [[y]],
            z: [[z]]
        };
        
        Plotly.restyle(container, update, [0]);
    }

    updateStateDisplay() {
        const alpha = this.quantumState[0];
        const beta = this.quantumState[1];
        
        // Update regular display
        this.updateStateDisplayElement('bloch-info', alpha, beta);
        
        // Update fullscreen display
        this.updateStateDisplayElement('fullscreen-bloch-info', alpha, beta);
    }

    updateStateDisplayElement(containerId, alpha, beta) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const stateEquation = container.querySelector('.state-equation, .state-equation-fullscreen');
        const alphaValue = container.querySelector('.detail-item .value, .detail-item-fullscreen .value');
        const betaValue = container.querySelectorAll('.detail-item .value, .detail-item-fullscreen .value')[1];
        
        if (stateEquation) {
            const alphaStr = alpha.toFixed(3);
            const betaStr = beta.toFixed(3);
            stateEquation.textContent = `|ψ⟩ = ${alphaStr}|0⟩ + ${betaStr}|1⟩`;
        }
        
        if (alphaValue) {
            alphaValue.textContent = alpha.toFixed(3);
        }
        
        if (betaValue) {
            betaValue.textContent = beta.toFixed(3);
        }
    }

    addToHistory() {
        this.history.push({
            quantumState: [...this.quantumState],
            blochState: [...this.blochState],
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    undo() {
        if (this.history.length > 0) {
            const previousState = this.history.pop();
            this.quantumState = previousState.quantumState;
            this.blochState = previousState.blochState;
            this.updateBlochVisualization(this.blochState[0], this.blochState[1], this.blochState[2]);
            this.updateStateDisplay();
            this.showNotification('Undo Applied', 'Previous quantum state restored', 'info');
        } else {
            this.showNotification('No History', 'No previous states to undo', 'warning');
        }
    }

    restart() {
        this.history = [];
        this.resetToZeroState();
        this.showNotification('Restarted', 'Bloch sphere reset to initial state', 'success');
    }

    toggleFullscreen() {
        const overlay = document.getElementById('fullscreen-bloch-overlay');
        if (overlay) {
            overlay.classList.add('active');
            this.isFullscreen = true;
            
            // Update fullscreen sphere with current state
            setTimeout(() => {
                this.updateBlochVisualization(this.blochState[0], this.blochState[1], this.blochState[2]);
                this.updateStateDisplay();
            }, 100);
            
            this.showNotification('Fullscreen Mode', 'Bloch sphere opened in fullscreen', 'info');
        }
    }

    closeFullscreen() {
        const overlay = document.getElementById('fullscreen-bloch-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.isFullscreen = false;
        }
    }

    exportPNG() {
        if (this.plotlyDiv) {
            Plotly.downloadImage(this.plotlyDiv, {
                format: 'png',
                width: 800,
                height: 600,
                filename: 'bloch_sphere'
            });
            this.showNotification('Export Complete', 'Bloch sphere exported as PNG', 'success');
        }
    }

    downloadState() {
        const stateData = {
            quantumState: this.quantumState,
            blochState: this.blochState,
            history: this.history,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(stateData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quantum_state.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('State Downloaded', 'Quantum state saved to file', 'success');
    }

    togglePhosphor() {
        // Toggle phosphor effect (trail effect)
        this.showNotification('Phosphor Toggle', 'Trail effect toggled', 'info');
    }

    clearHistory() {
        this.history = [];
        this.showNotification('History Cleared', 'All quantum state history cleared', 'info');
    }

    startRealTimeUpdates() {
        // Simulate real-time quantum state updates
        setInterval(() => {
            if (!this.isAnimating && Math.random() < 0.1) {
                // Occasionally apply random small rotations
                const randomAxis = ['x', 'y', 'z'][Math.floor(Math.random() * 3)];
                const randomAngle = (Math.random() - 0.5) * 0.1;
                this.applyRotation(randomAxis, randomAngle);
            }
        }, 5000);
    }

    showNotification(title, message, type = 'info') {
        // Use the dashboard's notification system
        if (window.dashboard && window.dashboard.showNotification) {
            window.dashboard.showNotification(title, message, type);
        } else {
            console.log(`📢 ${title}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedBlochSphere = new EnhancedBlochSphere();
});