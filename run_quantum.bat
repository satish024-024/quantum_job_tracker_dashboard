@echo off
REM Quantum Jobs Tracker - Windows Batch Runner
REM ==========================================
echo 🚀 Starting Quantum Jobs Tracker (Windows Batch Mode)
echo ========================================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Try the new runner first
if exist "run_app_new.py" (
    echo 📦 Using new runner script...
    python run_app_new.py %*
) else (
    REM Fallback to original launcher
    if exist "run_quantum_app.py" (
        echo 📦 Using original launcher...
        python run_quantum_app.py
    ) else (
        echo ❌ No runner script found!
        echo Please ensure you're in the correct directory.
        pause
        exit /b 1
    )
)

echo.
echo ✅ Batch execution completed
pause
