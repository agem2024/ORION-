@echo off
REM =============================================
REM ORION WATCHDOG - Auto-Restart Forever
REM =============================================
title ORION Watchdog

cd /d "c:\Users\alexp\OneDrive\Documentos\_Proyectos\acwater\02_Projects\AI_Development\AI_Media\PROYECTOS\AI_Impact_Bay_Area\orion-clean"

:check
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo [%time%] ORION caido. Reiniciando...
    start "" /MIN cmd /c "node index.js"
    echo [%time%] ORION iniciado.
)
timeout /t 30 /nobreak >NUL
goto check
