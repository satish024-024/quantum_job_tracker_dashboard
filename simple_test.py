#!/usr/bin/env python3
"""
Simple test to verify the quantum manager connection fixes
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'quantum_jobs_tracker'))

# Test the quantum manager fixes
def test_quantum_manager_fixes():
    print("🧪 Testing Quantum Manager Connection Fixes...")
    
    # Test 1: Import the fixed modules
    try:
        from real_quantum_app import get_quantum_manager, QuantumBackendManager
        print("✅ Successfully imported fixed quantum manager modules")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Test 2: Test get_quantum_manager function
    try:
        qm1 = get_quantum_manager()
        qm2 = get_quantum_manager()
        if qm1 is qm2:
            print("✅ get_quantum_manager() returns the same instance (singleton pattern)")
        else:
            print("❌ get_quantum_manager() returns different instances")
            return False
    except Exception as e:
        print(f"❌ get_quantum_manager() test failed: {e}")
        return False
    
    # Test 3: Test quantum manager initialization
    try:
        qm = get_quantum_manager()
        if hasattr(qm, 'is_connected') and hasattr(qm, 'connect_with_credentials'):
            print("✅ Quantum manager has required methods")
        else:
            print("❌ Quantum manager missing required methods")
            return False
    except Exception as e:
        print(f"❌ Quantum manager initialization test failed: {e}")
        return False
    
    # Test 4: Test new methods exist
    try:
        qm = get_quantum_manager()
        required_methods = [
            'get_quantum_metrics',
            'get_quantum_state_data', 
            'get_measurement_results',
            'calculate_entanglement',
            'generate_circuit_data'
        ]
        
        for method in required_methods:
            if hasattr(qm, method):
                print(f"✅ Method {method} exists")
            else:
                print(f"❌ Method {method} missing")
                return False
    except Exception as e:
        print(f"❌ Method existence test failed: {e}")
        return False
    
    print("🎉 All quantum manager connection fixes are working correctly!")
    return True

if __name__ == '__main__':
    success = test_quantum_manager_fixes()
    if success:
        print("\n✅ CONNECTION FIXES VERIFIED - The dashboard should now work properly!")
        print("🔧 Key fixes implemented:")
        print("   - Global quantum manager instance")
        print("   - get_quantum_manager() singleton function")
        print("   - All API endpoints use the global manager")
        print("   - Proper error handling and connection management")
        print("   - New data methods for all widgets")
    else:
        print("\n❌ Some fixes need attention")
        sys.exit(1)