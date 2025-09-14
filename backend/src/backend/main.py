"""
ボートレースアプリケーションのFastAPIメインアプリケーション
"""

from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from bvp_scraper import Scraper

app = FastAPI(
    title="Boatrace API",
    description="ボートレースデータを取得するAPI",
    version="1.0.0",
)

# CORS設定(フロントエンドからのアクセスを許可)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Reactの開発サーバー
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# レスポンスモデル
class RaceData(BaseModel):
    """レースデータのベースモデル"""
    race_date: str
    stadium_number: int
    race_number: int
    data: dict


class ErrorResponse(BaseModel):
    """エラーレスポンスモデル"""
    error: str
    message: str


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {"message": "Boatrace API へようこそ"}


@app.get("/api/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/api/programs/{race_date}/{stadium_number}/{race_number}", response_model=RaceData)
async def get_program(
    race_date: str,
    stadium_number: int,
    race_number: int
):
    """
    プログラム情報を取得

    Args:
        race_date: レース日 (YYYY-MM-DD形式)
        stadium_number: 競艇場番号 (1-24)
        race_number: レース番号 (1-12)
    """
    try:
        # 日付の変換
        parsed_date = datetime.strptime(race_date, "%Y-%m-%d").date()

        # データ取得
        program_data = Scraper.scrape_programs(parsed_date, stadium_number, race_number)

        return RaceData(
            race_date=race_date,
            stadium_number=stadium_number,
            race_number=race_number,
            data=program_data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"日付の形式が正しくありません: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"プログラムデータの取得に失敗しました: {e}") from e


@app.get("/api/odds/{race_date}/{stadium_number}/{race_number}", response_model=RaceData)
async def get_odds(
    race_date: str,
    stadium_number: int,
    race_number: int
):
    """
    オッズ情報を取得

    Args:
        race_date: レース日 (YYYY-MM-DD形式)
        stadium_number: 競艇場番号 (1-24)
        race_number: レース番号 (1-12)
    """
    try:
        # 日付の変換
        parsed_date = datetime.strptime(race_date, "%Y-%m-%d").date()

        # データ取得
        odds_data = Scraper.scrape_odds(parsed_date, stadium_number, race_number)

        return RaceData(
            race_date=race_date,
            stadium_number=stadium_number,
            race_number=race_number,
            data=odds_data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"日付の形式が正しくありません: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"オッズデータの取得に失敗しました: {e}") from e


@app.get("/api/previews/{race_date}/{stadium_number}/{race_number}", response_model=RaceData)
async def get_previews(
    race_date: str,
    stadium_number: int,
    race_number: int
):
    """
    予想情報を取得

    Args:
        race_date: レース日 (YYYY-MM-DD形式)
        stadium_number: 競艇場番号 (1-24)
        race_number: レース番号 (1-12)
    """
    try:
        # 日付の変換
        parsed_date = datetime.strptime(race_date, "%Y-%m-%d").date()

        # スクレイパーインスタンスを取得
        scraper = Scraper.get_instance()

        # データ取得
        preview_data = scraper.scrape_previews(parsed_date, stadium_number, race_number)

        return RaceData(
            race_date=race_date,
            stadium_number=stadium_number,
            race_number=race_number,
            data=preview_data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"日付の形式が正しくありません: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"予想データの取得に失敗しました: {e}") from e


@app.get("/api/results/{race_date}/{stadium_number}/{race_number}", response_model=RaceData)
async def get_results(
    race_date: str,
    stadium_number: int,
    race_number: int
):
    """
    結果情報を取得

    Args:
        race_date: レース日 (YYYY-MM-DD形式)
        stadium_number: 競艇場番号 (1-24)
        race_number: レース番号 (1-12)
    """
    try:
        # 日付の変換
        parsed_date = datetime.strptime(race_date, "%Y-%m-%d").date()

        # スクレイパーインスタンスを取得
        scraper = Scraper.get_instance()

        # データ取得
        result_data = scraper.scrape_results(parsed_date, stadium_number, race_number)

        return RaceData(
            race_date=race_date,
            stadium_number=stadium_number,
            race_number=race_number,
            data=result_data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"日付の形式が正しくありません: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"結果データの取得に失敗しました: {e}") from e


@app.get("/api/stadiums/{race_date}")
async def get_stadiums(race_date: str):
    """
    指定日の全競艇場情報を取得

    Args:
        race_date: レース日 (YYYY-MM-DD形式)
    """
    try:
        # 日付の変換
        parsed_date = datetime.strptime(race_date, "%Y-%m-%d").date()

        # データ取得
        stadium_data = Scraper.scrape_stadiums(parsed_date)

        return {
            "race_date": race_date,
            "data": stadium_data
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"日付の形式が正しくありません: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"競艇場データの取得に失敗しました: {e}") from e


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
