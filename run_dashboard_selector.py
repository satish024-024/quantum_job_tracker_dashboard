#!/usr/bin/env python3
"""
Quantum Jobs Tracker - Dashboard Selector
========================================
Choose and run any available dashboard with full backend support
"""

import os
import sys
import subprocess
import importlib.util

def show_dashboard_menu():
    """Show available dashboard options"""
    print("🚀 Quantum Jobs Tracker - Dashboard Selector")
    print("=" * 50)
    print("Choose your dashboard:")
    print()
    print("1. 🏆 Hackathon Dashboard (Recommended)")
    print("   • Real-time quantum job monitoring")
    print("   • 3D quantum circuit visualizations")
    print("   • AI integration with Google Gemini")
    print("   • Customizable widgets")
    print("   • URL: http://localhost:10000/dashboard")
    print()
    print("2. 🎯 Advanced Dashboard")
    print("   • Enhanced 3D visualizations")
    print("   • Advanced analytics")
    print("   • Interactive Bloch sphere")
    print("   • URL: http://localhost:10000/advanced")
    print()
    print("3. 💼 Professional Dashboard")
    print("   • Widget customization")
    print("   • Professional business layout")
    print("   • Advanced job monitoring")
    print("   • URL: http://localhost:10000/professional")
    print()
    print("4. 🎨 Modern Dashboard")
    print("   • Contemporary sleek design")
    print("   • Smooth animations")
    print("   • Modern card-based layout")
    print("   • URL: http://localhost:10000/modern")
    print()
    print("5. 📊 Basic Dashboard (Index)")
    print("   • Simple interface")
    print("   • Essential features")
    print("   • URL: http://localhost:10000/index")
    print()
    print("=" * 50)

def get_dashboard_choice():
    """Get user's dashboard choice"""
    while True:
        try:
            choice = input("Enter your choice (1-5) or 'q' to quit: ").strip()

            if choice.lower() in ['q', 'quit', 'exit']:
                print("👋 Goodbye!")
                sys.exit(0)

            choice_num = int(choice)
            if 1 <= choice_num <= 5:
                return choice_num
            else:
                print("❌ Please enter a number between 1 and 5")

        except ValueError:
            print("❌ Please enter a valid number")

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

def run_selected_dashboard(choice):
    """Run the selected dashboard"""

    dashboard_configs = {
        1: {
            'name': 'Hackathon Dashboard',
            'route': '/dashboard',
            'template': 'hackathon_dashboard.html',
            'features': [
                'Real-time quantum job monitoring',
                '3D quantum circuit visualizations',
                'AI integration with Google Gemini',
                'Customizable dashboard widgets'
            ]
        },
        2: {
            'name': 'Advanced Dashboard',
            'route': '/advanced',
            'template': 'advanced_dashboard.html',
            'features': [
                'Enhanced 3D visualizations',
                'Advanced analytics',
                'Interactive Bloch sphere plots',
                'Professional glossy UI'
            ]
        },
        3: {
            'name': 'Professional Dashboard',
            'route': '/professional',
            'template': 'professional_dashboard.html',
            'features': [
                'Customizable widget system',
                'Professional business layout',
                'Advanced job monitoring',
                'Clean professional design'
            ]
        },
        4: {
            'name': 'Modern Dashboard',
            'route': '/modern',
            'template': 'modern_dashboard.html',
            'features': [
                'Contemporary sleek design',
                'Smooth animations',
                'Modern card-based layout',
                'Enhanced user experience'
            ]
        },
        5: {
            'name': 'Basic Dashboard',
            'route': '/index',
            'template': 'index.html',
            'features': [
                'Simple interface',
                'Essential quantum features',
                'Clean basic layout',
                'Fast loading'
            ]
        }
    }

    config = dashboard_configs[choice]

    print(f"\n🚀 Starting {config['name']}...")
    print(f"📱 {config['name']}")
    print(f"🌐 URL: http://localhost:10000{config['route']}")
    print("🔐 Enter IBM Quantum API token when prompted")
    print("=" * 60)
    print(f"🎯 {config['name'].upper()} FEATURES:")
    for feature in config['features']:
        print(f"   • {feature}")
    print("=" * 60)

    app_path = "quantum_jobs_tracker/real_quantum_app.py"

    if not os.path.exists(app_path):
        print(f"❌ App file not found: {app_path}")
        return False

    try:
        # Run with optimized settings
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'
        env['DASHBOARD_TYPE'] = config['name'].lower().replace(' ', '_')

        result = subprocess.run([
            sys.executable, app_path
        ], env=env, cwd=os.getcwd())

        return result.returncode == 0

    except KeyboardInterrupt:
        print(f"\n\n🛑 {config['name']} stopped by user")
        return True
    except Exception as e:
        print(f"\n❌ Failed to start {config['name']}: {e}")
        return False

def main():
    """Main dashboard selector function"""
    show_dashboard_menu()

    if not smart_import_check():
        print("\n💡 Install missing packages: pip install -r requirements.txt")
        sys.exit(1)

    choice = get_dashboard_choice()

    success = run_selected_dashboard(choice)

    if success:
        print(f"\n✅ Dashboard completed successfully")
    else:
        print(f"\n❌ Dashboard failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
