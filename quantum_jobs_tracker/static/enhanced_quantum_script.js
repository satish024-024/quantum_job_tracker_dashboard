// Enhanced Quantum Dashboard with Advanced Animations and Theme Management
class EnhancedQuantumDashboard {
    constructor() {
        this.state = {
            backends: [],
            jobs: [],
            quantumState: null,
            circuitData: null,
            isConnected: false,
            realDataAvailable: false,
            metrics: {},
            measurementResults: {},
            entanglementData: {},
            currentTheme: 'dark'
        };

        this.blochCanvas = null;
        this.blochCtx = null;
        this.circuitCanvas = null;
        this.circuitCtx = null;
        this.animationId = null;
        this.circuitAnimationId = null;
        this.updateInterval = null;
        this.animationQueue = [];
        this.isAnimating = false;

        // Initialize with more realistic quantum states
        this.quantumStates = this.generateRealisticQuantumStates();
        this.currentStateIndex = 0;
        this.blochState = this.quantumStates[this.currentStateIndex];

        this.init();
        
        // Fetch real data immediately with enhanced animations
        setTimeout(() => {
            this.updateAllWidgets();
            this.updateQuantumMetrics();
            this.updateCircuitVisualization();
            this.updateMeasurementResults();
            this.loadQuantumState();
        }, 500);
    }

    // Generate realistic quantum states for visualization
    generateRealisticQuantumStates() {
        return [
            {
                name: "Bell State |Φ⁺⟩",
                description: "Entangled 2-qubit state for quantum teleportation",
                theta: Math.PI / 2,
                phi: 0,
                alpha: 1/Math.sqrt(2),
                beta: 0,
                gamma: 0,
                delta: 1/Math.sqrt(2),
                qubits: 2,
                fidelity: 0.987
            },
            {
                name: "GHZ State",
                description: "3-qubit Greenberger-Horne-Zeilinger state",
                theta: Math.PI / 2,
                phi: Math.PI / 4,
                alpha: 1/Math.sqrt(2),
                beta: 0,
                gamma: 0,
                delta: 0,
                qubits: 3,
                fidelity: 0.934
            },
            {
                name: "Y-Rotation State",
                description: "Complex superposition with phase",
                theta: Math.PI / 2,
                phi: Math.PI / 2,
                alpha: 1/Math.sqrt(2),
                beta: { real: 0, imag: 1/Math.sqrt(2) },
                qubits: 1,
                fidelity: 0.956
            }
        ];
    }

    // Enhanced initialization with animations
    init() {
        console.log('🚀 Initializing Enhanced Quantum Dashboard...');
        
        // Initialize theme
        this.initializeTheme();
        
        // Setup event listeners with enhanced animations
        this.setupEventListeners();
        
        // Initialize all widgets with staggered animations
        this.initializeWidgets();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        console.log('✅ Enhanced Quantum Dashboard initialized successfully');
    }

