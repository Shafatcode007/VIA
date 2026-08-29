@echo off
echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)
echo Killing any existing process on port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo Starting server on http://localhost:5173 ...
start "" python -m http.server 5173 -d dist
echo Server started. Open http://localhost:5173 in your browser.
