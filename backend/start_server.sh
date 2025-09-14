#!/bin/bash

# バックエンドサーバーを起動するスクリプト

echo "ボートレースAPI サーバーを起動しています..."
echo "URL: http://localhost:8000"
echo "API ドキュメント: http://localhost:8000/docs"
echo ""

# uvicornでFastAPIサーバーを起動
uv run uvicorn src.backend.main:app --host 0.0.0.0 --port 8000 --reload