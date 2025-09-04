#!/usr/bin/env python3
"""
Simplified test version of the Quantum Dashboard
This version works without Qiskit dependencies for testing the connection fixes
"""

from flask import Flask, render_template, jsonify, request
import time
import threading
import os

# Set up path for templates and static files
app = Flask(__name__, 
            template_folder=os.path.join('quantum_jobs_tracker', 'templates'),
            static_folder=os.path.join('quantum_jobs_tracker', 'static'))

# Global quantum manager instance
quantum_manager = None

class MockQuantumManager:
    """Mock quantum manager for testing without Qiskit"""
    
    def __init__(self):
        self.is_connected = False
        self.backend_data = []
        self.job_data = []
        self.token = None
        self.crn = None
    
    def connect_with_credentials(self, token, crn=None):
        """Mock connection - always succeeds"""
        self.token = token
        self.crn = crn
        self.is_connected = True
        print(f"✅ Mock connection successful with token: {token[:10]}...")
        
        # Generate mock data
        self.backend_data = [
            {"name": "ibm_brisbane", "status": "active", "operational": True, "num_qubits": 127, "pending_jobs": 3},
            {"name": "ibm_torino", "status": "active", "operational": True, "num_qubits": 133, "pending_jobs": 1},
            {"name": "ibm_manila", "status": "inactive", "operational": False, "num_qubits": 5, "pending_jobs": 0}
        ]
        
        self.job_data = [
            {"id": "job_001", "backend": "ibm_brisbane", "status": "DONE", "qubits": 5},
            {"id": "job_002", "backend": "ibm_torino", "status": "RUNNING", "qubits": 3},
            {"id": "job_003", "backend": "ibm_brisbane", "status": "QUEUED", "qubits": 7}
        ]
    
    def get_quantum_metrics(self):
        """Get mock metrics"""
        active_backends = len([b for b in self.backend_data if b.get('operational', False)])
        total_jobs = len(self.job_data)
        running_jobs = len([j for j in self.job_data if j.get('status', '').lower() == 'running'])
        queued_jobs = len([j for j in self.job_data if j.get('status', '').lower() == 'queued'])
        
        return {
            "active_backends": active_backends,
            "total_jobs": total_jobs,
            "running_jobs": running_jobs,
            "queued_jobs": queued_jobs,
            "success_rate": 85.5,
            "avg_runtime": 300,
            "error_rate": 2.1,
            "total_backends": len(self.backend_data)
        }
    
    def get_quantum_state_data(self):
        """Get mock quantum state data"""
        return {
            "alpha": 0.707,
            "beta": 0.707,
            "state_vector": [0.707, 0.707],
            "fidelity": 0.95,
            "shots": 1024
        }
    
    def get_measurement_results(self):
        """Get mock measurement results"""
        return {
            "results": {"00": 25, "01": 25, "10": 25, "11": 25},
            "shots": 100,
            "fidelity": 0.95
        }
    
    def calculate_entanglement(self):
        """Get mock entanglement value"""
        return 0.75
    
    def generate_circuit_data(self):
        """Get mock circuit data"""
        return {
            "num_qubits": 5,
            "depth": 8,
            "gates": [
                {"name": "H", "qubits": [0], "position": 0},
                {"name": "CNOT", "qubits": [0, 1], "position": 1},
                {"name": "X", "qubits": [2], "position": 2}
            ]
        }

def get_quantum_manager():
    """Get or create quantum manager instance"""
    global quantum_manager
    if quantum_manager is None:
        quantum_manager = MockQuantumManager()
    return quantum_manager

# Store user tokens
user_tokens = {}

@app.route('/')
def index():
    return render_template('advanced_dashboard.html')

@app.route('/api/test')
def api_test():
    """Test endpoint to verify API is working"""
    try:
        qm = get_quantum_manager()
        return jsonify({
            "status": "API working",
            "quantum_manager_exists": qm is not None,
            "is_connected": qm.is_connected if qm else False,
            "timestamp": time.time()
        })
    except Exception as e:
        return jsonify({
            "status": "API error",
            "error": str(e),
            "timestamp": time.time()
        }), 500

@app.route('/api/status')
def get_status():
    """Get current connection status"""
    session_id = request.remote_addr
    if session_id not in user_tokens:
        return jsonify({
            "authenticated": False,
            "message": "No token provided"
        }), 401
    
    qm = get_quantum_manager()
    has_manager = qm is not None
    is_connected = has_manager and qm.is_connected
    
    backend_count = 0
    if is_connected:
        try:
            backend_count = len(qm.backend_data)
        except:
            pass
    
    return jsonify({
        "authenticated": True,
        "has_quantum_manager": has_manager,
        "is_connected": is_connected,
        "backend_count": backend_count,
        "message": "Connected to mock IBM Quantum" if is_connected else "Not connected"
    })

@app.route('/token', methods=['POST'])
def set_token():
    """Set IBM Quantum API token"""
    try:
        data = request.get_json()
        token = data.get('token', '').strip()
        crn = data.get('crn', '').strip()
        
        if not token:
            return jsonify({
                "success": False,
                "message": "Token is required"
            }), 400
        
        session_id = request.remote_addr
        user_tokens[session_id] = token
        
        if crn:
            user_tokens[f"{session_id}_crn"] = crn
        
        # Initialize quantum manager with user's token
        try:
            print("🔄 Initializing Mock Quantum Manager...")
            qm = get_quantum_manager()
            qm.connect_with_credentials(token, crn)
            print(f"Mock quantum manager connected for user {session_id}")
            
            return jsonify({
                "success": True, 
                "message": "Mock quantum manager initialized! Connected to IBM Quantum...",
                "connected": True,
                "initializing": True
            })
                
        except Exception as e:
            print(f"❌ Mock quantum manager initialization failed: {e}")
            return jsonify({
                "success": False,
                "message": f"Connection failed: {str(e)}",
                "connected": False
            }), 500
        
    except Exception as e:
        print(f"❌ Error in set_token: {e}")
        return jsonify({"error": f"Error setting token: {str(e)}"}), 500

