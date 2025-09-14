# ボートレースアプリケーション

bvp-scraper-python を使用したボートレースデータ取得アプリケーション

## 構成

- **バックエンド**: Python FastAPI
- **フロントエンド**: React (TypeScript)
- **データソース**: bvp-scraper-python (editable install)

## 機能

- プログラム情報の取得
- オッズ情報の取得
- 予想情報の取得
- 結果情報の取得
- 競艇場情報の取得

## セットアップ

### 前提条件

- Python 3.8+
- Node.js 16+
- uv (Python package manager)

### バックエンドの起動

```bash
cd backend
./start_server.sh
```

または手動で：

```bash
cd backend
uv run uvicorn src.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### フロントエンドの起動

```bash
cd frontend
npm start
```

## API エンドポイント

- `GET /` - ルートエンドポイント
- `GET /api/health` - ヘルスチェック
- `GET /api/programs/{race_date}/{stadium_number}/{race_number}` - プログラム情報
- `GET /api/odds/{race_date}/{stadium_number}/{race_number}` - オッズ情報
- `GET /api/previews/{race_date}/{stadium_number}/{race_number}` - 予想情報
- `GET /api/results/{race_date}/{stadium_number}/{race_number}` - 結果情報
- `GET /api/stadiums/{race_date}` - 競艇場情報

### パラメータ

- `race_date`: レース日 (YYYY-MM-DD 形式)
- `stadium_number`: 競艇場番号 (1-24)
- `race_number`: レース番号 (1-12)

## 使用方法

1. バックエンドサーバーを起動
2. フロントエンドアプリを起動
3. ブラウザで http://localhost:3000 にアクセス
4. 日付、競艇場、レース番号を選択
5. データタイプ（プログラム、オッズ、予想、結果、競艇場情報）を選択
6. データ取得ボタンをクリック

## 開発

### bvp-scraper-python の変更を反映

このプロジェクトでは bvp-scraper-python を editable install で使用しているため、
bvp-scraper-python の変更は自動的に反映されます。

### API ドキュメント

バックエンドが起動している状態で以下の URL にアクセス：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## トラブルシューティング

### バックエンドが起動しない

1. uv がインストールされているか確認
2. Python 3.8+ がインストールされているか確認
3. bvp-scraper-python のパスが正しいか確認

### フロントエンドで API に接続できない

1. バックエンドが起動しているか確認
2. CORS 設定が正しいか確認
3. API のベース URL が正しいか確認 (`src/api.ts`)

### データが取得できない

1. 指定した日付にレースが開催されているか確認
2. 競艇場番号とレース番号が正しいか確認
3. ネットワーク接続を確認
