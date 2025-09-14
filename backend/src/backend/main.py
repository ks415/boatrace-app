"""
ボートレースアプリケーションのFastAPIメインアプリケーション
"""

from datetime import datetime
from typing import Optional

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


class StartInfo(BaseModel):
    """スタート情報モデル"""
    timing: str
    special_info: Optional[str] = None


class RaceResult(BaseModel):
    """レース結果の個別選手情報"""
    position: int
    boat_number: int
    racer_name: str
    race_time: Optional[str] = None


class PayoutInfo(BaseModel):
    """払戻金情報"""
    combination: str
    payout: int
    popularity: Optional[int] = None


class DetailedRaceResultData(BaseModel):
    """詳細なレース結果データ"""
    race_date: str
    race_stadium_number: int
    race_number: int
    results: dict[str, RaceResult]
    win_payouts: Optional[dict[str, PayoutInfo]] = None
    place_payouts: Optional[dict[str, PayoutInfo]] = None
    exacta_payouts: Optional[dict[str, PayoutInfo]] = None
    quinella_payouts: Optional[dict[str, PayoutInfo]] = None
    quinella_place_payouts: Optional[dict[str, PayoutInfo]] = None
    trifecta_payouts: Optional[dict[str, PayoutInfo]] = None
    trio_payouts: Optional[dict[str, PayoutInfo]] = None
    winning_technique: Optional[str] = None  # 決まり手
    start_info: Optional[dict[str, StartInfo]] = None  # スタート情報
    
    class Config:
        # 数値キーを文字列に自動変換
        str_strip_whitespace = True


class DetailedRaceResults(BaseModel):
    """詳細レース結果のレスポンスモデル"""
    race_date: str
    stadium_number: int
    race_number: int
    data: DetailedRaceResultData


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


@app.get("/api/results/{race_date}/{stadium_number}/{race_number}", response_model=DetailedRaceResults)
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
        
        # レース結果データを取得（ネストした構造から特定のレースデータを抽出）
        # キーは数値で返される
        if stadium_number in result_data and race_number in result_data[stadium_number]:
            race_details = result_data[stadium_number][race_number]
            
            # 結果データを構造化（数値キーを文字列に変換）
            structured_results = {}
            for pos, result in race_details.get("results", {}).items():
                structured_results[str(pos)] = RaceResult(**result)
            
            # スタート情報を構造化（数値キーを文字列に変換）
            structured_start_info = {}
            if "start_info" in race_details:
                for boat_num, start_data in race_details["start_info"].items():
                    structured_start_info[str(boat_num)] = StartInfo(**start_data)
            
            # 払戻金情報を構造化（数値キーを文字列に変換）
            def structure_payouts(payout_data):
                if not payout_data:
                    return None
                return {str(k): PayoutInfo(**v) for k, v in payout_data.items()}
            
            detailed_data = DetailedRaceResultData(
                race_date=race_details["race_date"],
                race_stadium_number=race_details["race_stadium_number"],
                race_number=race_details["race_number"],
                results=structured_results,
                win_payouts=structure_payouts(race_details.get("win_payouts")),
                place_payouts=structure_payouts(race_details.get("place_payouts")),
                exacta_payouts=structure_payouts(race_details.get("exacta_payouts")),
                quinella_payouts=structure_payouts(race_details.get("quinella_payouts")),
                quinella_place_payouts=structure_payouts(race_details.get("quinella_place_payouts")),
                trifecta_payouts=structure_payouts(race_details.get("trifecta_payouts")),
                trio_payouts=structure_payouts(race_details.get("trio_payouts")),
                winning_technique=race_details.get("winning_technique"),
                start_info=structured_start_info if structured_start_info else None
            )
            
            return DetailedRaceResults(
                race_date=race_date,
                stadium_number=stadium_number,
                race_number=race_number,
                data=detailed_data
            )
        else:
            raise HTTPException(status_code=404, detail="レース結果が見つかりません")
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
