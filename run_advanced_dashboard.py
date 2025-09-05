#!/usr/bin/env python3
"""
Quantum Jobs Tracker - Advanced Dashboard Runner
===============================================
Runs the Advanced Dashboard with 3D visualizations and enhanced features
"""

import os
import sys
import subprocess
import importlib.util

def smart_import_check():
    """Smart import check with fallback options"""
    print("🔍 Checking quantum packages for Advanced Dashboard...")

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
            if package == 'qiskit_ibm_provider':
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

def run_advanced_dashboard():
    """Run the Advanced Dashboard with 3D visualizations"""
    print("\n🚀 Starting Advanced Quantum Dashboard...")
    print("🎯 Advanced Dashboard with 3D Visualizations")
    print("🎨 Features: Enhanced 3D circuits, glossy finish, advanced analytics")

    app_path = "quantum_jobs_tracker/real_quantum_app.py"

    if not os.path.exists(app_path):
        print(f"❌ App file not found: {app_path}")
        return False

    try:
        print(f"📁 Running from: {os.path.abspath(app_path)}")
        print("🌐 Dashboard will be available at: http://localhost:10000/advanced")
        print("🔐 Enter IBM Quantum API token when prompted")
        print("=" * 60)
        print("🎯 ADVANCED DASHBOARD FEATURES:")
        print("   • Enhanced 3D quantum circuit visualizations")
        print("   • Real-time job monitoring with advanced analytics")
        print("   • Interactive Bloch sphere plots")
        print("   • Customizable widget system")
        print("   • Enhanced notification system")
        print("   • Backend comparison tools")
        print("   • Professional glossy UI design")
        print("=" * 60)

        # Run with optimized settings
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'
        env['DASHBOARD_TYPE'] = 'advanced'

        result = subprocess.run([
            sys.executable, app_path
        ], env=env, cwd=os.getcwd())

        return result.returncode == 0

    except KeyboardInterrupt:
        print("\n\n🛑 Advanced Dashboard stopped by user")
        return True
    except Exception as e:
        print(f"\n❌ Failed to start Advanced Dashboard: {e}")
        return False

def main():
    """Main function for Advanced Dashboard"""
    print("🚀 Quantum Jobs Tracker - Advanced Dashboard Runner")
    print("=" * 50)

    if not smart_import_check():
        print("\n💡 Install missing packages: pip install -r requirements.txt")
        sys.exit(1)

    success = run_advanced_dashboard()

    if success:
        print("\n✅ Advanced Dashboard completed successfully")
    else:
        print("\n❌ Advanced Dashboard failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
