@echo off
title Mew Camera Rental Server
cd /d "%~dp0"
start http://localhost:3000
npm run dev
