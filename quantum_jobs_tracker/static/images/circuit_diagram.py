from qiskit import QuantumCircuit
import matplotlib.pyplot as plt
from qiskit.visualization import circuit_drawer
import os

# Create a quantum circuit with 5 qubits
qc = QuantumCircuit(5, 5)

# Apply Hadamard gates to first 3 qubits to create superposition
qc.h(0)
qc.h(1)
qc.h(2)

# Apply CNOT gates to create entanglement
qc.cx(0, 3)
qc.cx(1, 3)
qc.cx(2, 4)

# Add measurement operations
qc.measure([0, 1, 2, 3, 4], [0, 1, 2, 3, 4])

# Draw the circuit and save as PNG
circuit_drawer(qc, output='mpl', filename='circuit_diagram.png')

# Ensure the image directory exists
os.makedirs('../static/images', exist_ok=True)

# Save to the correct location
plt.savefig('../static/images/circuit_diagram.png')
print("Circuit diagram saved to ../static/images/circuit_diagram.png")
