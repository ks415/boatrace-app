import React, { useState } from "react";
import "./App.css";
import { api } from "./api";

// 型定義
interface RaceResult {
  position: number;
  boat_number: number;
  racer_name: string;
  race_time?: string;
}

interface StartInfo {
  timing: string;
  special_info?: string;
}

interface PayoutInfo {
  combination: string;
  payout: number;
  popularity?: number;
}

interface DetailedRaceResultData {
  race_date: string;
  race_stadium_number: number;
  race_number: number;
  results: Record<string, RaceResult>;
  win_payouts?: Record<string, PayoutInfo>;
  place_payouts?: Record<string, PayoutInfo>;
  exacta_payouts?: Record<string, PayoutInfo>;
  quinella_payouts?: Record<string, PayoutInfo>;
  quinella_place_payouts?: Record<string, PayoutInfo>;
  trifecta_payouts?: Record<string, PayoutInfo>;
  trio_payouts?: Record<string, PayoutInfo>;
  winning_technique?: string;
  start_info?: Record<string, StartInfo>;
}

// レース結果表示コンポーネント
const RaceResultDisplay: React.FC<{ data: any }> = ({ data }) => {
  // データが詳細結果形式かチェック
  const isDetailedResult =
    data.data && data.data.results && typeof data.data.results === "object";

  if (!isDetailedResult) {
    return <pre className="data-json">{JSON.stringify(data, null, 2)}</pre>;
  }

  const resultData = data.data as DetailedRaceResultData;
  const results = Object.values(resultData.results).sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="race-result-display">
      {/* 決まり手表示 */}
      {resultData.winning_technique && (
        <div className="winning-technique">
          <h4>🏆 決まり手</h4>
          <p className="technique-name">{resultData.winning_technique}</p>
        </div>
      )}

      {/* レース結果表示 */}
      <div className="race-results">
        <h4>🏁 レース結果</h4>
        <div className="results-table">
          <div className="results-header">
            <span>着順</span>
            <span>艇番</span>
            <span>選手名</span>
            <span>タイム</span>
          </div>
          {results.map((result) => (
            <div
              key={result.position}
              className={`result-row position-${result.position}`}
            >
              <span className="position">{result.position}</span>
              <span className="boat-number">{result.boat_number}</span>
              <span className="racer-name">{result.racer_name}</span>
              <span className="race-time">{result.race_time || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* スタート情報表示 */}
      {resultData.start_info && (
        <div className="start-info">
          <h4>🚀 スタート情報</h4>
          <div className="start-info-table">
            <div className="start-info-header">
              <span>艇番</span>
              <span>スタートタイミング</span>
              <span>特記</span>
            </div>
            {Object.entries(resultData.start_info).map(([boatNum, info]) => (
              <div key={boatNum} className="start-info-row">
                <span className="boat-number">{boatNum}</span>
                <span className="timing">{info.timing}</span>
                <span className="special-info">{info.special_info || "-"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 払戻金情報 */}
      {(resultData.win_payouts || resultData.place_payouts) && (
        <div className="payout-info">
          <h4>💰 払戻金</h4>
          <div className="payout-grid">
            {resultData.win_payouts && (
              <div className="payout-section">
                <h5>単勝</h5>
                {Object.values(resultData.win_payouts).map((payout, idx) => (
                  <div key={idx} className="payout-item">
                    {payout.combination}: {payout.payout.toLocaleString()}円
                  </div>
                ))}
              </div>
            )}
            {resultData.place_payouts && (
              <div className="payout-section">
                <h5>複勝</h5>
                {Object.values(resultData.place_payouts).map((payout, idx) => (
                  <div key={idx} className="payout-item">
                    {payout.combination}: {payout.payout.toLocaleString()}円
                  </div>
                ))}
              </div>
            )}
            {resultData.exacta_payouts && (
              <div className="payout-section">
                <h5>2連単</h5>
                {Object.values(resultData.exacta_payouts).map((payout, idx) => (
                  <div key={idx} className="payout-item">
                    {payout.combination}: {payout.payout.toLocaleString()}円
                  </div>
                ))}
              </div>
            )}
            {resultData.quinella_payouts && (
              <div className="payout-section">
                <h5>2連複</h5>
                {Object.values(resultData.quinella_payouts).map(
                  (payout, idx) => (
                    <div key={idx} className="payout-item">
                      {payout.combination}: {payout.payout.toLocaleString()}円
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 生データ（デバッグ用） */}
      <details className="raw-data">
        <summary>生データを表示</summary>
        <pre className="data-json">{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
};

// 競艇場の名前マッピング
const STADIUM_NAMES: { [key: number]: string } = {
  1: "桐生",
  2: "戸田",
  3: "江戸川",
  4: "平和島",
  5: "多摩川",
  6: "浜名湖",
  7: "蒲郡",
  8: "常滑",
  9: "津",
  10: "三国",
  11: "びわこ",
  12: "住之江",
  13: "尼崎",
  14: "鳴門",
  15: "丸亀",
  16: "児島",
  17: "宮島",
  18: "徳山",
  19: "下関",
  20: "若松",
  21: "芦屋",
  22: "福岡",
  23: "唐津",
  24: "大村",
};

function App() {
  const [raceDate, setRaceDate] = useState("2024-01-01");
  const [stadiumNumber, setStadiumNumber] = useState(1);
  const [raceNumber, setRaceNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("programs");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (type: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let result: any;

      switch (type) {
        case "programs":
          result = await api.getPrograms(raceDate, stadiumNumber, raceNumber);
          break;
        case "odds":
          result = await api.getOdds(raceDate, stadiumNumber, raceNumber);
          break;
        case "previews":
          result = await api.getPreviews(raceDate, stadiumNumber, raceNumber);
          break;
        case "results":
          result = await api.getResults(raceDate, stadiumNumber, raceNumber);
          break;
        case "stadiums":
          result = await api.getStadiums(raceDate);
          break;
        default:
          throw new Error("不正なデータタイプです");
      }

      setData(result);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "データの取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchData(tab);
  };

  const handleFetch = () => {
    fetchData(activeTab);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚤 ボートレースデータビューア</h1>
        <p>bvp-scraper-python を使用したボートレースデータ取得アプリ</p>
      </header>

      <main className="main-content">
        {/* フォーム */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="race-date">レース日:</label>
            <input
              id="race-date"
              type="date"
              value={raceDate}
              onChange={(e) => setRaceDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="stadium-number">競艇場:</label>
            <select
              id="stadium-number"
              value={stadiumNumber}
              onChange={(e) => setStadiumNumber(Number(e.target.value))}
            >
              {Object.entries(STADIUM_NAMES).map(([num, name]) => (
                <option key={num} value={num}>
                  {num}. {name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="race-number">レース番号:</label>
            <select
              id="race-number"
              value={raceNumber}
              onChange={(e) => setRaceNumber(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  第{num}レース
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFetch}
            disabled={loading}
            className="fetch-button"
          >
            {loading ? "データ取得中..." : "データ取得"}
          </button>
        </div>

        {/* タブ */}
        <div className="tabs">
          {[
            { key: "programs", label: "プログラム" },
            { key: "odds", label: "オッズ" },
            { key: "previews", label: "予想" },
            { key: "results", label: "結果" },
            { key: "stadiums", label: "競艇場情報" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
              disabled={loading}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* データ表示エリア */}
        <div className="data-section">
          {loading && <div className="loading">データを取得中...</div>}

          {error && (
            <div className="error">
              <h3>エラーが発生しました</h3>
              <p>{error}</p>
            </div>
          )}

          {data && !loading && !error && (
            <div className="data-display">
              <h3>
                {activeTab === "stadiums"
                  ? `${raceDate} の競艇場情報`
                  : `${raceDate} ${
                      STADIUM_NAMES[stadiumNumber]
                    } 第${raceNumber}レース - ${
                      activeTab === "programs"
                        ? "プログラム"
                        : activeTab === "odds"
                        ? "オッズ"
                        : activeTab === "previews"
                        ? "予想"
                        : "結果"
                    }`}
              </h3>
              {activeTab === "results" ? (
                <RaceResultDisplay data={data} />
              ) : (
                <pre className="data-json">{JSON.stringify(data, null, 2)}</pre>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
