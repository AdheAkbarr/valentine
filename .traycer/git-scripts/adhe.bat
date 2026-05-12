REM ================================
REM Traycer Git Commit Script
REM Available environment variables:
REM   %COMMIT_MESSAGE% - Generated commit message
REM   %PHASE_TITLE% - Phase title
REM   %PHASE_ID% - Phase ID
REM   %WORKSPACE_PATH% - Workspace root path
REM ================================

cd /d "%WORKSPACE_PATH%"

REM Write commit message to temp file (handles quotes and special chars)
set "TRAYCER_MSG_FILE=%TEMP%\traycer_commit_msg_%PHASE_ID%.txt"
powershell -NoProfile -Command "[System.IO.File]::WriteAllText($env:TRAYCER_MSG_FILE, $env:COMMIT_MESSAGE)"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell failed to write commit message to temp file: %TRAYCER_MSG_FILE%
    exit /b 1
)
if not exist "%TRAYCER_MSG_FILE%" (
    echo ERROR: Commit message file was not created: %TRAYCER_MSG_FILE%
    exit /b 1
)
for %%A in ("%TRAYCER_MSG_FILE%") do if %%~zA EQU 0 (
    echo ERROR: Commit message file is empty: %TRAYCER_MSG_FILE%
    del /f /q "%TRAYCER_MSG_FILE%" >nul 2>&1
    exit /b 1
)

REM Retry logic to handle transient failures
set MAX_RETRIES=3
set ATTEMPT=1
set EXIT_CODE=1

:retry
git add -A && git commit -F "%TRAYCER_MSG_FILE%"
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE% EQU 0 goto :success

if %ATTEMPT% GEQ %MAX_RETRIES% goto :done
set /A ATTEMPT+=1
timeout /t 1 /nobreak >nul 2>&1
goto :retry

:success
del /f /q "%TRAYCER_MSG_FILE%" >nul 2>&1
exit /b 0

:done
del /f /q "%TRAYCER_MSG_FILE%" >nul 2>&1
exit /b %EXIT_CODE%
