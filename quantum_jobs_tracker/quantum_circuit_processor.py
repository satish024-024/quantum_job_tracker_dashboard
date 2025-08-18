import qiskit
from qiskit import QuantumCircuit, execute, Aer
from qiskit.visualization import plot_histogram, plot_bloch_multivector
from qiskit.quantum_info import Statevector
import numpy as np
import matplotlib.pyplot as plt
import io
import base64

class QuantumCircuitProcessor:
    """
    A class to create and manipulate quantum circuits for data processing
    and visualization in the quantum jobs tracker.
    """
    
    def __init__(self):
        """Initialize the quantum circuit processor."""
        self.simulator = Aer.get_backend('statevector_simulator')
        self.qasm_sim = Aer.get_backend('qasm_simulator')
        
    def encode_backend_data(self, backend_data):
        """
        Encode backend data into a quantum state.
        
        Args:
            backend_data (dict): Dictionary containing backend information
            
        Returns:
            dict: Results of quantum processing including circuit and visualization
        """
        # Determine number of qubits needed based on data complexity
        num_qubits = 3
        
        # Create a quantum circuit
        qc = QuantumCircuit(num_qubits)
        
        # Encode backend operational status in first qubit
        if backend_data.get("operational", False):
            qc.x(0)
        
        # Encode backend status (active/inactive) in second qubit
        if backend_data.get("status", "") == "active":
            qc.x(1)
        
        # Encode pending jobs information in third qubit
        # If more than threshold jobs, set to |1⟩, otherwise |0⟩
        pending_jobs = backend_data.get("pending_jobs", 0)
        if pending_jobs > 3:
            qc.x(2)
            
        # Apply Hadamard gates to create superposition
        # This represents the quantum nature of the system
        qc.h(range(num_qubits))
        
        # Apply entanglement between qubits
        qc.cx(0, 1)
        qc.cx(1, 2)
        
        # Execute circuit on simulator
        job = execute(qc, self.simulator)
        result = job.result()
        
        # Get statevector
        statevector = result.get_statevector(qc)
        
        # Create measurement circuit for visualization
        qc_meas = qc.copy()
        qc_meas.measure_all()
        
        # Execute measurement circuit
        counts = execute(qc_meas, self.qasm_sim, shots=1024).result().get_counts()
        
        # Generate visualizations
        bloch_img = self._generate_bloch_visualization(statevector)
        histogram_img = self._generate_histogram_visualization(counts)
        
        return {
            "circuit": qc,
            "statevector": statevector,
            "counts": counts,
            "bloch_visualization": bloch_img,
            "histogram_visualization": histogram_img,
            "encoded_data": backend_data
        }
    
    def process_jobs_data(self, jobs_data):
        """
        Process jobs data using quantum algorithms.
        
        Args:
            jobs_data (list): List of jobs
            
        Returns:
            dict: Results of quantum processing
        """
        # Count jobs by status
        status_counts = {}
        for job in jobs_data:
            status = job.get("status", "UNKNOWN")
            if status in status_counts:
                status_counts[status] += 1
            else:
                status_counts[status] = 1
                
        # Determine number of qubits needed based on unique statuses
        num_qubits = max(2, len(status_counts))
        
        # Create quantum circuit
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        # Apply gates based on job statuses
        for i, (status, count) in enumerate(status_counts.items()):
            if i < num_qubits:
                # Normalize the count and apply rotation
                if count > 0:
                    angle = min(np.pi * count / max(status_counts.values()), np.pi)
                    qc.ry(angle, i)
        
        # Apply entanglement
        for i in range(num_qubits-1):
            qc.cx(i, i+1)
            
        # Add measurement
        qc.measure(range(num_qubits), range(num_qubits))
        
        # Execute circuit
        job = execute(qc, self.qasm_sim, shots=1024)
        result = job.result()
        counts = result.get_counts(qc)
        
        # Create visualization
        histogram_img = self._generate_histogram_visualization(counts)
        
        return {
            "circuit": qc,
            "counts": counts,
            "visualization": histogram_img,
            "status_distribution": status_counts
        }
        
    def _generate_bloch_visualization(self, statevector):
        """Generate Bloch sphere visualization of quantum state."""
        plt.figure(figsize=(5, 5))
        plot_bloch_multivector(statevector)
        
        # Save figure to base64 string
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_str
        
    def _generate_histogram_visualization(self, counts):
        """Generate histogram visualization of quantum measurement outcomes."""
        plt.figure(figsize=(6, 4))
        plot_histogram(counts)
        
        # Save figure to base64 string
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return img_str
        
    def create_quantum_dashboard_state(self, backends, jobs):
        """
        Create a quantum state that represents the entire dashboard.
        
        Args:
            backends (list): List of backend data
            jobs (list): List of jobs data
            
        Returns:
            dict: Dashboard quantum state
        """
        # Count active and inactive backends
        active_backends = sum(1 for b in backends if b.get("status") == "active" and b.get("operational", False))
        inactive_backends = len(backends) - active_backends
        
        # Count jobs by status
        running_jobs = sum(1 for j in jobs if j.get("status") == "RUNNING")
        queued_jobs = sum(1 for j in jobs if j.get("status") == "QUEUED")
        
        # Create 4-qubit system
        qc = QuantumCircuit(4)
        
        # Encode data into amplitudes
        # Qubit 0: Backend availability ratio
        if len(backends) > 0:
            angle = np.pi * active_backends / len(backends)
            qc.ry(angle, 0)
            
        # Qubit 1: Job execution ratio
        if len(jobs) > 0:
            angle = np.pi * running_jobs / len(jobs)
            qc.ry(angle, 1)
            
        # Qubit 2: Job queue ratio
        if len(jobs) > 0:
            angle = np.pi * queued_jobs / len(jobs)
            qc.ry(angle, 2)
            
        # Qubit 3: Overall system activity
        system_activity = 0
        if len(backends) > 0 and len(jobs) > 0:
            system_activity = (active_backends / len(backends) + running_jobs / len(jobs)) / 2
        angle = np.pi * system_activity
        qc.ry(angle, 3)
        
        # Add entanglement
        qc.cx(0, 1)
        qc.cx(1, 2)
        qc.cx(2, 3)
        
        # Create measurement circuit
        qc_meas = qc.copy()
        qc_meas.measure_all()
        
        # Execute circuits
        statevector = execute(qc, self.simulator).result().get_statevector(qc)
        counts = execute(qc_meas, self.qasm_sim, shots=1024).result().get_counts()
        
        # Generate visualizations
        bloch_img = self._generate_bloch_visualization(statevector)
        histogram_img = self._generate_histogram_visualization(counts)
        
        return {
            "circuit": qc,
            "statevector": statevector,
            "counts": counts,
            "bloch_visualization": bloch_img,
            "histogram_visualization": histogram_img,
            "dashboard_metrics": {
                "active_backends": active_backends,
                "inactive_backends": inactive_backends,
                "running_jobs": running_jobs,
                "queued_jobs": queued_jobs,
                "system_activity": system_activity
            }
        }