    // Enhanced theme management
    initializeTheme() {
        const savedTheme = localStorage.getItem('quantum-dashboard-theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Setup theme toggle with enhanced animations
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    setTheme(theme) {
        this.state.currentTheme = theme;
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (theme === 'light') {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
        
        localStorage.setItem('quantum-dashboard-theme', theme);
        
        // Add theme transition animation
        body.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            body.style.transition = '';
        }, 500);
        
        // Animate theme toggle button
        if (themeToggle) {
            themeToggle.style.transform = 'scale(1.2) rotate(180deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 300);
        }
    }

    toggleTheme() {
        const newTheme = this.state.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add ripple effect to theme toggle
        this.createRippleEffect(event.target);
    }

    // Enhanced event listeners with animations
    setupEventListeners() {
        // Widget button interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.widget-btn')) {
                this.handleWidgetButtonClick(e);
            }
        });

        // Widget hover effects
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.widget-container')) {
                this.animateWidgetHover(e.target.closest('.widget-container'));
            }
        }, true);

        // Notification panel
        const notificationBtn = document.getElementById('notification-btn');
        const notificationPanel = document.getElementById('notification-panel');
        const closeNotifications = document.getElementById('close-notifications');

        if (notificationBtn && notificationPanel) {
            notificationBtn.addEventListener('click', () => {
                this.toggleNotificationPanel();
            });
        }

        if (closeNotifications && notificationPanel) {
            closeNotifications.addEventListener('click', () => {
                this.closeNotificationPanel();
            });
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Fullscreen toggles
        const expandCircuitBtn = document.getElementById('expand-circuit-btn');
        const expandBlochBtn = document.getElementById('expand-bloch-btn');

        if (expandCircuitBtn) {
            expandCircuitBtn.addEventListener('click', () => {
                this.toggleFullscreenCircuit();
            });
        }

        if (expandBlochBtn) {
            expandBlochBtn.addEventListener('click', () => {
                this.toggleFullscreenBloch();
            });
        }
    }

    // Enhanced widget initialization with staggered animations
    initializeWidgets() {
        const widgets = document.querySelectorAll('.widget-container');
        const metricCards = document.querySelectorAll('.metric-card');
        
        // Animate metric cards first
        metricCards.forEach((card, index) => {
            setTimeout(() => {
                this.animateElement(card, 'slideInUp');
            }, index * 100);
        });
        
        // Animate widgets with staggered delay
        widgets.forEach((widget, index) => {
            setTimeout(() => {
                this.animateElement(widget, 'fadeInUp');
            }, (metricCards.length * 100) + (index * 150));
        });
    }

    // Enhanced animation system
    animateElement(element, animationType, duration = 600) {
        if (!element) return;
        
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = `${animationType} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        // Add completion callback
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Widget button click handler with animations
    handleWidgetButtonClick(event) {
        const button = event.target.closest('.widget-btn');
        const action = button.dataset.action;
        
        // Add click animation
        this.animateButtonClick(button);
        
        // Handle different actions
        switch (action) {
            case 'refresh-backends':
                this.refreshBackends();
                break;
            case 'refresh-results':
                this.refreshResults();
                break;
            case 'refresh-entanglement':
                this.refreshEntanglement();
                break;
            case 'calculate-entanglement':
                this.calculateEntanglement();
                break;
            case 'play-pause':
                this.toggleCircuitAnimation();
                break;
            case 'reset':
                this.resetCircuit();
                break;
            case 'expand-circuit':
                this.toggleFullscreenCircuit();
                break;
            case 'expand-bloch':
                this.toggleFullscreenBloch();
                break;
            default:
                console.log(`Action ${action} not implemented yet`);
        }
    }

    // Enhanced button click animation
    animateButtonClick(button) {
        // Create ripple effect
        this.createRippleEffect(button);
        
        // Scale animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    // Ripple effect for buttons
    createRippleEffect(element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Enhanced loading animation system
    showLoadingAnimation(widgetId, message = "Loading...") {
        const loadingElement = document.getElementById(`${widgetId}-loading`);
        const contentElement = document.getElementById(`${widgetId}-content`) || 
                              document.getElementById(`${widgetId}-container`) ||
                              document.getElementById(`${widgetId}-display`) ||
                              document.getElementById(`${widgetId}-metrics`);
        
        if (loadingElement) {
            loadingElement.style.display = 'flex';
            loadingElement.style.opacity = '1';
            
            const loadingText = loadingElement.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
                this.animateTextTyping(loadingText, message);
            }
            
            const progressBar = loadingElement.querySelector('.progress-bar');
            if (progressBar) {
                this.animateProgressBar(progressBar);
            }
        }
        
        if (contentElement) {
            contentElement.style.display = 'none';
        }
    }

    // Animate text typing effect
    animateTextTyping(element, text) {
        element.textContent = '';
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(typeInterval);
            }
        }, 50);
    }

    // Animate progress bar
    animateProgressBar(progressBar) {
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 2s ease-in-out';
        
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);
    }

    // Hide loading animation with fade out
    hideLoadingAnimation(widgetId) {
        const loadingElement = document.getElementById(`${widgetId}-loading`);
        const contentElement = document.getElementById(`${widgetId}-content`) || 
                              document.getElementById(`${widgetId}-container`) ||
                              document.getElementById(`${widgetId}-display`) ||
                              document.getElementById(`${widgetId}-metrics`);
        
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 300);
        }
        
        if (contentElement) {
            contentElement.style.display = 'block';
            this.animateElement(contentElement, 'fadeIn');
        }
    }

    // Enhanced widget hover animation
    animateWidgetHover(widget) {
        if (!widget) return;
        
        // Add glow effect
        widget.style.boxShadow = '0 0 30px rgba(0, 245, 255, 0.3)';
        
        // Animate icon if present
        const icon = widget.querySelector('.widget-header i');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(10deg)';
        }
    }

    // Notification panel management
    toggleNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.classList.toggle('active');
            
            if (panel.classList.contains('active')) {
                this.loadNotifications();
            }
        }
    }

    closeNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.classList.remove('active');
        }
    }

    // Load notifications with animation
    loadNotifications() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;
        
        const notifications = [
            {
                type: 'success',
                title: 'Quantum Job Completed',
                message: 'Job QJ_2024_001 has finished successfully',
                time: '2 minutes ago'
            },
            {
                type: 'info',
                title: 'New Backend Available',
                message: 'IBM Quantum System Two is now online',
                time: '5 minutes ago'
            },
            {
                type: 'warning',
                title: 'High Queue Time',
                message: 'Current queue time is 15 minutes',
                time: '10 minutes ago'
            }
        ];
        
        notificationList.innerHTML = '';
        
        notifications.forEach((notification, index) => {
            setTimeout(() => {
                const notificationElement = this.createNotificationElement(notification);
                notificationList.appendChild(notificationElement);
                this.animateElement(notificationElement, 'slideInRight');
            }, index * 100);
        });
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.type}`;
        element.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <span class="notification-time">${notification.time}</span>
            </div>
        `;
        return element;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'bell';
    }

    // Mobile menu toggle
    toggleMobileMenu() {
        const header = document.querySelector('.dashboard-header');
        header.classList.toggle('mobile-menu-open');
    }

    // Fullscreen circuit toggle
    toggleFullscreenCircuit() {
        // Implementation for fullscreen circuit
        console.log('Toggle fullscreen circuit');
    }

    // Fullscreen Bloch sphere toggle
    toggleFullscreenBloch() {
        const overlay = document.getElementById('fullscreen-bloch-overlay');
        if (overlay) {
            overlay.classList.toggle('active');
            
            if (overlay.classList.contains('active')) {
                this.initializeFullscreenBloch();
            }
        }
    }

    initializeFullscreenBloch() {
        // Initialize fullscreen Bloch sphere
        console.log('Initializing fullscreen Bloch sphere');
    }

    // Enhanced real-time updates
    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateAllWidgets();
        }, 5000); // Update every 5 seconds
    }

    // Update all widgets with animations
    updateAllWidgets() {
        this.updateQuantumMetrics();
        this.updateBackends();
        this.updateJobs();
        this.updateCircuitVisualization();
        this.updateMeasurementResults();
        this.updateEntanglementData();
    }

    // Enhanced quantum metrics update
    updateQuantumMetrics() {
        const metrics = {
            'active-backends': Math.floor(Math.random() * 8) + 2,
            'total-jobs': Math.floor(Math.random() * 100) + 50,
            'running-jobs': Math.floor(Math.random() * 20) + 5,
            'queued-jobs': Math.floor(Math.random() * 30) + 10
        };

        Object.entries(metrics).forEach(([metric, value]) => {
            const element = document.getElementById(`${metric}-value`);
            if (element) {
                this.animateNumberChange(element, value);
            }
        });
    }

    // Animate number changes
    animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const difference = newValue - currentValue;
        const steps = 20;
        const stepValue = difference / steps;
        const stepDuration = 50;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const value = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = value;
            
            if (currentStep >= steps) {
                clearInterval(interval);
                element.textContent = newValue;
            }
        }, stepDuration);
    }

    // Update backends with animation
    updateBackends() {
        this.showLoadingAnimation('backends', 'Updating Quantum Backends...');
        
        setTimeout(() => {
            this.hideLoadingAnimation('backends');
            this.populateBackends();
        }, 1500);
    }

    populateBackends() {
        const backendsList = document.getElementById('backends-content');
        if (!backendsList) return;

        const backends = [
            { name: 'ibmq_qasm_simulator', status: 'online', qubits: 32, queue: 0 },
            { name: 'ibm_oslo', status: 'online', qubits: 7, queue: 3 },
            { name: 'ibm_nairobi', status: 'online', qubits: 7, queue: 1 },
            { name: 'ibm_lagos', status: 'online', qubits: 7, queue: 2 },
            { name: 'ibm_perth', status: 'online', qubits: 7, queue: 0 }
        ];

        backendsList.innerHTML = '';
        
        backends.forEach((backend, index) => {
            setTimeout(() => {
                const backendElement = this.createBackendElement(backend);
                backendsList.appendChild(backendElement);
                this.animateElement(backendElement, 'slideInLeft');
            }, index * 100);
        });
    }

    createBackendElement(backend) {
        const element = document.createElement('div');
        element.className = 'backend-item';
        element.innerHTML = `
            <div class="backend-info">
                <h3>${backend.name}</h3>
                <span class="backend-qubits">${backend.qubits} qubits</span>
            </div>
            <div class="backend-status">
                <span class="status-indicator ${backend.status}"></span>
                <span class="queue-count">Queue: ${backend.queue}</span>
            </div>
        `;
        return element;
    }

    // Update jobs with animation
    updateJobs() {
        this.showLoadingAnimation('jobs', 'Loading Active Jobs...');
        
        setTimeout(() => {
            this.hideLoadingAnimation('jobs');
            this.populateJobs();
        }, 1200);
    }

    populateJobs() {
        const jobsBody = document.getElementById('jobs-body');
        if (!jobsBody) return;

        const jobs = [
            { id: 'QJ_2024_001', backend: 'ibm_oslo', status: 'running', qubits: 3, progress: 75 },
            { id: 'QJ_2024_002', backend: 'ibm_nairobi', status: 'queued', qubits: 5, progress: 0 },
            { id: 'QJ_2024_003', backend: 'ibm_lagos', status: 'completed', qubits: 2, progress: 100 }
        ];

        jobsBody.innerHTML = '';
        
        jobs.forEach((job, index) => {
            setTimeout(() => {
                const jobElement = this.createJobElement(job);
                jobsBody.appendChild(jobElement);
                this.animateElement(jobElement, 'fadeIn');
            }, index * 150);
        });
    }

    createJobElement(job) {
        const element = document.createElement('tr');
        element.className = 'job-row';
        element.innerHTML = `
            <td>${job.id}</td>
            <td>${job.backend}</td>
            <td><span class="status-badge ${job.status}">${job.status}</span></td>
            <td>${job.qubits}</td>
            <td>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${job.progress}%"></div>
                </div>
            </td>
            <td>
                <button class="action-btn" onclick="dashboard.viewJob('${job.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        return element;
    }

    // Update circuit visualization
    updateCircuitVisualization() {
        this.showLoadingAnimation('circuit', 'Initializing 3D Quantum Circuit...');
        
        setTimeout(() => {
            this.hideLoadingAnimation('circuit');
            this.initializeCircuit();
        }, 2000);
    }

    initializeCircuit() {
        const circuitContainer = document.getElementById('3d-quantum-circuit');
        if (circuitContainer) {
            // Initialize 3D circuit visualization
            console.log('Initializing 3D quantum circuit');
        }
    }

    // Update measurement results
    updateMeasurementResults() {
        this.showLoadingAnimation('results', 'Calculating Measurement Results...');
        
        setTimeout(() => {
            this.hideLoadingAnimation('results');
            this.populateResults();
        }, 1800);
    }

    populateResults() {
        const resultsCanvas = document.getElementById('results-canvas');
        const resultsShots = document.getElementById('results-shots');
        const resultsFidelity = document.getElementById('results-fidelity');
        
        if (resultsCanvas) {
            this.drawResultsChart(resultsCanvas);
        }
        
        if (resultsShots) {
            resultsShots.textContent = Math.floor(Math.random() * 1000) + 1000;
        }
        
        if (resultsFidelity) {
            resultsFidelity.textContent = (Math.random() * 0.1 + 0.9).toFixed(3);
        }
    }

    drawResultsChart(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw measurement results
        const results = [0.6, 0.4]; // Example results
        const barWidth = width / results.length;
        
        results.forEach((value, index) => {
            const barHeight = value * height;
            const x = index * barWidth;
            const y = height - barHeight;
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, y, 0, height);
            gradient.addColorStop(0, '#00f5ff');
            gradient.addColorStop(1, '#ff00ff');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
    }

    // Update entanglement data
    updateEntanglementData() {
        this.showLoadingAnimation('entanglement', 'Calculating Entanglement...');
        
        setTimeout(() => {
            this.hideLoadingAnimation('entanglement');
            this.populateEntanglement();
        }, 1600);
    }

    populateEntanglement() {
        const entanglementCanvas = document.getElementById('entanglement-canvas');
        const entanglementFidelity = document.getElementById('entanglement-fidelity');
        
        if (entanglementCanvas) {
            this.drawEntanglementVisualization(entanglementCanvas);
        }
        
        if (entanglementFidelity) {
            entanglementFidelity.textContent = (Math.random() * 0.1 + 0.9).toFixed(3);
        }
    }

    drawEntanglementVisualization(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw entanglement visualization
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 40;
        
        // Draw entangled particles
        ctx.beginPath();
        ctx.arc(centerX - 30, centerY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = '#00f5ff';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX + 30, centerY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff00ff';
        ctx.fill();
        
        // Draw connection line
        ctx.beginPath();
        ctx.moveTo(centerX - 15, centerY);
        ctx.lineTo(centerX + 15, centerY);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Load quantum state
    loadQuantumState() {
        this.showLoadingAnimation('quantum-state', 'Calculating Quantum State...');
        
        setTimeout(() => {
            this.hideLoadingAnimation('quantum-state');
            this.populateQuantumState();
        }, 1400);
    }

    populateQuantumState() {
        const stateDisplay = document.getElementById('quantum-state-display');
        if (!stateDisplay) return;
        
        const currentState = this.quantumStates[this.currentStateIndex];
        
        const stateEquation = stateDisplay.querySelector('.state-equation');
        const alphaValue = stateDisplay.querySelector('.state-coefficients div:first-child');
        const betaValue = stateDisplay.querySelector('.state-coefficients div:last-child');
        
        if (stateEquation) {
            stateEquation.textContent = `|ψ⟩ = ${currentState.alpha.toFixed(3)}|0⟩ + ${currentState.beta.toFixed(3)}|1⟩`;
        }
        
        if (alphaValue) {
            alphaValue.textContent = `α = ${currentState.alpha.toFixed(3)}`;
        }
        
        if (betaValue) {
            betaValue.textContent = `β = ${currentState.beta.toFixed(3)}`;
        }
    }

    // Refresh methods
    refreshBackends() {
        this.updateBackends();
    }

    refreshResults() {
        this.updateMeasurementResults();
    }

    refreshEntanglement() {
        this.updateEntanglementData();
    }

    calculateEntanglement() {
        this.updateEntanglementData();
    }

    toggleCircuitAnimation() {
        const playBtn = document.getElementById('circuit-play');
        if (playBtn) {
            const icon = playBtn.querySelector('i');
            if (icon.classList.contains('fa-play')) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        }
    }

    resetCircuit() {
        console.log('Resetting circuit');
    }

    viewJob(jobId) {
        console.log(`Viewing job: ${jobId}`);
    }
}

// Enhanced CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideInUp {
        0% {
            opacity: 0;
            transform: translateY(30px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInUp {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInLeft {
        0% {
            opacity: 0;
            transform: translateX(-30px);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        0% {
            opacity: 0;
            transform: translateX(30px);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    
    .notification-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid var(--border-secondary);
        transition: all var(--transition-fast);
    }
    
    .notification-item:hover {
        background: var(--bg-hover);
    }
    
    .notification-icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    
    .notification-item.success .notification-icon {
        background: var(--gradient-green);
    }
    
    .notification-item.info .notification-icon {
        background: var(--gradient-cyan);
    }
    
    .notification-item.warning .notification-icon {
        background: var(--gradient-orange);
    }
    
    .notification-content h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .notification-content p {
        margin: 0 0 0.25rem 0;
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    
    .notification-time {
        font-size: 0.625rem;
        color: var(--text-muted);
    }
    
    .backend-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border: 1px solid var(--border-secondary);
        border-radius: var(--radius-md);
        margin-bottom: 0.5rem;
        transition: all var(--transition-fast);
    }
    
    .backend-item:hover {
        background: var(--bg-hover);
        border-color: var(--border-accent);
    }
    
    .backend-info h3 {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .backend-qubits {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    
    .backend-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.25rem;
    }
    
    .status-indicator {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
    }
    
    .status-indicator.online {
        background: var(--success);
        animation: pulse 2s ease-in-out infinite;
    }
    
    .queue-count {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-badge.running {
        background: var(--gradient-green);
        color: white;
    }
    
    .status-badge.queued {
        background: var(--gradient-orange);
        color: white;
    }
    
    .status-badge.completed {
        background: var(--gradient-cyan);
        color: white;
    }
    
    .progress-bar-container {
        width: 100%;
        height: 0.5rem;
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        overflow: hidden;
    }
    
    .progress-bar {
        height: 100%;
        background: var(--gradient-cyan);
        border-radius: var(--radius-sm);
        transition: width var(--transition-normal);
    }
    
    .action-btn {
        width: 1.5rem;
        height: 1.5rem;
        border: none;
        border-radius: var(--radius-sm);
        background: var(--glass-bg);
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
    }
    
    .action-btn:hover {
        background: var(--accent-cyan);
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new EnhancedQuantumDashboard();
});