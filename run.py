from quantum_jobs_tracker.app import app

if __name__ == '__main__':
    print("Starting Quantum Jobs Tracker Dashboard...")
    print("Open your browser and navigate to http://localhost:5000")
    app.run(debug=True)
