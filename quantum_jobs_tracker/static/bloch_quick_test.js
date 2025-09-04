/**
 * Quick Bloch Sphere Test
 * Manual testing functions for debugging
 */

// Quick test function
function testBlochVisibility() {
    console.log('🔍 Testing Bloch sphere visibility...');

    const container = document.getElementById('blochy-container');
    if (!container) {
        console.error('❌ Container not found!');
        return false;
    }

    console.log('✅ Container found:', container);
    console.log('📏 Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
    console.log('👁️ Container visibility:', window.getComputedStyle(container).display);

    const widget = container._blochWidget;
    if (!widget) {
        console.error('❌ Widget not initialized!');
        return false;
    }

    console.log('✅ Widget found:', widget);

    const plotDiv = widget.plotDiv;
    if (!plotDiv) {
        console.error('❌ Plot div not found!');
        return false;
    }

    console.log('✅ Plot div found:', plotDiv);
    console.log('📊 Plot div visibility:', window.getComputedStyle(plotDiv).display);

    return true;
}

// Manual initialization trigger
function manualInitBloch() {
    console.log('🚀 Manual Bloch sphere initialization...');

    if (typeof OptimizedBlochyWidget !== 'undefined') {
        const container = document.getElementById('blochy-container');
        if (container) {
            const widget = new OptimizedBlochyWidget('blochy-container');
            console.log('✅ Manual initialization complete');
            return widget;
        } else {
            console.error('❌ Container not found');
        }
    } else {
        console.error('❌ OptimizedBlochyWidget not loaded');
    }
}

// Add to global scope for console testing
window.testBlochVisibility = testBlochVisibility;
window.manualInitBloch = manualInitBloch;

console.log('🧪 Bloch quick test functions loaded');
console.log('📋 Available functions:');
console.log('  - testBlochVisibility()');
console.log('  - manualInitBloch()');
