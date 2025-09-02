"""
Logging Configuration Module
Provides centralized logging configuration for the quantum computing application.
"""

import logging
import logging.handlers
import os
import sys
from datetime import datetime

def setup_logging(log_level='INFO', log_file=None, console_output=True):
    """
    Setup logging configuration for the application.
    
    Args:
        log_level (str): Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file (str): Path to log file (optional)
        console_output (bool): Whether to output to console
    """
    try:
        # Convert string log level to logging constant
        numeric_level = getattr(logging, log_level.upper(), None)
        if not isinstance(numeric_level, int):
            raise ValueError(f'Invalid log level: {log_level}')
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(numeric_level)
        
        # Clear existing handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Console handler
        if console_output:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(numeric_level)
            console_handler.setFormatter(formatter)
            root_logger.addHandler(console_handler)
        
        # File handler
        if log_file:
            # Ensure log directory exists
            log_dir = os.path.dirname(log_file)
            if log_dir and not os.path.exists(log_dir):
                os.makedirs(log_dir)
            
            # Rotating file handler (10MB max, keep 5 backup files)
            file_handler = logging.handlers.RotatingFileHandler(
                log_file, maxBytes=10*1024*1024, backupCount=5
            )
            file_handler.setLevel(numeric_level)
            file_handler.setFormatter(formatter)
            root_logger.addHandler(file_handler)
        
        # Set specific logger levels
        logging.getLogger('qiskit').setLevel(logging.WARNING)
        logging.getLogger('urllib3').setLevel(logging.WARNING)
        logging.getLogger('requests').setLevel(logging.WARNING)
        
        # Log successful setup
        logging.info(f"Logging configured successfully - Level: {log_level}")
        if log_file:
            logging.info(f"Log file: {log_file}")
        
    except Exception as e:
        print(f"Error setting up logging: {e}")
        # Fallback to basic logging
        logging.basicConfig(level=logging.INFO)

def get_logger(name):
    """
    Get a logger instance with the specified name.
    
    Args:
        name (str): Logger name
        
    Returns:
        logging.Logger: Configured logger instance
    """
    return logging.getLogger(name)

def log_quantum_operation(operation_name, backend_name=None, qubits=None, shots=None):
    """
    Decorator to log quantum operations with consistent formatting.
    
    Args:
        operation_name (str): Name of the quantum operation
        backend_name (str): Name of the quantum backend
        qubits (int): Number of qubits used
        shots (int): Number of shots executed
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            
            # Log operation start
            start_msg = f"Starting {operation_name}"
            if backend_name:
                start_msg += f" on backend: {backend_name}"
            if qubits:
                start_msg += f" with {qubits} qubits"
            if shots:
                start_msg += f" for {shots} shots"
            
            logger.info(start_msg)
            
            try:
                start_time = datetime.now()
                result = func(*args, **kwargs)
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()
                
                # Log successful completion
                logger.info(f"Completed {operation_name} in {duration:.2f} seconds")
                return result
                
            except Exception as e:
                # Log error
                logger.error(f"Error in {operation_name}: {e}")
                raise
                
        return wrapper
    return decorator

def log_security_event(event_type, details, severity='INFO'):
    """
    Log security-related events with appropriate formatting.
    
    Args:
        event_type (str): Type of security event
        details (str): Details about the event
        severity (str): Severity level
    """
    logger = get_logger('security')
    
    security_msg = f"SECURITY EVENT [{event_type}]: {details}"
    
    if severity.upper() == 'CRITICAL':
        logger.critical(security_msg)
    elif severity.upper() == 'ERROR':
        logger.error(security_msg)
    elif severity.upper() == 'WARNING':
        logger.warning(security_msg)
    else:
        logger.info(security_msg)

def log_quantum_error(error_type, error_details, circuit_info=None):
    """
    Log quantum computing errors with detailed information.
    
    Args:
        error_type (str): Type of quantum error
        error_details (str): Detailed error description
        circuit_info (dict): Circuit information if available
    """
    logger = get_logger('quantum.errors')
    
    error_msg = f"QUANTUM ERROR [{error_type}]: {error_details}"
    
    if circuit_info:
        error_msg += f" | Circuit: {circuit_info}"
    
    logger.error(error_msg)

def log_performance_metrics(operation_name, duration, memory_usage=None, cpu_usage=None):
    """
    Log performance metrics for operations.
    
    Args:
        operation_name (str): Name of the operation
        duration (float): Duration in seconds
        memory_usage (float): Memory usage in MB
        cpu_usage (float): CPU usage percentage
    """
    logger = get_logger('performance')
    
    perf_msg = f"PERFORMANCE: {operation_name} took {duration:.2f}s"
    
    if memory_usage:
        perf_msg += f" | Memory: {memory_usage:.1f}MB"
    if cpu_usage:
        perf_msg += f" | CPU: {cpu_usage:.1f}%"
    
    logger.info(perf_msg)

# Initialize logging when module is imported
if __name__ != '__main__':
    # Set default logging configuration
    setup_logging()
