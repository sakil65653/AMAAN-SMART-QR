@echo off
title AMAAN CSC CENTER - Local Server (Port 5050)
color 0b
echo ========================================================
echo       AMAAN CSC CENTER - Local Server & API
echo              Proprietor: SAKIL ALAM
echo ========================================================
echo.
echo Starting backend server on http://localhost:5050/ ...
echo Please keep this window open while using the software.
echo.
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File server.ps1
echo.
echo Server has stopped.
pause
