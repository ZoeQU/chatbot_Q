@echo off
setlocal

echo 小西 - 一键启动 (Windows)
echo.

if not exist "%~dp0run-backend.bat" (
  echo [ERROR] Missing run-backend.bat
  pause
  exit /b 1
)
if not exist "%~dp0run-frontend.bat" (
  echo [ERROR] Missing run-frontend.bat
  pause
  exit /b 1
)

echo Starting backend and frontend in separate windows...
echo.

REM Use cmd/start to keep windows open and preserve output.
start "小西 后端" cmd /k ""%~dp0run-backend.bat""
start "小西 前端" cmd /k ""%~dp0run-frontend.bat""

echo Started:
echo - Backend:  http://127.0.0.1:8000
echo - Frontend: http://localhost:5173
echo.
echo If chat fails, check backend\.env (ARK_API_KEY) and restart.
echo.
pause

