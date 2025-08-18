from flask import Flask, render_template, jsonify
import numpy as np
import time
import json
import threading
import os

app = Flask(__name__, 
            template_folder=os.path.join('quantum_jobs_tracker', 'templates'),
            static_folder=os.path.join('quantum_jobs_tracker', 'static'))

class SimpleQuantumTracker:
    def __init__(self):
        self.backend_data = []
        self.job_data = []
        self.init_backends()
        
    def init_backends(self):
        # Create simulated backend data
        backend_names = ["qasm_simulator", "statevector_simulator", 
                        "unitary_simulator", "pulse_simulator"]
        
        for name in backend_names:
            self.backend_data.append({
                "name": name,
                "status": "active" if np.random.random() > 0.2 else "inactive",
                "pending_jobs": np.random.randint(0, 10),
                "operational": np.random.random() > 0.1,
            })
    
    def simulate_job_data(self):
        """Simulate quantum job data"""
        backends = ["qasm_simulator", "statevector_simulator", 
                   "unitary_simulator", "pulse_simulator"]
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
        # Randomize some backend data
        for backend in self.backend_data:
            if np.random.random() > 0.7:
                backend["status"] = "active" if np.random.random() > 0.2 else "inactive"
                backend["pending_jobs"] = np.random.randint(0, 10)
                backend["operational"] = np.random.random() > 0.1
        
        # Update job data
        self.job_data = self.simulate_job_data()
        
        print(f"Data updated: {len(self.backend_data)} backends, {len(self.job_data)} jobs")

# Create tracker instance
tracker = SimpleQuantumTracker()

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
        response_data.append({
            "name": backend.get("name", "Unknown"),
            "status": backend.get("status", "Unknown"),
            "pending_jobs": backend.get("pending_jobs", 0),
            "operational": backend.get("operational", False),
            "visualization": None  # No quantum visualization in simple version
        })
    
    return jsonify(response_data)

@app.route('/api/jobs')
def get_jobs():
    """API endpoint to get job data"""
    return jsonify(tracker.job_data)

@app.route('/api/dashboard_state')
def get_dashboard_state():
    """API endpoint to get dashboard state metrics"""
    active_backends = sum(1 for b in tracker.backend_data if b.get("status") == "active")
    running_jobs = sum(1 for j in tracker.job_data if j.get("status") == "RUNNING")
    queued_jobs = sum(1 for j in tracker.job_data if j.get("status") == "QUEUED")
    
    metrics = {
        "active_backends": active_backends,
        "inactive_backends": len(tracker.backend_data) - active_backends,
        "running_jobs": running_jobs,
        "queued_jobs": queued_jobs
    }
    
    return jsonify({
        "metrics": metrics,
        "histogram_visualization": None,
        "bloch_visualization": None
    })

if __name__ == '__main__':
    # Start background thread to update data periodically
    def update_thread():
        while True:
            tracker.update_data()
            time.sleep(10)  # Update every 10 seconds
            
    threading.Thread(target=update_thread, daemon=True).start()
    
    print("Starting Simple Quantum Jobs Tracker Dashboard...")
    print("Open your browser and navigate to http://localhost:5000")
    # Start Flask application
    app.run(debug=True)
