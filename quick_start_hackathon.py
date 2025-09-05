#!/usr/bin/env python3
"""
Quick Start Script for Hackathon Dashboard
=========================================
One-click script to start the Hackathon Dashboard with all 8 widgets
"""

import webbrowser
import time
import subprocess
import sys
import os

def start_hackathon_dashboard():
    """Start the Hackathon Dashboard with all features"""
    
    print("🚀 Quantum Spark - Hackathon Dashboard Quick Start")
    print("=" * 60)
    print("📱 Amravati Quantum Hackathon Dashboard")
    print("🎯 All 8 Widgets + Real-time Features")
    print()
    print("🎨 Features:")
    print("   ✅ 4 Top Metrics (Active Backends, Total Jobs, Running Jobs, Success Rate)")
    print("   ✅ 6 Main Widgets (Backends, Jobs, 3D Bloch, 3D Circuit, Entanglement, Performance)")
    print("   ✅ Real-time quantum job monitoring")
    print("   ✅ 3D quantum circuit visualizations")
    print("   ✅ AI integration with Google Gemini")
    print("   ✅ Customizable dashboard widgets")
    print("   ✅ Enhanced notification system")
    print("   ✅ Backend comparison tools")
    print("   ✅ Professional UI with animations")
    print()
    print("🌐 URL: http://localhost:10000/dashboard")
    print("🔐 Enter IBM Quantum API token when prompted")
    print("=" * 60)
    
    # Check if app is already running
    try:
        import requests
        response = requests.get("http://localhost:10000/dashboard", timeout=2)
        if response.status_code == 200:
            print("✅ Hackathon Dashboard is already running!")
            print("🌐 Opening in browser...")
            time.sleep(1)
            webbrowser.open("http://localhost:10000/dashboard")
            return True
    except:
        pass
    
    # Start the dashboard
    print("🚀 Starting Hackathon Dashboard...")
    
    try:
        # Use the hackathon dashboard runner
        result = subprocess.run([
            sys.executable, "run_hackathon_dashboard.py"
        ], cwd=os.getcwd())
        
        return result.returncode == 0
        
    except KeyboardInterrupt:
        print("\n\n🛑 Hackathon Dashboard stopped by user")
        return True
    except Exception as e:
        print(f"\n❌ Failed to start Hackathon Dashboard: {e}")
        return False

if __name__ == "__main__":
    success = start_hackathon_dashboard()
    
    if success:
        print("\n✅ Hackathon Dashboard started successfully!")
        print("🎉 All 8 widgets are ready!")
        print("💡 Enter your IBM Quantum API token to see real data")
    else:
        print("\n❌ Failed to start Hackathon Dashboard")
        print("💡 Try running: python run_hackathon_dashboard.py")
