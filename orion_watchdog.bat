@echo off
REM =============================================
REM ORION WATCHDOG - Auto-Restart si ORION cae
REM =============================================
title ORION Watchdog - NO CERRAR

cd /d "c:\Users\alexp\OneDrive\Documentos\_Proyectos\acwater\02_Projects\AI_Development\AI_Media\PROYECTOS\AI_Impact_Bay_Area\orion-clean"

echo [%time%] ORION Watchdog iniciado. Monitoreando cada 30 segundos...

:check
REM Verificar si hay proceso node.exe corriendo
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo [%time%] ORION caido! Reiniciando...
    start "ORION-BOT-MAIN" cmd /k "node index.js"
    echo [%time%] ORION reiniciado.
) else (
    echo [%time%] ORION activo.
)
timeout /t 30 /nobreak >NUL
goto check
