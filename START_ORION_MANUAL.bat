@echo off
REM =============================================
REM MANUAL START ORION - Solo cuando lo necesites
REM =============================================
title ORION Manual Start
cd /d "c:\Users\alexp\OneDrive\Documentos\_Proyectos\acwater\02_Projects\AI_Development\AI_Media\PROYECTOS\AI_Impact_Bay_Area\orion-clean"

echo =============================================
echo      ORION CLEAN - Inicio Manual
echo =============================================
echo.
echo Iniciando ORION en modo MANUAL...
echo.
echo IMPORTANTE:
echo - NO hay auto-reinicio
echo - NO hay watchdog
echo - Para detener: Cierra esta ventana o presiona Ctrl+C
echo.
echo =============================================
echo.

node index.js

echo.
echo ORION detenido.
pause
