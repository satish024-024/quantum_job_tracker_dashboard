#!/usr/bin/env python3
"""
Quantum Jobs Tracker - Professional Dashboard Runner
===============================================
Runs the Professional Dashboard with widget customization
"""

import os
import sys
import subprocess
import importlib.util

def smart_import_check():
    """Smart import check with fallback options"""
    print("🔍 Checking quantum packages for Professional Dashboard...")

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

def run_professional_dashboard():
    """Run the Professional Dashboard with widget customization"""
    print("\n🚀 Starting Professional Quantum Dashboard...")
    print("💼 Professional Dashboard with Widget Customization")
    print("🎯 Features: Customizable widgets, professional layout, advanced controls")

    app_path = "quantum_jobs_tracker/real_quantum_app.py"

    if not os.path.exists(app_path):
        print(f"❌ App file not found: {app_path}")
        return False

    try:
        print(f"📁 Running from: {os.path.abspath(app_path)}")
        print("🌐 Dashboard will be available at: http://localhost:10000/professional")
        print("🔐 Enter IBM Quantum API token when prompted")
        print("=" * 60)
        print("🎯 PROFESSIONAL DASHBOARD FEATURES:")
        print("   • Customizable widget system")
        print("   • Professional business layout")
        print("   • Advanced job monitoring")
        print("   • Interactive data visualizations")
        print("   • Enhanced notification system")
        print("   • Backend management tools")
        print("   • Clean professional UI design")
        print("=" * 60)

        # Run with optimized settings
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'
        env['DASHBOARD_TYPE'] = 'professional'

        result = subprocess.run([
            sys.executable, app_path
        ], env=env, cwd=os.getcwd())

        return result.returncode == 0

    except KeyboardInterrupt:
        print("\n\n🛑 Professional Dashboard stopped by user")
        return True
    except Exception as e:
        print(f"\n❌ Failed to start Professional Dashboard: {e}")
        return False

def main():
    """Main function for Professional Dashboard"""
    print("🚀 Quantum Jobs Tracker - Professional Dashboard Runner")
    print("=" * 50)

    if not smart_import_check():
        print("\n💡 Install missing packages: pip install -r requirements.txt")
        sys.exit(1)

    success = run_professional_dashboard()

    if success:
        print("\n✅ Professional Dashboard completed successfully")
    else:
        print("\n❌ Professional Dashboard failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
