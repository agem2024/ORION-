@echo off
REM =============================================
REM START ORION - Lanza bot + watchdog
REM =============================================
title ORION SYSTEM
cd /d "c:\Users\alexp\OneDrive\Documentos\_Proyectos\acwater\02_Projects\AI_Development\AI_Media\PROYECTOS\AI_Impact_Bay_Area\orion-clean"

echo =============================================
echo           ORION SYSTEM v1.0
echo =============================================
echo.

REM Iniciar watchdog en segundo plano
start "" /MIN cmd /c "orion_watchdog.bat"
echo [OK] Watchdog iniciado

REM Iniciar ORION
echo [OK] Iniciando ORION...
node index.js
