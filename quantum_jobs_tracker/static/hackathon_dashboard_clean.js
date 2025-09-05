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
        const contentElement = document.getElementById('bloch-content');
        if (!contentElement) return;

        try {
            // Initialize Blochy Bloch sphere - compact version
            if (typeof gen_state === 'function' &&
                typeof gen_bloch_sphere === 'function' &&
                typeof state2vector === 'function' &&
                typeof gen_vector_plot === 'function' &&
                typeof init_plotting === 'function') {

                // Initialize quantum state and Bloch sphere
                window.QMSTATEVECTOR = [gen_state(true)];
                window.BLOCHSPHERE = gen_bloch_sphere();
                window.STATEARROW = gen_vector_plot(state2vector(window.QMSTATEVECTOR[window.QMSTATEVECTOR.length-1]));
                window.PHOSPHOR = [];
                window.PHOSPHOR_ENABLED = false; // Disable phosphor for cleaner look

                // Create compact container for the plot
                const plotContainer = document.createElement('div');
                plotContainer.id = 'myDiv';
                plotContainer.style.width = '100%';
                plotContainer.style.height = '250px';
                plotContainer.style.margin = '0 auto';
                contentElement.innerHTML = '';
                contentElement.appendChild(plotContainer);

                // Initialize the plot with minimal controls
                const config = {
                    displayModeBar: false, // Hide toolbar for cleaner look
                    responsive: true
                };

                // Override the init_plotting to use our config
                const originalInitPlotting = window.init_plotting;
                window.init_plotting = function(data) {
                    const layout = {
                        hovermode: 'closest',
                        scene: {
                            xaxis: { showspikes: false, showgrid: false, zeroline: false, showline: false, visible: false, ticks: '', showticklabels: false, range: [-1.1,1.1] },
                            yaxis: { showspikes: false, showgrid: false, zeroline: false, showline: false, visible: false, ticks: '', showticklabels: false, range: [-1.1,1.1] },
                            zaxis: { showspikes: false, showgrid: false, zeroline: false, showline: false, visible: false, ticks: '', showticklabels: false, range: [-1.1,1.1] },
                            camera: { center: { x:0, y:0,z:0 }, eye: { x:-0.9, y:1, z:0.6 }, projection: 'perspective' },
                            bgcolor: 'rgba(0,0,0,0)'
                        },
                        margin: { t: 0, b: 0, l: 0, r: 0 },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)'
                    };

                    Plotly.newPlot('myDiv', data, layout, config);
                };

                // Initialize the plot
                init_plotting(window.BLOCHSPHERE.concat(window.STATEARROW).concat(window.PHOSPHOR));

                // Restore original function
                window.init_plotting = originalInitPlotting;

            } else {
                contentElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);"><i class="fas fa-globe fa-2x" style="margin-bottom: 1rem;"></i><br>Bloch sphere visualization</div>';
            }
        } catch (error) {
            console.error('Error initializing Bloch sphere:', error);
            contentElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger-color);"><i class="fas fa-exclamation-triangle fa-2x" style="margin-bottom: 1rem;"></i><br>Error loading visualization</div>';
        }
    }
        } 
 
         c r e a t e E n h a n c e d B l o c h S p h e r e ( )   { 
                 / /   C r e a t e   a   s i m p l e   B l o c h   s p h e r e   f o r   f a l l b a c k 
                 c o n s t   t h e t a   =   [ ] ; 
                 c o n s t   p h i   =   [ ] ; 
                 c o n s t   x   =   [ ] ; 
                 c o n s t   y   =   [ ] ; 
                 c o n s t   z   =   [ ] ; 
 
                 f o r   ( l e t   i   =   0 ;   i   < =   2 0 ;   i + + )   { 
                         f o r   ( l e t   j   =   0 ;   j   < =   2 0 ;   j + + )   { 
                                 c o n s t   t   =   ( i   /   2 0 )   *   M a t h . P I ; 
                                 c o n s t   p   =   ( j   /   2 0 )   *   2   *   M a t h . P I ; 
 
                                 t h e t a . p u s h ( t ) ; 
                                 p h i . p u s h ( p ) ; 
                                 x . p u s h ( M a t h . s i n ( t )   *   M a t h . c o s ( p ) ) ; 
                                 y . p u s h ( M a t h . s i n ( t )   *   M a t h . s i n ( p ) ) ; 
                                 z . p u s h ( M a t h . c o s ( t ) ) ; 
                         } 
                 } 
 
                 r e t u r n   [ { 
                         t y p e :   ' s c a t t e r 3 d ' , 
                         m o d e :   ' m a r k e r s ' , 
                         x :   x , 
                         y :   y , 
                         z :   z , 
                         m a r k e r :   { 
                                 s i z e :   1 , 
                                 c o l o r :   ' r g b a ( 6 ,   1 8 2 ,   2 1 2 ,   0 . 3 ) ' , 
                                 s y m b o l :   ' c i r c l e ' 
                         } , 
                         n a m e :   ' B l o c h   S p h e r e ' , 
                         s h o w l e g e n d :   f a l s e , 
                         h o v e r i n f o :   ' s k i p ' 
                 } ] ; 
         } 
 } 
 
 / /   I n i t i a l i z e   d a s h b o a r d   w h e n   D O M   i s   l o a d e d 
 d o c u m e n t . a d d E v e n t L i s t e n e r ( ' D O M C o n t e n t L o a d e d ' ,   ( )   = >   { 
         w i n d o w . h a c k a t h o n D a s h b o a r d   =   n e w   H a c k a t h o n D a s h b o a r d ( ) ; 
         
         / /   A d d   t e a m   b r a n d i n g 
         c o n s o l e . l o g ( '   Q u a n t u m   S p a r k   -   A m r a v a t i   Q u a n t u m   H a c k a t h o n   2 0 2 4 ' ) ; 
         c o n s o l e . l o g ( '   D e v e l o p e d   b y   S a t i s h   K u m a r ' ) ; 
         c o n s o l e . l o g ( '   R e a d y   t o   w i n   t h e   h a c k a t h o n ! ' ) ; 
 } ) ;  
 