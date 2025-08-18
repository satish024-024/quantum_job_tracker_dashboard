import sys
import os

# Add the project root directory to Python's path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import directly from the file, not as a module
from quantum_jobs_tracker.quantum_circuit_processor import QuantumCircuitProcessor
from quantum_jobs_tracker.app import app

if __name__ == '__main__':
    print("Starting Quantum Jobs Tracker Dashboard...")
    print("Open your browser and navigate to http://localhost:5000")
    app.run(debug=True)
