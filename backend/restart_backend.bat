@echo off
rem Restart only the PlaceX backend Uvicorn process (does not kill other Python processes).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0restart_backend.ps1" %*
