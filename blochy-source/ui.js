// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit more for all scripts to load
    setTimeout(() => {
        initializeBlochSphere();
    }, 100);
});

// Fallback initialization if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded, wait a bit for scripts
    setTimeout(() => {
        initializeBlochSphere();
    }, 100);
}

// Function to initialize the Bloch sphere
function initializeBlochSphere() {
    try {
        // Check if required libraries are available
        if (typeof Plotly === 'undefined') {
            throw new Error('Plotly library not loaded');
        }
        if (typeof math === 'undefined') {
            throw new Error('Math.js library not loaded');
        }
        
        // Initialize quantum state and Bloch sphere
        QMSTATEVECTOR = [gen_state(true)];
        BLOCHSPHERE = gen_bloch_sphere();
        STATEARROW = gen_vector_plot(state2vector(QMSTATEVECTOR[QMSTATEVECTOR.length-1]));
        PHOSPHOR = []
        PHOSPHOR_ENABLED = true

        // Initialize the plot
        init_plotting(BLOCHSPHERE.concat(STATEARROW).concat(PHOSPHOR));
        
        // Initialize Rabi plot
        rabi_plot();
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        console.log('✅ Bloch sphere initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing Bloch sphere:', error);
        
        // Show error message
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.innerHTML = '<p style="color: #f44336;">Error initializing Bloch sphere. Please refresh the page.</p>';
        }
    }
}


function rotate_state(axis,angle) {
    QMSTATEVECTOR.push(rot(axis,angle,QMSTATEVECTOR[QMSTATEVECTOR.length-1]));
    rot_phosphor(axis,angle,QMSTATEVECTOR[QMSTATEVECTOR.length-2],divider=Math.max(6,Math.round(angle/(0.5*math.PI)*10)));
    update_state_plot();
}


function pulse_apply(axis){
    // Safely get pulse length with fallback
    let time = 0.5; // Default pulse length
    try {
        const pulseElement = document.getElementById('pulselength');
        if (pulseElement && pulseElement.value) {
            time = parseFloat(pulseElement.value);
        }
    } catch (error) {
        console.log("Using default pulse length");
    }
    
    QMSTATEVECTOR.push(pulse(axis,time,QMSTATEVECTOR[QMSTATEVECTOR.length-1]));
    pulse_phosphor(axis,time,QMSTATEVECTOR[QMSTATEVECTOR.length-2],divider=Math.max(6,Math.round(time/0.01)));
    update_state_plot();
  }
  


function export_png() {
    var currentdate = new Date(); 
    var datetime =  currentdate.getFullYear() + "-" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "_" + currentdate.getHours() + '- ' + currentdate.getMinutes() + '-' + currentdate.getSeconds();
    
    // Safely get export size with fallback
    let exportSize = 800; // Default size
    try {
        const sizeElement = document.getElementById('export_size');
        if (sizeElement && sizeElement.value) {
            exportSize = parseInt(sizeElement.value);
        }
    } catch (error) {
        console.log("Using default export size");
    }
    
    Plotly.downloadImage('myDiv', {format: 'png', width: exportSize, height: exportSize, filename: datetime});
}

function hadamard(){
    opX = math.matrix([[0,math.complex(0.5,0)],[math.complex(0.5,0),0]]);
    opZ = math.matrix([[math.complex(0.5,0),0],[0,math.complex(-0.5,0)]]);

    
    rot_op = math.add(math.multiply(opX,1/math.sqrt(2)),math.multiply(opZ,1/math.sqrt(2)));
    rotate_state(rot_op,math.PI);
}


function custom_rotate_state(){
    opX = math.matrix([[0,math.complex(0.5,0)],[math.complex(0.5,0),0]]);
    opY =  math.matrix([[0,math.complex(0,-0.5)],[math.complex(0,0.5),0]]);
    opZ = math.matrix([[math.complex(0.5,0),0],[0,math.complex(-0.5,0)]]);

    // Safely get values with fallbacks
    let polar = 90; // Default polar angle
    let azimuth = 0; // Default azimuthal angle
    let rotAngle = 90; // Default rotation angle
    
    try {
        const polarElement = document.getElementById('custom_axis_polar');
        const azimuthElement = document.getElementById('custom_axis_azimuth');
        const rotAngleElement = document.getElementById('custom_axis_rot_angle');
        
        if (polarElement && polarElement.value) {
            polar = parseFloat(polarElement.value);
        }
        if (azimuthElement && azimuthElement.value) {
            azimuth = parseFloat(azimuthElement.value);
        }
        if (rotAngleElement && rotAngleElement.value) {
            rotAngle = parseFloat(rotAngleElement.value);
        }
    } catch (error) {
        console.log("Using default values for custom rotation");
    }

    rot_op = math.multiply(math.cos(polar/180*math.PI),opZ);
    rot_op = math.add(rot_op,math.multiply(math.sin(polar/180*math.PI)*math.cos(azimuth/180*math.PI),opX));
    rot_op = math.add(rot_op,math.multiply(math.sin(polar/180*math.PI)*math.sin(azimuth/180*math.PI),opY));
    
    rotate_state(rot_op,rotAngle/180*math.PI);
}


function undo() {
    if (QMSTATEVECTOR.length> 1){
    QMSTATEVECTOR.pop();
    PHOSPHOR.pop();
    update_state_plot();
}

}

function restart() {
    initializeBlochSphere();
}