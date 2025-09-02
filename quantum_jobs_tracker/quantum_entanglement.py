"""
Quantum Entanglement Metrics Module
Implements various measures of quantum entanglement and correlation.
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator, partial_trace
from qiskit.quantum_info.operators import Pauli
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuantumEntanglementMetrics:
    """Implements various quantum entanglement measures."""
    
    def __init__(self):
        # No backend needed for theoretical calculations
        pass
    
    def calculate_concurrence(self, density_matrix):
        """
        Calculate the concurrence for a 2-qubit system.
        
        Args:
            density_matrix (np.ndarray): 4x4 density matrix
            
        Returns:
            float: Concurrence value (0 to 1)
        """
        try:
            if density_matrix.shape != (4, 4):
                raise ValueError("Density matrix must be 4x4 for 2-qubit system")
            
            # Calculate spin-flipped density matrix
            sigma_y = np.array([[0, -1j], [1j, 0]])
            sigma_y_tensor = np.kron(sigma_y, sigma_y)
            
            rho_tilde = sigma_y_tensor @ density_matrix.conj() @ sigma_y_tensor
            
            # Calculate eigenvalues of rho * rho_tilde
            product = density_matrix @ rho_tilde
            eigenvalues = np.linalg.eigvals(product)
            
            # Sort eigenvalues in descending order and ensure they're real
            eigenvalues = np.sort(np.real(eigenvalues))[::-1]
            
            # Calculate concurrence - ensure all eigenvalues are non-negative
            eigenvalues = np.maximum(eigenvalues, 0)
            concurrence = max(0, 
                            np.sqrt(eigenvalues[0]) - 
                            np.sqrt(eigenvalues[1]) - 
                            np.sqrt(eigenvalues[2]) - 
                            np.sqrt(eigenvalues[3]))
            
            return float(concurrence)
            
        except Exception as e:
            logger.error(f"Error calculating concurrence: {e}")
            return None
    
    def calculate_negativity(self, density_matrix, partition):
        """
        Calculate the negativity for a bipartite system.
        
        Args:
            density_matrix (np.ndarray): Density matrix
            partition (tuple): Partition of qubits (e.g., (0,), (1,2,3))
            
        Returns:
            float: Negativity value
        """
        try:
            # Calculate partial transpose
            pt_matrix = self._partial_transpose(density_matrix, partition)
            
            # Calculate eigenvalues and handle complex values properly
            eigenvalues = np.linalg.eigvals(pt_matrix)
            
            # Sum negative eigenvalues (take real part for numerical stability)
            negativity = sum(abs(np.real(eigenvalue)) for eigenvalue in eigenvalues if np.real(eigenvalue) < 0)
            
            return float(negativity / 2)
            
        except Exception as e:
            logger.error(f"Error calculating negativity: {e}")
            return None
    
    def calculate_von_neumann_entropy(self, density_matrix):
        """
        Calculate von Neumann entropy of a quantum state.
        
        Args:
            density_matrix (np.ndarray): Density matrix
            
        Returns:
            float: Entropy value
        """
        try:
            # Calculate eigenvalues and handle complex values properly
            eigenvalues = np.linalg.eigvals(density_matrix)
            
            # Take real part for numerical stability
            eigenvalues = np.real(eigenvalues)
            
            # Filter out zero eigenvalues and calculate entropy
            entropy = 0
            for eigenvalue in eigenvalues:
                if eigenvalue > 1e-10:  # Avoid log(0)
                    entropy -= eigenvalue * np.log2(eigenvalue)
            
            return float(entropy)
            
        except Exception as e:
            logger.error(f"Error calculating von Neumann entropy: {e}")
            return None
    
    def calculate_mutual_information(self, density_matrix, partition_a, partition_b):
        """
        Calculate mutual information between two partitions.
        
        Args:
            density_matrix (np.ndarray): Full density matrix
            partition_a (tuple): First partition
            partition_b (tuple): Second partition
            
        Returns:
            float: Mutual information
        """
        try:
            # Calculate reduced density matrices
            rho_a = self._partial_trace(density_matrix, partition_b)
            rho_b = self._partial_trace(density_matrix, partition_a)
            
            # Calculate entropies
            entropy_a = self.calculate_von_neumann_entropy(rho_a)
            entropy_b = self.calculate_von_neumann_entropy(rho_b)
            entropy_ab = self.calculate_von_neumann_entropy(density_matrix)
            
            if entropy_a is None or entropy_b is None or entropy_ab is None:
                return None
            
            # Mutual information: I(A:B) = S(A) + S(B) - S(AB)
            mutual_info = entropy_a + entropy_b - entropy_ab
            
            return float(mutual_info)
            
        except Exception as e:
            logger.error(f"Error calculating mutual information: {e}")
            return None
    
    def calculate_geometric_measure(self, state_vector):
        """
        Calculate geometric measure of entanglement.
        
        Args:
            state_vector (np.ndarray): State vector
            
        Returns:
            float: Geometric measure
        """
        try:
            # Normalize state vector
            state_vector = state_vector / np.linalg.norm(state_vector)
            
            # For 2-qubit system, find closest separable state
            if len(state_vector) == 4:
                return self._optimized_geometric_measure_2qubit(state_vector)
            else:
                # For larger systems, use approximation
                return self._approximate_geometric_measure(state_vector)
                
        except Exception as e:
            logger.error(f"Error calculating geometric measure: {e}")
            return None
    
    def _optimized_geometric_measure_2qubit(self, state_vector):
        """Optimized geometric measure calculation for 2-qubit systems."""
        try:
            # Use more efficient parameterization for separable states
            min_distance = float('inf')
            
            # Optimize grid search with adaptive resolution
            theta_steps = 50
            phi_steps = 50
            
            for i in range(theta_steps):
                theta = 2 * np.pi * i / theta_steps
                for j in range(phi_steps):
                    phi = 2 * np.pi * j / phi_steps
                    
                    # Create properly normalized separable state
                    cos_theta_2 = np.cos(theta / 2)
                    sin_theta_2 = np.sin(theta / 2)
                    cos_phi_2 = np.cos(phi / 2)
                    sin_phi_2 = np.sin(phi / 2)
                    
                    # Ensure proper normalization
                    separable_state = np.array([
                        cos_theta_2 * cos_phi_2,
                        cos_theta_2 * sin_phi_2,
                        sin_theta_2 * cos_phi_2,
                        sin_theta_2 * sin_phi_2
                    ])
                    
                    # Normalize to ensure unit norm
                    separable_state = separable_state / np.linalg.norm(separable_state)
                    
                    # Calculate distance
                    distance = np.linalg.norm(state_vector - separable_state)
                    min_distance = min(min_distance, distance)
            
            return float(min_distance)
            
        except Exception as e:
            logger.error(f"Error in optimized geometric measure: {e}")
            return None
    
    def create_bell_state(self, bell_state_type='phi_plus'):
        """
        Create different types of Bell states.
        
        Args:
            bell_state_type (str): Type of Bell state ('phi_plus', 'phi_minus', 'psi_plus', 'psi_minus')
            
        Returns:
            QuantumCircuit: Circuit creating the Bell state
        """
        try:
            qc = QuantumCircuit(2, 2)
            
            if bell_state_type == 'phi_plus':
                qc.h(0)
                qc.cx(0, 1)
            elif bell_state_type == 'phi_minus':
                qc.h(0)
                qc.cx(0, 1)
                qc.z(0)
            elif bell_state_type == 'psi_plus':
                qc.h(0)
                qc.cx(0, 1)
                qc.x(1)
            elif bell_state_type == 'psi_minus':
                qc.h(0)
                qc.cx(0, 1)
                qc.x(1)
                qc.z(0)
            else:
                raise ValueError(f"Unknown Bell state type: {bell_state_type}")
            
            return qc
            
        except Exception as e:
            logger.error(f"Error creating Bell state: {e}")
            return None
    
    def measure_entanglement_witness(self, circuit, witness_operator):
        """
        Measure an entanglement witness operator.
        
        Args:
            circuit (QuantumCircuit): Quantum circuit
            witness_operator (np.ndarray): Witness operator matrix
            
        Returns:
            float: Expectation value of the witness
        """
        try:
            # Get state vector from circuit using theoretical calculation
            state_vector = Statevector.from_instruction(circuit)
            
            # Calculate expectation value
            expectation = np.real(np.conj(state_vector.data) @ witness_operator @ state_vector.data)
            
            return float(expectation)
            
        except Exception as e:
            logger.error(f"Error measuring entanglement witness: {e}")
            return None
    
    def _partial_transpose(self, density_matrix, partition):
        """Calculate partial transpose with respect to a partition."""
        try:
            n_qubits = int(np.log2(density_matrix.shape[0]))
            
            # For 2-qubit system, implement proper partial transpose
            if n_qubits == 2:
                pt_matrix = density_matrix.copy()
                
                # Partial transpose with respect to qubit 0 (first qubit)
                if 0 in partition:
                    # Swap elements (0,1) with (2,3) and (1,0) with (3,2)
                    pt_matrix[[1, 2], :] = pt_matrix[[2, 1], :]
                    pt_matrix[:, [1, 2]] = pt_matrix[:, [2, 1]]
                # Partial transpose with respect to qubit 1 (second qubit)
                elif 1 in partition:
                    # Swap elements (0,2) with (1,3) and (2,0) with (3,1)
                    pt_matrix[[2, 3], :] = pt_matrix[[3, 2], :]
                    pt_matrix[:, [2, 3]] = pt_matrix[:, [3, 2]]
                
                return pt_matrix
            else:
                # For larger systems, implement general partial transpose
                return self._general_partial_transpose(density_matrix, partition)
                
        except Exception as e:
            logger.error(f"Error in partial transpose: {e}")
            return density_matrix
    
    def _partial_trace(self, density_matrix, partition):
        """Calculate partial trace over specified qubits."""
        try:
            # Use qiskit's built-in partial_trace for better accuracy
            if hasattr(partial_trace, '__call__'):
                # Convert to qiskit format if needed
                return partial_trace(density_matrix, partition).data
            
            # Fallback implementation for 2-qubit system
            if density_matrix.shape == (4, 4):
                # Trace over second qubit
                if 1 in partition:
                    rho_reduced = np.zeros((2, 2), dtype=complex)
                    rho_reduced[0, 0] = density_matrix[0, 0] + density_matrix[1, 1]
                    rho_reduced[0, 1] = density_matrix[0, 2] + density_matrix[1, 3]
                    rho_reduced[1, 0] = density_matrix[2, 0] + density_matrix[3, 1]
                    rho_reduced[1, 1] = density_matrix[2, 2] + density_matrix[3, 3]
                    return rho_reduced
                # Trace over first qubit
                elif 0 in partition:
                    rho_reduced = np.zeros((2, 2), dtype=complex)
                    rho_reduced[0, 0] = density_matrix[0, 0] + density_matrix[2, 2]
                    rho_reduced[0, 1] = density_matrix[0, 1] + density_matrix[2, 3]
                    rho_reduced[1, 0] = density_matrix[1, 0] + density_matrix[3, 2]
                    rho_reduced[1, 1] = density_matrix[1, 1] + density_matrix[3, 3]
                    return rho_reduced
            
            return density_matrix
            
        except Exception as e:
            logger.error(f"Error in partial trace: {e}")
            return density_matrix
    
    def _approximate_geometric_measure(self, state_vector):
        """Approximate geometric measure for larger systems."""
        try:
            # Use more efficient random sampling with proper normalization
            n_samples = 2000
            min_distance = float('inf')
            
            for _ in range(n_samples):
                # Generate random separable state with proper normalization
                # Use spherical coordinates for better distribution
                angles = np.random.uniform(0, 2*np.pi, len(state_vector)-1)
                
                separable_state = np.ones(len(state_vector), dtype=complex)
                for i in range(len(state_vector)-1):
                    separable_state[i] = np.cos(angles[i])
                    separable_state[i+1:] *= np.sin(angles[i])
                
                # Ensure proper normalization
                separable_state = separable_state / np.linalg.norm(separable_state)
                
                # Calculate distance
                distance = np.linalg.norm(state_vector - separable_state)
                min_distance = min(min_distance, distance)
            
            return float(min_distance)
            
        except Exception as e:
            logger.error(f"Error in approximate geometric measure: {e}")
            return None
    
    def _general_partial_transpose(self, density_matrix, partition):
        """General partial transpose for larger systems."""
        try:
            # Implement general partial transpose for n-qubit systems
            n_qubits = int(np.log2(density_matrix.shape[0]))
            dim = density_matrix.shape[0]
            
            # Create new matrix for partial transpose
            pt_matrix = np.zeros_like(density_matrix)
            
            # For each basis state, calculate the partial transpose
            for i in range(dim):
                for j in range(dim):
                    # Convert indices to binary representation
                    i_bin = format(i, f'0{n_qubits}b')
                    j_bin = format(j, f'0{n_qubits}b')
                    
                    # Create new indices with transposed qubits in partition
                    new_i_bin = list(i_bin)
                    new_j_bin = list(j_bin)
                    
                    for qubit in partition:
                        if qubit < n_qubits:
                            # Swap the qubit values
                            new_i_bin[qubit], new_j_bin[qubit] = new_j_bin[qubit], new_i_bin[qubit]
                    
                    # Convert back to decimal indices
                    new_i = int(''.join(new_i_bin), 2)
                    new_j = int(''.join(new_j_bin), 2)
                    
                    pt_matrix[new_i, new_j] = density_matrix[i, j]
            
            return pt_matrix
            
        except Exception as e:
            logger.error(f"Error in general partial transpose: {e}")
            return density_matrix

class EntanglementVerification:
    """Verifies entanglement properties of quantum states."""
    
    def __init__(self):
        self.metrics = QuantumEntanglementMetrics()
    
    def verify_bell_state(self, circuit):
        """
        Verify that a circuit produces a Bell state.
        
        Args:
            circuit (QuantumCircuit): Circuit to verify
            
        Returns:
            dict: Verification results
        """
        try:
            # Get state vector from circuit using theoretical calculation
            state_vector = Statevector.from_instruction(circuit)
            
            # Calculate density matrix
            density_matrix = np.outer(state_vector.data, state_vector.data.conj())
            
            # Calculate various measures
            concurrence = self.metrics.calculate_concurrence(density_matrix)
            negativity = self.metrics.calculate_negativity(density_matrix, (0,))
            entropy = self.metrics.calculate_von_neumann_entropy(density_matrix)
            
            # Check if it's maximally entangled
            is_maximally_entangled = concurrence is not None and concurrence > 0.99
            
            return {
                'concurrence': concurrence,
                'negativity': negativity,
                'entropy': entropy,
                'is_maximally_entangled': is_maximally_entangled,
                'state_vector': state_vector.data
            }
            
        except Exception as e:
            logger.error(f"Error verifying Bell state: {e}")
            return None
    
    def compare_entanglement_measures(self, circuit1, circuit2):
        """
        Compare entanglement measures between two circuits.
        
        Args:
            circuit1 (QuantumCircuit): First circuit
            circuit2 (QuantumCircuit): Second circuit
            
        Returns:
            dict: Comparison results
        """
        try:
            # Get measures for both circuits
            measures1 = self.verify_bell_state(circuit1)
            measures2 = self.verify_bell_state(circuit2)
            
            if measures1 and measures2:
                return {
                    'circuit1': measures1,
                    'circuit2': measures2,
                    'concurrence_diff': abs(measures1['concurrence'] - measures2['concurrence']) if measures1['concurrence'] is not None and measures2['concurrence'] is not None else None,
                    'negativity_diff': abs(measures1['negativity'] - measures2['negativity']) if measures1['negativity'] is not None and measures2['negativity'] is not None else None,
                    'entropy_diff': abs(measures1['entropy'] - measures2['entropy']) if measures1['entropy'] is not None and measures2['entropy'] is not None else None
                }
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error comparing entanglement measures: {e}")
            return None
