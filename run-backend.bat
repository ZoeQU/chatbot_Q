@echo off
cd /d "%~dp0"
echo ===== PixelMind 后端 =====
cd backend

if not exist .venv (
    echo 正在创建虚拟环境 .venv ...
    python -m venv .venv
)
call .venv\Scripts\activate.bat

echo 正在安装/更新依赖 ...
python -m pip install -q --upgrade pip
pip install -q -r requirements.txt

if not exist .env (
    copy .env.example .env
    echo 已从 .env.example 复制 .env，请编辑 backend\.env 填入 ARK_API_KEY
)

echo.
echo 启动后端: http://127.0.0.1:8000
echo 健康检查: http://127.0.0.1:8000/api/health
echo 按 Ctrl+C 停止
echo.
uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
