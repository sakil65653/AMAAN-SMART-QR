@echo off
title AMAAN CSC CENTER - Push to GitHub (AMAAN-SMART-QR)
color 0a
echo ========================================================
echo       AMAAN CSC CENTER - Git Push to GitHub
echo       Repository: https://github.com/sakil65653/AMAAN-SMART-QR.git
echo ========================================================
echo.
cd /d "%~dp0"

echo 1. Checking git status...
git status --short

echo 2. Staging all latest files...
git add -A

echo 3. Creating commit...
git commit -m "Add Next.js Smart QR Print Initial Codebase"

echo.
echo 4. Setting remote origin...
git remote remove origin
git remote add origin https://github.com/sakil65653/AMAAN-SMART-QR.git

echo.
echo 5. Pushing to GitHub (origin main)...
echo.
echo NOTE: If a GitHub login window opens in your browser,
echo       click "Sign in with your browser" / "Authorize".
echo.
git branch -M main
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    color 0a
    echo ========================================================
    echo      SUCCESS! All project files pushed to GitHub!
    echo      Repo: https://github.com/sakil65653/AMAAN-SMART-QR
    echo ========================================================
) else (
    color 0c
    echo ========================================================
    echo   If authentication failed, please log in properly.
    echo ========================================================
)
echo.
pause
