# Quantum Jobs Tracker

A quantum-native dashboard for tracking and visualizing IBM Quantum jobs. This application connects to IBM Quantum Experience to retrieve information about quantum backends and jobs, processing this information using quantum circuits and visualizing it in an interactive dashboard.

## Features

- **Real-time Quantum Backend Status**: View the status of IBM Quantum backends with quantum-inspired visualizations
- **Quantum Job Tracking**: Monitor running, queued, and completed quantum jobs
- **Quantum Data Processing**: Data is processed using quantum circuits to generate insightful visualizations
- **Live Updates**: Dashboard automatically updates to show the latest information
- **Quantum Circuit Visualization**: View quantum circuit representations of system state

## Requirements

- Python 3.8+
- Qiskit and related packages (qiskit-aer, qiskit-ibm-provider, qiskit-ibm-runtime)
- Flask
- Requests
- Matplotlib
- NumPy
- pylatexenc (for circuit visualization)
- python-dotenv (for environment variables)

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Configure your IBM Quantum Experience credentials:
   - Register for an account at [IBM Quantum Experience](https://quantum-computing.ibm.com/)
   - Get your API token from your account settings
   - Copy `config.example.py` to `config.py` and add your token and CRN

   ```python
   # In config.py
   IBM_QUANTUM_TOKEN = "your_token_here"
   IBM_QUANTUM_CRN = "your_crn_here"  # Optional, only if you have a specific CRN
   ```

3. Run the application:
```
python run_real_quantum.py
```

4. Open your browser and navigate to `http://localhost:5000`

## GitHub Deployment

For deploying to GitHub or other public repositories:

1. **NEVER commit your `config.py` file** - it contains sensitive credentials
2. The `.gitignore` file is set up to exclude `config.py`
3. For production deployment, set environment variables instead:
   ```
   IBM_QUANTUM_TOKEN=your_token_here
   IBM_QUANTUM_CRN=your_crn_here
   ```

## Architecture

The application is built with a quantum-native architecture:

1. **Backend Service**: Connects to IBM Quantum Experience API to retrieve data
2. **Quantum Circuit Processor**: Processes data using quantum circuits
3. **Flask Web Server**: Serves the dashboard and API endpoints
4. **Frontend Dashboard**: Displays quantum-inspired visualizations of the data

## Dashboard Sections

- **Quantum Backends**: Shows available quantum backends with their status and visualizations
- **Active Quantum Jobs**: Displays information about current and queued jobs
- **Superposition Visualization**: A quantum circuit representation of the overall system state

## Quantum Processing

The application uses quantum computing concepts in several ways:

1. **Backend Status Encoding**: Backend status is encoded into quantum states
2. **Job Processing**: Job data is processed using quantum algorithms
3. **Quantum Visualization**: Data is visualized using quantum circuit diagrams and Bloch spheres

## Real Data Only Mode

This application is configured to use only real data from IBM Quantum. If no valid IBM Quantum token is provided or the connection fails, the dashboard will show empty data rather than falling back to simulated data. This ensures that all visualizations and metrics represent actual quantum computing resources.

## License

This project is open source and available for educational and research purposes.

## Acknowledgements

Built using IBM Qiskit and inspired by the quantum computing community.
By K.Satish Kumar 