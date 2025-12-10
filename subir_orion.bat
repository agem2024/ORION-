@echo off
echo 🚀 CONECTANDO A REPO ORION- ...

:: Configurar Usuario
git config user.email "AGEM2013@GMAIL.COM"
git config user.name "agem2024"

:: Configurar Remoto (URL Correcta)
echo 🔗 Conectando con: https://github.com/agem2024/ORION-.git
git remote remove origin 2>nul
git remote add origin https://github.com/agem2024/ORION-.git

:: Subir (Forzando actualización limpia)
echo ⬆️ Subiendo archivos a 'main'...
git branch -M main
git push -u origin main --force

echo.
echo ✅ ORION ESTÁ EN GITHUB (Repo: ORION-).
pause
