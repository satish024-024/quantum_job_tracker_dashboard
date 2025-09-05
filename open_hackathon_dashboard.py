#!/usr/bin/env python3
"""
Simple script to open the hackathon dashboard in the browser
"""

import webbrowser
import time

def open_hackathon_dashboard():
    """Open the hackathon dashboard in the default browser"""

    dashboard_url = "http://localhost:10000/dashboard"

    print("🚀 Opening Hackathon Dashboard...")
    print("=" * 40)
    print("📱 Quantum Spark - Amravati Quantum Hackathon Dashboard")
    print("🌐 URL: http://localhost:10000/dashboard")
    print()
    print("🎯 Features:")
    print("   • Real-time quantum job monitoring")
    print("   • 3D quantum circuit visualizations")
    print("   • Customizable dashboard widgets")
    print("   • Enhanced notification system")
    print("   • AI integration with Google Gemini")
    print("   • Backend comparison tools")
    print("   • Professional UI with animations")
    print()
    print("💡 Note: Enter your IBM Quantum API token when prompted")
    print("=" * 40)

    # Small delay before opening
    time.sleep(1)

    # Open in browser
    webbrowser.open(dashboard_url)
    print("✅ Dashboard opened in your default browser!")

if __name__ == "__main__":
    open_hackathon_dashboard()
