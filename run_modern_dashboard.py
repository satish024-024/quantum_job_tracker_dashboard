#!/usr/bin/env python3
"""
Quantum Jobs Tracker - Modern Dashboard Runner
===============================================
Runs the Modern Dashboard with contemporary design
"""

import os
import sys
import subprocess
import importlib.util

def smart_import_check():
    """Smart import check with fallback options"""
    print("🔍 Checking quantum packages for Modern Dashboard...")

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

def run_modern_dashboard():
    """Run the Modern Dashboard with contemporary design"""
    print("\n🚀 Starting Modern Quantum Dashboard...")
    print("🎨 Modern Dashboard with Contemporary Design")
    print("🎯 Features: Sleek interface, modern aesthetics, smooth animations")

    app_path = "quantum_jobs_tracker/real_quantum_app.py"

    if not os.path.exists(app_path):
        print(f"❌ App file not found: {app_path}")
        return False

    try:
        print(f"📁 Running from: {os.path.abspath(app_path)}")
        print("🌐 Dashboard will be available at: http://localhost:10000/modern")
        print("🔐 Enter IBM Quantum API token when prompted")
        print("=" * 60)
        print("🎯 MODERN DASHBOARD FEATURES:")
        print("   • Contemporary sleek design")
        print("   • Smooth animations and transitions")
        print("   • Modern card-based layout")
        print("   • Interactive data visualizations")
        print("   • Enhanced user experience")
        print("   • Responsive design elements")
        print("   • Clean modern UI aesthetics")
        print("=" * 60)

        # Run with optimized settings
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'
        env['DASHBOARD_TYPE'] = 'modern'

        result = subprocess.run([
            sys.executable, app_path
        ], env=env, cwd=os.getcwd())

        return result.returncode == 0

    except KeyboardInterrupt:
        print("\n\n🛑 Modern Dashboard stopped by user")
        return True
    except Exception as e:
        print(f"\n❌ Failed to start Modern Dashboard: {e}")
        return False

def main():
    """Main function for Modern Dashboard"""
    print("🚀 Quantum Jobs Tracker - Modern Dashboard Runner")
    print("=" * 50)

    if not smart_import_check():
        print("\n💡 Install missing packages: pip install -r requirements.txt")
        sys.exit(1)

    success = run_modern_dashboard()

    if success:
        print("\n✅ Modern Dashboard completed successfully")
    else:
        print("\n❌ Modern Dashboard failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
