#!/usr/bin/env powershell
<#
.SYNOPSIS
    Quantum Jobs Tracker - PowerShell Runner
.DESCRIPTION
    Advanced PowerShell script to run the quantum jobs tracker with enhanced features
.PARAMETER Mode
    Run mode: direct, module, or auto (default: auto)
.PARAMETER Port
    Port number for the web server (default: 10000)
.PARAMETER Debug
    Enable debug mode
.EXAMPLE
    .\run_quantum.ps1
.EXAMPLE
    .\run_quantum.ps1 -Mode direct -Port 8080 -Debug
#>

param(
    [string]$Mode = "auto",
    [int]$Port = 10000,
    [switch]$Debug
)

# Configuration
$Config = @{
    AppName = "Quantum Jobs Tracker v2.0"
    DefaultPort = 10000
    PythonCmd = "python"
    AppPath = "quantum_jobs_tracker/real_quantum_app.py"
}

function Write-Header {
    Write-Host "🚀 $($Config.AppName)" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Yellow
}

function Test-Python {
    try {
        $pythonVersion = & $Config.PythonCmd --version 2>$null
        Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
        return $false
    }
}

function Test-Dependencies {
    Write-Host "🔍 Checking quantum packages..." -ForegroundColor Yellow

    $packages = @(
        @{Name = "qiskit"; Description = "Core quantum framework"},
        @{Name = "flask"; Description = "Web framework"},
        @{Name = "numpy"; Description = "Numerical computing"}
    )

    $missingPackages = @()

    foreach ($pkg in $packages) {
        try {
            & $Config.PythonCmd -c "import $($pkg.Name.Replace('-', '_'))" 2>$null
            Write-Host "✅ $($pkg.Name): $($pkg.Description)" -ForegroundColor Green
        }
        catch {
            $missingPackages += $pkg.Name
            Write-Host "❌ $($pkg.Name): Missing" -ForegroundColor Red
        }
    }

    if ($missingPackages.Count -gt 0) {
        Write-Host "`n💡 Install missing packages:" -ForegroundColor Yellow
        Write-Host "   pip install $($missingPackages -join ' ')" -ForegroundColor Cyan
        return $false
    }

    return $true
}

function Start-AppDirect {
    Write-Host "`n🚀 Starting in Direct Mode..." -ForegroundColor Cyan

    if (!(Test-Path $Config.AppPath)) {
        Write-Host "❌ App file not found: $($Config.AppPath)" -ForegroundColor Red
        return $false
    }

    try {
        Write-Host "📁 Running from: $(Resolve-Path $Config.AppPath)" -ForegroundColor Blue
        Write-Host "🌐 App will be available at: http://localhost:$Port" -ForegroundColor Green
        Write-Host "🔐 Enter IBM Quantum token in the web interface" -ForegroundColor Yellow
        Write-Host "=" * 50 -ForegroundColor Yellow

        $env:FLASK_ENV = if ($Debug) { "development" } else { "production" }

        & $Config.PythonCmd $Config.AppPath

        return $true
    }
    catch {
        Write-Host "`n❌ Failed to start application: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Start-AppModule {
    Write-Host "`n🚀 Starting in Module Mode..." -ForegroundColor Cyan

    try {
        Write-Host "🌐 App will be available at: http://localhost:$Port" -ForegroundColor Green
        Write-Host "🔐 Enter IBM Quantum token in the web interface" -ForegroundColor Yellow
        Write-Host "=" * 50 -ForegroundColor Yellow

        $script = @"
import sys
sys.path.insert(0, '.')
from quantum_jobs_tracker.real_quantum_app import app
app.run(host='0.0.0.0', port=$Port, debug=$($Debug.ToString().ToLower()))
"@

        & $Config.PythonCmd -c $script

        return $true
    }
    catch {
        Write-Host "`n❌ Failed to start application: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Header

if (!(Test-Python)) {
    exit 1
}

if (!(Test-Dependencies)) {
    Write-Host "`n💡 Tip: Run 'pip install -r requirements.txt' to install all dependencies" -ForegroundColor Yellow
    exit 1
}

# Execute based on mode
$success = $false

switch ($Mode.ToLower()) {
    "direct" {
        $success = Start-AppDirect
    }
    "module" {
        $success = Start-AppModule
    }
    "auto" {
        Write-Host "`n🎯 Using auto mode (module with direct fallback)" -ForegroundColor Yellow
        try {
            $success = Start-AppModule
        }
        catch {
            Write-Host "`n🔄 Falling back to direct mode..." -ForegroundColor Yellow
            $success = Start-AppDirect
        }
    }
    default {
        Write-Host "❌ Unknown mode: $Mode" -ForegroundColor Red
        Write-Host "Available modes: direct, module, auto" -ForegroundColor Yellow
        exit 1
    }
}

if ($success) {
    Write-Host "`n✅ Application completed successfully" -ForegroundColor Green
} else {
    Write-Host "`n❌ Application failed" -ForegroundColor Red
    exit 1
}
