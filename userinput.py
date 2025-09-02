# userinput.py
import subprocess
import time
import sys

def run_quantum_app():
    """Start the quantum application in a separate process"""
    print("Starting Quantum Jobs Tracker application...")
    try:
        # Run the application in the background
        process = subprocess.Popen(["python", "run_real_quantum.py"], 
                                  stdout=subprocess.PIPE,
                                  stderr=subprocess.PIPE)
        print("Application started! Please open http://localhost:10000 in your browser")
        return process
    except Exception as e:
        print(f"Error starting application: {e}")
        return None

def main():
    """Main interactive loop"""
    # Start the quantum application
    app_process = run_quantum_app()
    
    # Give the app time to start
    time.sleep(3)
    
    # Main interaction loop
    while True:
        user_input = input("prompt: ")
        
        # Check for exit condition
        if user_input.lower() == "stop":
            print("Stopping the application...")
            if app_process:
                app_process.terminate()
            print("Application stopped. Exiting.")
            break
            
        # Handle different commands
        if user_input.lower() == "restart":
            print("Restarting the application...")
            if app_process:
                app_process.terminate()
            app_process = run_quantum_app()
            time.sleep(3)
            
        elif user_input.lower() == "status":
            print("Checking application status...")
            if app_process and app_process.poll() is None:
                print("Application is running")
            else:
                print("Application is not running")
                
        elif user_input.lower() == "help":
            print("\nAvailable commands:")
            print("  stop    - Stop the application and exit")
            print("  restart - Restart the application")
            print("  status  - Check if the application is running")
            print("  help    - Show this help message")
            print("  open    - Open the dashboard in your default browser")
            
        elif user_input.lower() == "open":
            print("Opening dashboard in browser...")
            try:
                import webbrowser
                webbrowser.open("http://localhost:10000")
            except Exception as e:
                print(f"Error opening browser: {e}")
                
        else:
            print(f"Command not recognized: {user_input}")
            print("Type 'help' for available commands")

if __name__ == "__main__":
    main()
