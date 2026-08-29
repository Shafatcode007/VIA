@echo off
title VIA - One-Click Launcher
color 0A

echo ============================================
echo   VIA - Dhaka's Super App
echo   One-Click Launcher
echo ============================================
echo.

:: Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js detected:
node -v

:: Check Python 3.13 (preferred for asyncpg compatibility)
set PYTHON_EXE=
"C:\Users\atauz\AppData\Local\Programs\Python\Python313\python.exe" --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_EXE=C:\Users\atauz\AppData\Local\Programs\Python\Python313\python.exe
    echo [OK] Python 3.13 detected:
    goto :python_found
)
python --version 2>&1 | findstr /C:"3.13" >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_EXE=python
    echo [OK] Python 3.13 detected:
    goto :python_found
)
echo [ERROR] Python 3.13 is required for asyncpg compatibility.
echo Please install Python 3.13 from https://python.org
pause
exit /b 1

:python_found
%PYTHON_EXE% --version

:: Check PostgreSQL (port 5432)
%PYTHON_EXE% -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('localhost',5432)); s.close(); print('OK')" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] PostgreSQL is not running on port 5432.
    echo.
    echo   The FastAPI backend requires PostgreSQL.
    echo   Please start PostgreSQL and create the database:
    echo.
    echo     1. Start PostgreSQL Service
    echo     2. Run: psql -U postgres -c "CREATE DATABASE via_db;"
    echo.
    echo   If you don't have PostgreSQL, download from:
    echo   https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)
echo [OK] PostgreSQL is running on port 5432.

:: Check if via_db database exists
%PYTHON_EXE% -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('localhost',5432)); s.close()" >nul 2>&1
echo [OK] Database check via_db will be created by the app if needed.

:: Install frontend dependencies if missing
if not exist "node_modules" (
    echo.
    echo [SETUP] Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed.
)

:: Create Prisma database if missing
if not exist "prisma\dev.db" (
    echo.
    echo [SETUP] Creating Prisma database...
    call npx prisma db push --skip-generate
    if %errorlevel% neq 0 (
        echo [ERROR] Prisma database creation failed.
        pause
        exit /b 1
    )
    echo [OK] Prisma database created.
)

:: Setup Python venv if missing
if not exist "..\backend\.venv\Scripts\python.exe" (
    echo.
    echo [SETUP] Creating Python virtual environment with Python 3.13...
    %PYTHON_EXE% -m venv ..\backend\.venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create venv. Make sure Python 3.13 is installed.
        pause
        exit /b 1
    )
    echo [SETUP] Installing backend dependencies...
    ..\backend\.venv\Scripts\pip.exe install -r ..\backend\requirements.txt
    ..\backend\.venv\Scripts\pip.exe install email-validator aiosqlite
    if %errorlevel% neq 0 (
        echo [ERROR] Backend dependency installation failed.
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed.
)

echo.
echo ============================================
echo   Starting servers...
echo ============================================
echo.

:: Start FastAPI backend in a new window
echo [STARTING] FastAPI backend on http://localhost:8000
start "VIA Backend - FastAPI" cmd /k "cd /d ..\backend && ..\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to be ready
echo [WAITING] Backend to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

:: Start Next.js frontend in a new window
echo [STARTING] Next.js frontend on http://localhost:3000
start "VIA Frontend - Next.js" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ============================================
echo   Both servers starting in separate windows!
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo   Close the server windows to stop them.
echo ============================================
echo.
pause
