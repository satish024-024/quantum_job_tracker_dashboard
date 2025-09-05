#!/usr/bin/env python3
"""
Quick test script to access the hackathon dashboard directly
"""

import requests
import json
import time

def test_hackathon_dashboard():
    """Test the hackathon dashboard functionality"""

    base_url = "http://localhost:10000"

    print("🚀 Testing Hackathon Dashboard Access")
    print("=" * 40)

    # First, check if the app is running
    try:
        response = requests.get(base_url)
        if response.status_code != 200:
            print("❌ App is not running or not accessible")
            return False
        print("✅ App is running")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to app: {e}")
        return False

    # Set a test token to bypass authentication
    test_token = "test_token_for_development"

    # Simulate setting the token
    try:
        token_data = {"token": test_token}
        response = requests.post(f"{base_url}/token", json=token_data)
        print(f"🔑 Token set: {response.status_code}")

        if response.status_code == 200:
            print("✅ Token accepted")

            # Now try to access the dashboard
            time.sleep(1)  # Small delay
            dashboard_response = requests.get(f"{base_url}/dashboard")

            if dashboard_response.status_code == 200:
                print("✅ Hackathon Dashboard loaded successfully!")
                print("🌐 Access it at: http://localhost:10000/dashboard")
                return True
            else:
                print(f"❌ Dashboard access failed: {dashboard_response.status_code}")
                return False
        else:
            print(f"❌ Token setup failed: {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def open_dashboard_in_browser():
    """Open the dashboard in the default browser"""
    import webbrowser
    import time

    print("\n🌐 Opening dashboard in browser...")
    time.sleep(2)
    webbrowser.open("http://localhost:10000/dashboard")

if __name__ == "__main__":
    success = test_hackathon_dashboard()

    if success:
        print("\n🎉 Hackathon Dashboard is ready!")
        print("📱 Features available:")
        print("   • Real-time job monitoring")
        print("   • 3D quantum circuit visualization")
        print("   • Customizable widgets")
        print("   • Enhanced notifications")
        print("   • AI integration")
        print("   • Backend comparison tools")

        # Ask if they want to open in browser
        try:
            open_dashboard_in_browser()
        except:
            print("💡 Open your browser and go to: http://localhost:10000/dashboard")
    else:
        print("\n❌ Setup failed. Make sure the Flask app is running.")
