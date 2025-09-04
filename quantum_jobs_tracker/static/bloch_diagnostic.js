/**
 * Bloch Sphere Diagnostic Script
 * Helps debug initialization issues
 */

function runBlochDiagnostic() {
    console.log('🔍 Running Bloch Sphere Diagnostic...');
    
    const results = {
        libraries: {},
        elements: {},
        functions: {},
        errors: []
    };
    
    // Check libraries
    results.libraries.math = typeof math !== 'undefined';
    results.libraries.plotly = typeof Plotly !== 'undefined';
    results.libraries.optimizedBlochy = typeof OptimizedBlochyWidget !== 'undefined';
    results.libraries.integration = typeof BlochSphereDashboardIntegration !== 'undefined';
    
    // Check DOM elements
    results.elements.container = document.getElementById('blochy-container') !== null;
    results.elements.loading = document.getElementById('bloch-loading') !== null;
    results.elements.fullscreen = document.getElementById('fullscreen-bloch-overlay') !== null;
    
    // Check functions
    results.functions.resetBloch = typeof resetBlochSphere === 'function';
    results.functions.toggleAutoRotate = typeof toggleAutoRotateBloch === 'function';
    results.functions.showFullscreen = typeof showFullscreenBloch === 'function';
    
    // Check for errors
    if (!results.libraries.math) results.errors.push('Math.js not loaded');
    if (!results.libraries.plotly) results.errors.push('Plotly.js not loaded');
    if (!results.libraries.optimizedBlochy) results.errors.push('OptimizedBlochyWidget not available');
    if (!results.libraries.integration) results.errors.push('BlochSphereDashboardIntegration not available');
    if (!results.elements.container) results.errors.push('blochy-container element not found');
    
    // Log results
    console.log('📊 Diagnostic Results:', results);
    
    if (results.errors.length === 0) {
        console.log('✅ All checks passed - Bloch sphere should work');
    } else {
        console.log('❌ Issues found:', results.errors);
    }
    
    return results;
}

// Auto-run diagnostic after a delay
setTimeout(runBlochDiagnostic, 2000);

// Export for manual use
window.runBlochDiagnostic = runBlochDiagnostic;
