@echo off
title AMAAN CSC CENTER - Push to GitHub (Amaan.Website-new)
color 0a
echo ========================================================
echo       AMAAN CSC CENTER - Git Push to GitHub
echo       Repository: https://github.com/sakil65653/Amaan.Website-new.git
echo ========================================================
echo.
cd /d "%~dp0"
set "PATH=%PATH%;C:\Users\AAYAT\.gemini\antigravity\scratch\mingit\cmd"

echo 1. Checking git status...
git status --short

echo 2. Staging all latest files...
git add -A

echo 3. Creating commit...
git commit -m "AMAAN CSC CENTER - Full Portal, Admin CMS, Member Hub, Tools, and Cloud Deploy"

echo.
echo 4. Setting remote origin to https://github.com/sakil65653/Amaan.Website-new.git ...
git remote set-url origin https://github.com/sakil65653/Amaan.Website-new.git

echo.
echo 5. Pushing to GitHub (origin main)...
echo.
echo NOTE: If a GitHub login window opens in your browser,
echo       click "Sign in with your browser" / "Authorize".
echo.
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    color 0a
    echo ========================================================
    echo      SUCCESS! All project files pushed to GitHub!
    echo      Repo: https://github.com/sakil65653/Amaan.Website-new
    echo ========================================================
) else (
    color 0c
    echo ========================================================
    echo   If authentication failed, you can also use a GitHub
    echo   Personal Access Token (PAT) with repo scope.
    echo ========================================================
)
echo.
pause
