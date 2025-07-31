@echo off
color 07
cls

REM Setup variables
set EXECUTOR=HUMAN
if "%1"=="--ai" set EXECUTOR=AI
if "%1"=="--automated" set EXECUTOR=AUTOMATED

echo.
echo ==========================================
echo   SECURITY CHECK - SIMPLE VERSION
echo   Executor: %EXECUTOR%
echo ==========================================
echo.

cd /d "%~dp0\.."

echo Checking for tampering...
node core/engine/debug-utils.js --admin-check >nul 2>nul

REM Save results
set CHECK_RESULT=UNKNOWN
set CHECK_TIME=%date% %time%

if errorlevel 1 (
    set CHECK_RESULT=DANGER
    color 4F
    cls
    echo.
    echo.
    echo  ******************************************
    echo  *                                        *
    echo  *           DANGER DANGER DANGER        *
    echo  *                                        *
    echo  *        SYSTEM HAS BEEN HACKED         *
    echo  *                                        *
    echo  *      Someone modified your files      *
    echo  *                                        *
    echo  ******************************************
    echo.
    echo.
    echo  RESULT: BAD - SYSTEM COMPROMISED
    echo.
    goto :log_result
) else (
    set CHECK_RESULT=SAFE
    color 2F
    cls
    echo.
    echo.
    echo  ******************************************
    echo  *                                        *
    echo  *              ALL GOOD!                *
    echo  *                                        *
    echo  *         SYSTEM IS SECURE              *
    echo  *                                        *
    echo  *       No tampering detected           *
    echo  *                                        *
    echo  ******************************************
    echo.
    echo.
    echo  RESULT: GOOD - SYSTEM IS SAFE
    echo.
)

:log_result
REM Write to log file
echo [%CHECK_TIME%] Executor: %EXECUTOR%, Result: %CHECK_RESULT% >> "%~dp0simple-check.log"

echo.
echo Log recorded to simple-check.log
echo Press any key to close...
pause >nul