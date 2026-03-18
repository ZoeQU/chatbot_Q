@echo off
cd /d "%~dp0"
echo ===== PixelMind 前端 =====
cd frontend

if not exist node_modules (
    echo 正在安装依赖 npm install ...
    npm install
)

echo.
echo 启动前端: http://localhost:5173
echo 按 Ctrl+C 停止
echo.
npm run dev
pause
