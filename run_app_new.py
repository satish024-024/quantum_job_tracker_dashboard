#!/usr/bin/env python3
"""
Quantum Jobs Tracker - Direct Runner (New Version)
===============================================
A streamlined version that runs the quantum app directly without complex dependency checks.
"""

import os
import sys
import subprocess
import importlib.util

def smart_import_check():
    """Smart import check with fallback options"""
    print("🔍 Checking quantum packages...")

    required_packages = {
        'qiskit': 'Core quantum computing framework',
        'qiskit_ibm_runtime': 'IBM Quantum runtime service',
        'flask': 'Web framework',
        'numpy': 'Numerical computing'
    }

    missing_packages = []
    warnings = []

    for package, description in required_packages.items():
        try:
            # Try importing with different approaches
            if package == 'qiskit_ibm_provider':
                # Special handling for provider package
                try:
                    from qiskit_ibm_provider import IBMProvider
                    print(f"✅ {package}: {description}")
                except ImportError as e:
                    if 'ProviderV1' in str(e):
                        warnings.append(f"⚠️  {package}: Version compatibility issue - will use runtime only")
                    else:
                        missing_packages.append(package)
            else:
                __import__(package.replace("-", "_"))
                print(f"✅ {package}: {description}")
        except ImportError:
            missing_packages.append(package)

    if missing_packages:
        print("\n❌ Missing critical packages:")
        for pkg in missing_packages:
            print(f"   - {pkg}")
        return False

    if warnings:
        print("\n⚠️  Compatibility warnings:")
        for warning in warnings:
            print(f"   {warning}")

    return True

def run_app_direct():
    """Run the app directly using subprocess"""
    print("\n🚀 Starting Quantum Jobs Tracker (Direct Mode)...")

    app_path = "quantum_jobs_tracker/real_quantum_app.py"

    if not os.path.exists(app_path):
        print(f"❌ App file not found: {app_path}")
        return False

    try:
        print(f"📁 Running from: {os.path.abspath(app_path)}")
        print("🌐 App will be available at: http://localhost:10000")
        print("🔐 Enter IBM Quantum token in the web interface")
        print("=" * 50)

        # Run with optimized settings
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'

        result = subprocess.run([
            sys.executable, app_path
        ], env=env, cwd=os.getcwd())

        return result.returncode == 0

    except KeyboardInterrupt:
        print("\n\n🛑 Application stopped by user")
        return True
    except Exception as e:
        print(f"\n❌ Failed to start application: {e}")
        return False

def run_app_module():
    """Run the app as a Python module"""
    print("\n🚀 Starting Quantum Jobs Tracker (Module Mode)...")

    try:
        # Set up path
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

        # Import and run
        from quantum_jobs_tracker.real_quantum_app import app

        print("🌐 App will be available at: http://localhost:10000")
        print("🔐 Enter IBM Quantum token in the web interface")
        print("=" * 50)

        app.run(host="0.0.0.0", port=10000, debug=False)

    except KeyboardInterrupt:
        print("\n\n🛑 Application stopped by user")
    except Exception as e:
        print(f"\n❌ Failed to start application: {e}")
        return False

    return True

def show_help():
    """Show help information"""
    print("🚀 Quantum Jobs Tracker - New Version")
    print("=" * 40)
    print("Usage: python run_app_new.py [mode]")
    print()
    print("Modes:")
    print("  direct    - Run app directly using subprocess")
    print("  module    - Run app as Python module (default)")
    print("  help      - Show this help message")
    print()
    print("Examples:")
    print("  python run_app_new.py              # Auto mode with fallback")
    print("  python run_app_new.py module       # Module mode")
    print("  python run_app_new.py direct       # Direct mode")
    print("  python run_app_new.py help         # Show help")
    print()
    print("The app will be available at: http://localhost:10000")

def main():
    """Main function with multiple run modes"""
    print("🚀 Quantum Jobs Tracker - New Version")
    print("=" * 40)

    # Handle help request
    if len(sys.argv) > 1 and sys.argv[1].lower() in ['help', '--help', '-h']:
        show_help()
        return

    # Quick dependency check
    if not smart_import_check():
        print("\n💡 Tip: Run 'pip install -r requirements.txt' to install missing packages")
        sys.exit(1)

    # Choose run mode based on command line arguments
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
        if mode == 'direct':
            success = run_app_direct()
        elif mode == 'module':
            success = run_app_module()
        else:
            print(f"❌ Unknown mode: {mode}")
            print("Available modes: direct, module, help")
            print("\n💡 Use 'python run_app_new.py help' for more information")
            sys.exit(1)
    else:
        # Default mode - try module first, fallback to direct
        print("\n🎯 Using default mode (module with direct fallback)")
        try:
            success = run_app_module()
        except Exception:
            print("\n🔄 Falling back to direct mode...")
            success = run_app_direct()

    if success:
        print("\n✅ Application completed successfully")
    else:
        print("\n❌ Application failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
