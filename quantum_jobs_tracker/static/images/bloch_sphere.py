from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.visualization import plot_bloch_multivector
import matplotlib.pyplot as plt
import os

# Create a quantum circuit with 1 qubit
qc = QuantumCircuit(1)

# Apply gates to create interesting state on the Bloch sphere
qc.h(0)      # Hadamard puts the qubit in superposition on the equator
qc.p(0.5, 0) # Phase rotation around Z-axis

# Get the statevector
state = Statevector.from_instruction(qc)

# Create the Bloch sphere visualization
fig = plt.figure(figsize=(10, 10))
plot_bloch_multivector(state, title="Quantum State on Bloch Sphere")

# Ensure the image directory exists
os.makedirs('../static/images', exist_ok=True)

# Save to the correct location
plt.savefig('../static/images/bloch_sphere.png')
print("Bloch sphere visualization saved to ../static/images/bloch_sphere.png")
