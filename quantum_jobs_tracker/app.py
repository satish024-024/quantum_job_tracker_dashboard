from flask import Flask, render_template, jsonify
import qiskit
from qiskit import IBMQ, Aer
from qiskit.providers.ibmq import IBMQBackend
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt
import io
import base64
import requests
import json
import time
import threading
import numpy as np

# Import the quantum circuit processor
from .quantum_circuit_processor import QuantumCircuitProcessor

app = Flask(__name__)

# Quantum backend connection parameters
IBM_TOKEN = ""  # Replace with your IBM Quantum Experience token

class QuantumJobsTracker:
    def __init__(self, token=None):
        self.token = token
        self.backend_data = {}
        self.job_data = []
        self.quantum_processor = QuantumCircuitProcessor()
        self._initialize_quantum_connection()
        
    def _initialize_quantum_connection(self):
        """Initialize connection to IBM Quantum Experience"""
        try:
            if self.token:
                IBMQ.save_account(self.token, overwrite=True)
                IBMQ.load_account()
                print("Successfully connected to IBM Quantum Experience")
            else:
                print("No token provided, running in simulation mode")
        except Exception as e:
            print(f"Failed to connect to IBM Quantum: {e}")
            print("Running in simulation mode")
    
    def get_available_backends(self):
        """Get list of available quantum backends"""
        backends = []
        
        # Try to get real backends if authenticated
        try:
            if IBMQ.active_account():
                provider = IBMQ.get_provider()
                backends = provider.backends()
            else:
                # Use simulator backends
                backends = Aer.backends()
        except:
            # Fallback to simulator backends
            backends = Aer.backends()
            
        return backends
    
    def encode_backend_status_as_quantum_state(self, backend_status):
        """Encode backend status information as quantum states using quantum processor"""
        return self.quantum_processor.encode_backend_data(backend_status)
    
    def get_backend_status(self):
        """Get status of all backends with quantum encoding"""
        backends = self.get_available_backends()
        results = []
        
        for backend in backends:
            try:
                if isinstance(backend, IBMQBackend):
                    # Real backend
                    status = backend.status().to_dict()
                    backend_data = {
                        "name": backend.name(),
                        "status": "active" if status.get("operational") else "inactive",
                        "pending_jobs": status.get("pending_jobs", 0),
                        "operational": status.get("operational", False)
                    }
                    
                    # Process with quantum circuit
                    quantum_data = self.encode_backend_status_as_quantum_state(backend_data)
                    backend_data["quantum_encoding"] = quantum_data
                    
                    results.append(backend_data)
                else:
                    # Simulator
                    backend_data = {
                        "name": backend.name(),
                        "status": "active",
                        "pending_jobs": 0,
                        "operational": True
                    }
                    
                    # Process with quantum circuit
                    quantum_data = self.encode_backend_status_as_quantum_state(backend_data)
                    backend_data["quantum_encoding"] = quantum_data
                    
                    results.append(backend_data)
            except Exception as e:
                print(f"Error getting status for {backend.name()}: {e}")
        
        return results

    def create_visualization(self, quantum_data):
        """Get visualization from quantum data"""
        if not quantum_data:
            return None
            
        # Use histogram visualization if available
        if "histogram_visualization" in quantum_data:
            return quantum_data["histogram_visualization"]
            
        # Fallback to counts visualization
        elif "counts" in quantum_data:
            plt.figure(figsize=(5, 4))
            plot_histogram(quantum_data["counts"])
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            
            # Encode the PNG image to base64 string
            img_str = base64.b64encode(buf.read()).decode('utf-8')
            plt.close()
            
            return img_str
            
        return None

    def simulate_job_data(self):
        """Simulate quantum job data when not connected to real IBM Quantum"""
        backends = ["ibmq_qasm_simulator", "ibmq_bogota", "ibmq_lima", "ibmq_manila"]
        statuses = ["RUNNING", "QUEUED", "COMPLETED", "ERROR"]
        
        jobs = []
        # Generate 5-10 random jobs
        for i in range(np.random.randint(5, 11)):
            job = {
                "id": f"job-{i}-{int(time.time())}",
                "backend": np.random.choice(backends),
                "status": np.random.choice(statuses),
                "qubits": np.random.randint(1, 6),
                "start_time": time.time() - np.random.randint(0, 3600),
                "estimated_completion": time.time() + np.random.randint(0, 7200)
            }
            jobs.append(job)
            
        return jobs

    def update_data(self):
        """Update backend and job data"""
        # Get backend data with quantum encoding
        self.backend_data = self.get_backend_status()
        
        # Get job data - either from API or simulated
        try:
            if IBMQ.active_account():
                # Get real job data from IBM Quantum
                provider = IBMQ.get_provider()
                # This is a placeholder, would need to implement actual jobs retrieval
                self.job_data = []  # provider.jobs() would need additional processing
            else:
                self.job_data = self.simulate_job_data()
        except:
            self.job_data = self.simulate_job_data()
        
        # Process jobs data with quantum circuit
        self.jobs_quantum_data = self.quantum_processor.process_jobs_data(self.job_data)
        
        # Create dashboard quantum state
        self.dashboard_quantum_state = self.quantum_processor.create_quantum_dashboard_state(
            self.backend_data, self.job_data
        )

# Create tracker instance
tracker = QuantumJobsTracker(token=IBM_TOKEN)

@app.route('/')
def index():
    """Render main dashboard"""
    return render_template('index.html')

@app.route('/api/backends')
def get_backends():
    """API endpoint to get backend data"""
    tracker.update_data()
    
    # Process backend data for API response
    response_data = []
    for backend in tracker.backend_data:
        # Create visualization of quantum encoding
        if "quantum_encoding" in backend:
            visualization = tracker.create_visualization(backend["quantum_encoding"])
        else:
            visualization = None
            
        response_data.append({
            "name": backend.get("name", "Unknown"),
            "status": backend.get("status", "Unknown"),
            "pending_jobs": backend.get("pending_jobs", 0),
            "operational": backend.get("operational", False),
            "visualization": visualization
        })
    
    return jsonify(response_data)

@app.route('/api/jobs')
def get_jobs():
    """API endpoint to get job data"""
    tracker.update_data()
    return jsonify(tracker.job_data)

@app.route('/api/dashboard_state')
def get_dashboard_state():
    """API endpoint to get quantum dashboard state"""
    if hasattr(tracker, 'dashboard_quantum_state'):
        # Return relevant data and visualizations
        return jsonify({
            "metrics": tracker.dashboard_quantum_state.get("dashboard_metrics", {}),
            "histogram_visualization": tracker.dashboard_quantum_state.get("histogram_visualization", None),
            "bloch_visualization": tracker.dashboard_quantum_state.get("bloch_visualization", None)
        })
    return jsonify({"error": "Dashboard state not available"})

if __name__ == '__main__':
    # Start background thread to update data periodically
    def update_thread():
        while True:
            tracker.update_data()
            time.sleep(60)  # Update every minute
            
    threading.Thread(target=update_thread, daemon=True).start()
    
    # Start Flask application
    app.run(debug=True)