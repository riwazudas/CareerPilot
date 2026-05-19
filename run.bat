@echo off
title CareerPilot Console Runner
cd /d "%~dp0"
echo ===================================================
echo   ✈️ CareerPilot - Launching Unified Server Suit ✈️
echo ===================================================
echo.
echo Starting database sync engine and Vite dev compiler...
echo.
node start-app.js
pause