@app.route('/api/metrics')
def api_metrics():
    """API endpoint for dashboard metrics"""
    try:
        qm = get_quantum_manager()
        if not qm.is_connected:
            return jsonify({
                "error": "Not connected to IBM Quantum",
                "connected": False
            }), 503
        
        metrics = qm.get_quantum_metrics()
        
        return jsonify({
            "connected": True,
            "metrics": metrics,
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in metrics API: {e}")
        return jsonify({
            "error": str(e),
            "connected": False
        }), 500

@app.route('/api/measurement_results')
def api_measurement_results():
    """API endpoint for measurement results"""
    try:
        qm = get_quantum_manager()
        if not qm.is_connected:
            return jsonify({
                "error": "Not connected to IBM Quantum",
                "connected": False
            }), 503
        
        results = qm.get_measurement_results()
        
        return jsonify({
            "connected": True,
            "results": results,
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in measurement results API: {e}")
        return jsonify({
            "error": str(e),
            "connected": False
        }), 500

@app.route('/api/entanglement_data')
def api_entanglement_data():
    """API endpoint for entanglement analysis"""
    try:
        qm = get_quantum_manager()
        if not qm.is_connected:
            return jsonify({
                "error": "Not connected to IBM Quantum",
                "connected": False
            }), 503
        
        entanglement_value = qm.calculate_entanglement()
        state_data = qm.get_quantum_state_data()
        
        return jsonify({
            "connected": True,
            "entanglement_value": entanglement_value,
            "fidelity": state_data.get("fidelity", 0.95),
            "bell_state": "|Φ⁺⟩",
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in entanglement API: {e}")
        return jsonify({
            "error": str(e),
            "connected": False
        }), 500

@app.route('/api/quantum_state_data')
def api_quantum_state_data():
    """API endpoint for quantum state data"""
    try:
        qm = get_quantum_manager()
        if not qm.is_connected:
            return jsonify({
                "error": "Not connected to IBM Quantum",
                "connected": False
            }), 503
        
        state_data = qm.get_quantum_state_data()
        
        return jsonify({
            "connected": True,
            "state_data": state_data,
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in quantum state data API: {e}")
        return jsonify({
            "error": str(e),
            "connected": False
        }), 500

@app.route('/api/circuit_data')
def api_circuit_data():
    """API endpoint for circuit data"""
    try:
        qm = get_quantum_manager()
        if not qm.is_connected:
            return jsonify({
                "error": "Not connected to IBM Quantum",
                "connected": False
            }), 503
        
        circuit_data = qm.generate_circuit_data()
        
        return jsonify({
            "connected": True,
            "circuit_data": circuit_data,
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in circuit data API: {e}")
        return jsonify({
            "error": str(e),
            "connected": False
        }), 500

@app.route('/api/backends')
def get_backends():
    """API endpoint to get backend data"""
    session_id = request.remote_addr
    if session_id not in user_tokens:
        return jsonify({
            "error": "Authentication required",
            "message": "Please provide your IBM Quantum API token first",
            "backends": [],
            "real_data": False
        }), 401
    
    qm = get_quantum_manager()
    if not qm.is_connected:
        return jsonify({
            "error": "Not connected to IBM Quantum",
            "message": "Please provide a valid IBM Quantum API token and ensure you are connected to IBM Quantum",
            "backends": [],
            "real_data": False,
            "connection_status": "disconnected"
        }), 503
    
    try:
        backend_data = qm.backend_data
        if not backend_data:
            return jsonify({
                "error": "No backends available",
                "message": "Unable to retrieve backend information from IBM Quantum",
                "backends": [],
                "real_data": False
            }), 404
        
        return jsonify({
            "connected": True,
            "backends": backend_data,
            "real_data": True,
            "connection_status": "connected",
            "timestamp": time.time()
        })
        
    except Exception as e:
        return jsonify({
            "error": "Failed to get backends",
            "message": f"Error retrieving backend data: {str(e)}",
            "backends": [],
            "real_data": False
        }), 500

@app.route('/api/jobs')
def get_jobs():
    """API endpoint to get job data"""
    session_id = request.remote_addr
    if session_id not in user_tokens:
        return jsonify({
            "error": "Authentication required",
            "message": "Please provide your IBM Quantum API token first",
            "jobs": [],
            "real_data": False
        }), 401
    
    try:
        qm = get_quantum_manager()
        if not qm.is_connected:
            return jsonify({
                "error": "Not connected to IBM Quantum",
                "message": "Please provide a valid IBM Quantum API token and ensure you are connected to IBM Quantum",
                "jobs": [],
                "real_data": False,
                "connection_status": "disconnected"
            }), 503
        
        jobs_data = qm.job_data
        
        return jsonify({
            "connected": True,
            "jobs": jobs_data,
            "real_data": True,
            "connection_status": "connected",
            "timestamp": time.time()
        })
        
    except Exception as e:
        return jsonify({
            "error": "Failed to get jobs",
            "message": f"Error retrieving job data: {str(e)}",
            "jobs": [],
            "real_data": False
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Test Quantum Dashboard...")
    print("📊 This is a mock version for testing the connection fixes")
    print("🌐 Open your browser and navigate to http://localhost:10000")
    print("🔑 Use any token (e.g., 'test123') to connect")
    
    app.run(host='0.0.0.0', port=10000, debug=True, threaded=True)
