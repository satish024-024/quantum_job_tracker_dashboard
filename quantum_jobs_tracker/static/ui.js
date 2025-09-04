// Initialize global variables for original Blochy
console.log('🚀 Initializing Blochy variables...');

try {
    QMSTATEVECTOR = [gen_state(true)];
    BLOCHSPHERE = gen_bloch_sphere();
    STATEARROW = gen_vector_plot(state2vector(QMSTATEVECTOR[QMSTATEVECTOR.length-1]));
    PHOSPHOR = [];
    PHOSPHOR_ENABLED = true;

    // Export to global scope for dashboard access
    window.QMSTATEVECTOR = QMSTATEVECTOR;
    window.BLOCHSPHERE = BLOCHSPHERE;
    window.STATEARROW = STATEARROW;
    window.PHOSPHOR = PHOSPHOR;
    window.PHOSPHOR_ENABLED = PHOSPHOR_ENABLED;

    console.log('✅ Blochy variables initialized successfully:', {
        QMSTATEVECTOR: typeof window.QMSTATEVECTOR,
        BLOCHSPHERE: typeof window.BLOCHSPHERE,
        STATEARROW: typeof window.STATEARROW,
        PHOSPHOR: typeof window.PHOSPHOR
    });
} catch (error) {
    console.error('❌ Error initializing Blochy variables:', error);
}

// Initialize only if container exists
function initializeBlochyContainer() {
    const container = document.getElementById('myDiv');
    if (container) {
        console.log('✅ Initializing original Blochy in container:', container);
        init_plotting(BLOCHSPHERE.concat(STATEARROW).concat(PHOSPHOR));
        return true;
    } else {
        console.warn('⚠️ myDiv container not found, waiting...');
        return false;
    }
}

// Try to initialize immediately
if (!initializeBlochyContainer()) {
    // If container not ready, wait and try again
    setTimeout(initializeBlochyContainer, 100);
}

// Also initialize rabi plot if needed
rabi_plot();


function rotate_state(axis,angle) {
    QMSTATEVECTOR.push(rot(axis,angle,QMSTATEVECTOR[QMSTATEVECTOR.length-1]));
    rot_phosphor(axis,angle,QMSTATEVECTOR[QMSTATEVECTOR.length-2],divider=Math.max(6,Math.round(angle/(0.5*math.PI)*10)));
    update_state_plot();
}


function pulse_apply(axis){
    time = document.getElementById('pulselength').value;
    QMSTATEVECTOR.push(pulse(axis,time,QMSTATEVECTOR[QMSTATEVECTOR.length-1]));
    pulse_phosphor(axis,time,QMSTATEVECTOR[QMSTATEVECTOR.length-2],divider=Math.max(6,Math.round(time/0.01)));
    update_state_plot();
  }
  


function export_png() {
    var currentdate = new Date(); 
    var datetime =  currentdate.getFullYear() + "-" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "_" + currentdate.getHours() + '- ' + currentdate.getMinutes() + '-' + currentdate.getSeconds();
    Plotly.downloadImage('myDiv', {format: 'png', width: document.getElementById('export_size').value, height: document.getElementById('export_size').value, filename: datetime});
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

    rot_op = math.multiply(math.cos(document.getElementById('custom_axis_polar').value/180*math.PI),opZ);
    rot_op = math.add(rot_op,math.multiply(math.sin(document.getElementById('custom_axis_polar').value/180*math.PI)*math.cos(document.getElementById('custom_axis_azimuth').value/180*math.PI),opX));
    rot_op = math.add(rot_op,math.multiply(math.sin(document.getElementById('custom_axis_polar').value/180*math.PI)*math.sin(document.getElementById('custom_axis_azimuth').value/180*math.PI),opY));
    
    rotate_state(rot_op,document.getElementById('custom_axis_rot_angle').value/180*math.PI);
}


function undo() {
    if (QMSTATEVECTOR.length> 1){
    QMSTATEVECTOR.pop();
    PHOSPHOR.pop();
    update_state_plot();
}

}

function restart() {
    QMSTATEVECTOR = [gen_state(true)];
    BLOCHSPHERE =  gen_bloch_sphere();
    STATEARROW = gen_vector_plot(state2vector(QMSTATEVECTOR[QMSTATEVECTOR.length-1]));
    PHOSPHOR = [];
    PHOSPHOR_ENABLED = true;

    // Update global variables
    window.QMSTATEVECTOR = QMSTATEVECTOR;
    window.BLOCHSPHERE = BLOCHSPHERE;
    window.STATEARROW = STATEARROW;
    window.PHOSPHOR = PHOSPHOR;

    init_plotting(BLOCHSPHERE.concat(STATEARROW).concat(PHOSPHOR));
}

// Additional initialization function for dashboard integration
function initializeBlochSphereDashboard() {
    console.log('🚀 Dashboard Bloch sphere initialization...');

    // Ensure global variables are available
    if (typeof window.BLOCHSPHERE === 'undefined') {
        console.log('🔄 Initializing global Bloch variables...');
        window.QMSTATEVECTOR = QMSTATEVECTOR;
        window.BLOCHSPHERE = BLOCHSPHERE;
        window.STATEARROW = STATEARROW;
        window.PHOSPHOR = PHOSPHOR;
        window.PHOSPHOR_ENABLED = PHOSPHOR_ENABLED;
    }

    // Check if container exists
    const container = document.getElementById('myDiv');
    if (container) {
        console.log('✅ Container found, initializing...');
        init_plotting(window.BLOCHSPHERE.concat(window.STATEARROW).concat(window.PHOSPHOR));
        return true;
    } else {
        console.warn('⚠️ Container not found');
        return false;
    }
}

// Make functions globally available
window.initializeBlochSphereDashboard = initializeBlochSphereDashboard;
window.restart = restart;