from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt
import os

# Create a quantum circuit with 3 qubits
qc = QuantumCircuit(3, 3)

# Create a GHZ state (maximally entangled state)
qc.h(0)      # Hadamard on first qubit
qc.cx(0, 1)  # CNOT to entangle first and second qubits
qc.cx(0, 2)  # CNOT to entangle first and third qubits

# Measure all qubits
qc.measure([0, 1, 2], [0, 1, 2])

# Run the circuit on the AerSimulator
simulator = AerSimulator()
result = simulator.run(qc, shots=1024).result()
counts = result.get_counts(qc)

# Plot the histogram
fig = plt.figure(figsize=(12, 8))
plot_histogram(counts, 
               title="Quantum Measurement Results (1024 shots)", 
               color=['#3498db', '#9b59b6'],
               figsize=(12, 8))

# Ensure the image directory exists
os.makedirs('../static/images', exist_ok=True)

# Save to the correct location
plt.savefig('../static/images/measurement_histogram.png')
print("Measurement histogram saved to ../static/images/measurement_histogram.png")
