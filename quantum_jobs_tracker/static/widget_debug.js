// Widget Debug Script
console.log('🔧 Widget Debug Script Loaded');

// Function to test all widgets
function testAllWidgets() {
    console.log('🧪 Testing all widgets...');
    
    const widgets = [
        { id: 'backends', name: 'Quantum Backends' },
        { id: 'jobs', name: 'Active Jobs' },
        { id: 'circuit', name: '3D Quantum Circuit' },
        { id: 'entanglement', name: 'Entanglement' },
        { id: 'results', name: 'Results' },
        { id: 'bloch', name: '3D Bloch Sphere' },
        { id: 'quantum-state', name: 'Quantum State' },
        { id: 'performance', name: 'Performance' }
    ];
    
    widgets.forEach(widget => {
        const loadingElement = document.getElementById(`${widget.id}-loading`);
        const contentElement = document.getElementById(`${widget.id}-content`) || 
                              document.getElementById(`${widget.id}-container`) ||
                              document.getElementById(`${widget.id}-display`) ||
                              document.getElementById(`${widget.id}-metrics`);
        
        const status = {
            name: widget.name,
            loadingExists: !!loadingElement,
            contentExists: !!contentElement,
            loadingVisible: loadingElement ? loadingElement.style.display !== 'none' : false,
            contentVisible: contentElement ? contentElement.style.display !== 'none' : false
        };
        
        console.log(`📊 ${widget.name}:`, status);
        
        // If content exists but not visible, try to show it
        if (contentElement && !status.contentVisible) {
            console.log(`🔧 Attempting to show ${widget.name} content...`);
            contentElement.style.display = 'block';
            contentElement.style.opacity = '1';
        }
        
        // If loading is visible, try to hide it
        if (loadingElement && status.loadingVisible) {
            console.log(`🔧 Attempting to hide ${widget.name} loading...`);
            loadingElement.style.display = 'none';
        }
    });
    
    console.log('✅ Widget test completed');
}

// Function to force show all content
function forceShowAllContent() {
    console.log('🚀 Force showing all widget content...');
    
    const widgets = ['backends', 'jobs', 'circuit', 'entanglement', 'results', 'bloch', 'quantum-state', 'performance'];
    
    widgets.forEach(widgetId => {
        // Hide loading
        const loadingElement = document.getElementById(`${widgetId}-loading`);
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Show content
        const contentElement = document.getElementById(`${widgetId}-content`) || 
                              document.getElementById(`${widgetId}-container`) ||
                              document.getElementById(`${widgetId}-display`) ||
                              document.getElementById(`${widgetId}-metrics`);
        
        if (contentElement) {
            contentElement.style.display = 'block';
            contentElement.style.opacity = '1';
        }
    });
    
    console.log('✅ All content force shown');
}

// Function to force refresh all data
function forceRefreshData() {
    console.log('🔄 Force refreshing all data...');
    if (window.dashboard) {
        window.dashboard.updateAllWidgets();
    } else {
        console.error('❌ Dashboard not available');
    }
}

// Make functions globally available
window.testAllWidgets = testAllWidgets;
window.forceShowAllContent = forceShowAllContent;
window.forceRefreshData = forceRefreshData;

// Auto-run test after page load
setTimeout(() => {
    console.log('🔄 Auto-running widget test...');
    testAllWidgets();
    
    // Force show content after 2 seconds
    setTimeout(() => {
        forceShowAllContent();
    }, 2000);
}, 3000);

console.log('🔧 Widget Debug Script Ready - Use testAllWidgets() or forceShowAllContent() in console');
