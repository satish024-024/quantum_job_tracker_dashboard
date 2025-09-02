"""
Real Quantum Jobs Tracker
------------------------
This script runs the Quantum Jobs Tracker with real quantum computing functionality.
To use real IBM Quantum computers, add your API token in the real_quantum_app.py file.
"""

import os
import sys

# Set the path to find the quantum_jobs_tracker package
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the application
from quantum_jobs_tracker.real_quantum_app import app

if __name__ == '__main__':
    print("Starting Quantum Jobs Tracker with Real Quantum Computing Support...")
    print("To connect to real IBM Quantum computers, add your API token in quantum_jobs_tracker/real_quantum_app.py")
    port = int(os.environ.get("PORT", 10000))
    print(f"Open your browser and navigate to http://localhost:{port}")
    # Start the Flask app on 0.0.0.0 and correct port for Render
    app.run(host="0.0.0.0", port=port, debug=False)  # Fixed: Disabled debug mode for production security
