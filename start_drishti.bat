@echo off
title Drishti-Skilling - MSDE Monitoring Platform (SIH 2026 #26245)
color 0A

echo =========================================================================
echo       DRISHTI-SKILLING: AI-BASED REAL-TIME MONITORING PLATFORM
echo       Ministry of Skill Development and Entrepreneurship (MSDE)
echo       Problem Statement ID: 26245 - Smart India Hackathon 2026
echo =========================================================================
echo.
echo [1/2] Starting Central Ingestion Engine & WebSocket Server on Port 3000...
cd /d "%~dp0"

start "" http://localhost:3000
node server/index.js

pause
