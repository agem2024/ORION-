@echo off
REM =============================================
REM START ORION - Lanza bot + watchdog (JARVIS bloqueado)
REM =============================================
title ORION SYSTEM LAUNCHER
cd /d "c:\Users\alexp\OneDrive\Documentos\_Proyectos\acwater\02_Projects\AI_Development\AI_Media\PROYECTOS\AI_Impact_Bay_Area\orion-clean"

echo =============================================
echo           ORION SYSTEM v2.0
echo       (JARVIS desactivado permanentemente)
echo =============================================
echo.

REM Matar cualquier proceso node.exe previo (seguridad)
echo [1/3] Limpiando procesos anteriores...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Iniciar watchdog en segundo plano
echo [2/3] Iniciando Watchdog...
start "" /MIN cmd /c "orion_watchdog.bat"

REM Iniciar ORION con titulo unico
echo [3/3] Iniciando ORION...
start "ORION-BOT-MAIN" cmd /k "node index.js"

echo.
echo =============================================
echo   ORION INICIADO CORRECTAMENTE
echo =============================================
echo.
echo - Ventana principal: ORION-BOT-MAIN
echo - Watchdog: Corriendo en segundo plano
echo - JARVIS: DESACTIVADO (no puede reiniciarse)
echo.
echo Puedes cerrar esta ventana.
echo.
pause
