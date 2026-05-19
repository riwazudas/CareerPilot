@echo off
title CareerPilot Console Runner
cd /d "%~dp0"

:: Retrieve the ESC character for ANSI color codes
for /F "tokens=1,2 delims=#" %%a in ('"prompt $H#$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"

echo %ESC%[96m===============================================================%ESC%[0m
echo %ESC%[96m   ______                               ____  _ __      __    %ESC%[0m
echo %ESC%[96m  / ____/___ _________  ___  ________  / __ \(_) /___  / /_   %ESC%[0m
echo %ESC%[96m / /   / __ `/ ___/ _ \/ _ \/ ___/ _ \/ /_/ / / / __ \/ __/   %ESC%[0m
echo %ESC%[96m/ /___/ /_/ / /  /  __/  __/ /  /  __/ ____/ / / /_/ / /_     %ESC%[0m
echo %ESC%[96m\____/\__,_/_/   \___/\___/_/   \___/_/   /_/_/\____/\__/     %ESC%[0m
echo.
echo %ESC%[95m              ✈️  Unified Full-Stack Console  ✈️             %ESC%[0m
echo %ESC%[96m===============================================================%ESC%[0m
echo.
echo %ESC%[90m[%ESC%[92mSYSTEM%ESC%[90m]%ESC%[0m Starting sync engine and Vite dev compiler...
echo.
node start-app.js
pause
