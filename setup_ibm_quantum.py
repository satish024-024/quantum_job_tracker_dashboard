#!/usr/bin/env python3
"""
IBM Quantum Setup Script
This script will install all necessary dependencies and test the connection to IBM Quantum.
"""

import subprocess
import sys
import os
import time

def run_command(command, description):
    """Run a command and handle errors gracefully"""
    print(f"\n🔧 {description}...")
    print(f"Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with error code {e.returncode}")
        if e.stdout:
            print(f"stdout: {e.stdout.strip()}")
        if e.stderr:
            print(f"stderr: {e.stderr.strip()}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} is not supported. Please use Python 3.8 or higher.")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install all required dependencies"""
    print("\n📦 Installing dependencies...")
    
    # Upgrade pip first
    if not run_command("python -m pip install --upgrade pip", "Upgrading pip"):
        print("⚠️ Warning: Failed to upgrade pip, continuing...")
    
    # Install core requirements
    if not run_command("pip install -r requirements.txt", "Installing core requirements"):
        return False
    
    # Install additional packages that might be needed
    additional_packages = [
        "qiskit[visualization]",
        "qiskit-ibm-provider",
        "qiskit-ibm-runtime"
    ]
    
    for package in additional_packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            print(f"⚠️ Warning: Failed to install {package}, continuing...")
    
    return True

def test_imports():
    """Test if all required packages can be imported"""
    print("\n🧪 Testing package imports...")
    
    required_packages = [
        "qiskit",
        "qiskit_ibm_provider", 
        "qiskit_ibm_runtime",
        "flask",
        "numpy",
        "matplotlib"
    ]
    
    failed_imports = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package} imported successfully")
        except ImportError as e:
            print(f"❌ Failed to import {package}: {e}")
            failed_imports.append(package)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        return False
    
    print("✅ All packages imported successfully")
    return True

def create_test_script():
    """Create a test script to verify IBM Quantum connection"""
    test_script = '''#!/usr/bin/env python3
"""
Test IBM Quantum Connection
This script tests the connection to IBM Quantum using your API token.
"""

import sys
import os

def test_ibm_connection():
    """Test connection to IBM Quantum"""
    print("🔗 Testing IBM Quantum connection...")
    
    try:
        # Import required packages
        from qiskit_ibm_provider import IBMProvider
        from qiskit_ibm_runtime import QiskitRuntimeService
        print("✅ Qiskit packages imported successfully")
        
        # Get API token from user
        token = input("Enter your IBM Quantum API token: ").strip()
        if not token:
            print("❌ No token provided")
            return False
        
        print("🔐 Testing with IBM Quantum Experience...")
        try:
            provider = IBMProvider(token=token)
            backends = provider.backends()
            print(f"✅ Connected to IBM Quantum Experience! Found {len(backends)} backends")
            
            # Show available backends
            for i, backend in enumerate(backends[:5]):  # Show first 5
                backend_name = backend.name if hasattr(backend, 'name') else str(backend)
                print(f"   {i+1}. {backend_name}")
            
            return True
            
        except Exception as e:
            print(f"❌ IBM Quantum Experience connection failed: {e}")
            
            print("🔐 Trying IBM Cloud Quantum Runtime...")
            try:
                service = QiskitRuntimeService(channel="ibm_cloud", token=token)
                backends = service.backends()
                print(f"✅ Connected to IBM Cloud Quantum! Found {len(backends)} backends")
                
                # Show available backends
                for i, backend in enumerate(backends[:5]):  # Show first 5
                    backend_name = backend.name if hasattr(backend, 'name') else str(backend)
                    print(f"   {i+1}. {backend_name}")
                
                return True
                
            except Exception as e2:
                print(f"❌ IBM Cloud Quantum connection failed: {e2}")
                return False
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Please install required packages: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_ibm_connection()
    if success:
        print("\\n🎉 IBM Quantum connection test successful!")
        print("You can now run the main application.")
    else:
        print("\\n❌ IBM Quantum connection test failed.")
        print("Please check your API token and internet connection.")
        sys.exit(1)
'''
    
    with open("test_ibm_connection.py", "w") as f:
        f.write(test_script)
    
    print("✅ Created test_ibm_connection.py")
    return True

def create_environment_file():
    """Create environment file template"""
    env_content = """# IBM Quantum Configuration
# Copy this file to .env and fill in your actual values

# Your IBM Quantum API token (get from https://quantum-computing.ibm.com/account)
IBM_QUANTUM_TOKEN=your_api_token_here

# Optional: IBM Cloud CRN (if using IBM Cloud Quantum)
IBM_QUANTUM_CRN=your_crn_here

# Application settings
DEBUG=False
PORT=10000
HOST=0.0.0.0

# Security settings
SECRET_KEY=your_secret_key_here
"""
    
    with open("env_example.txt", "w") as f:
        f.write(env_content)
    
    print("✅ Created env_example.txt")
    return True

def main():
    """Main setup function"""
    print("🚀 IBM Quantum Setup Script")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Test imports
    if not test_imports():
        print("❌ Package import test failed")
        sys.exit(1)
    
    # Create test script
    create_test_script()
    
    # Create environment file
    create_environment_file()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Get your IBM Quantum API token from: https://quantum-computing.ibm.com/account")
    print("2. Test your connection: python test_ibm_connection.py")
    print("3. Run the main application: python quantum_jobs_tracker/real_quantum_app.py")
    print("\n📚 For help, see the README files in the project directory")
    
    return True

if __name__ == "__main__":
    main()
