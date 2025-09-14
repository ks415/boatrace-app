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

// プログラム用型定義
interface RacerInfo {
  racer_boat_number: number;
  racer_name: string;
  racer_number: number;
  racer_class_number: string;
  racer_age: number;
  racer_weight: number;
  racer_flying_count: number;
  racer_late_count: number;
  racer_average_start_timing: number;
  racer_national_top_1_percent: number;
  racer_national_top_2_percent: number;
  racer_national_top_3_percent: number;
  racer_local_top_1_percent: number;
  racer_local_top_2_percent: number;
  racer_local_top_3_percent: number;
  racer_assigned_motor_number: number;
  racer_assigned_motor_top_2_percent: number;
  racer_assigned_motor_top_3_percent: number;
  racer_assigned_boat_number: number;
  racer_assigned_boat_top_2_percent: number;
  racer_assigned_boat_top_3_percent: number;
}

interface ProgramData {
  race_date: string;
  race_stadium_number: number;
  race_number: number;
  race_closed_at: string;
  race_grade_number: number;
  race_title: string;
  race_subtitle: string;
  race_distance: number;
  boats: Record<string, RacerInfo>;
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

// プログラム表示コンポーネント
const ProgramDisplay: React.FC<{ data: any }> = ({ data }) => {
  // データがプログラム形式かチェック
  const isProgramData =
    data.data && data.data.boats && typeof data.data.boats === "object";

  if (!isProgramData) {
    return <pre className="data-json">{JSON.stringify(data, null, 2)}</pre>;
  }

  const programData = data.data as ProgramData;
  const racers = Object.values(programData.boats).sort(
    (a, b) => a.racer_boat_number - b.racer_boat_number
  );

  // 艇番の色マッピング（ボートレースの伝統色）
  const getBoatColor = (boatNumber: number) => {
    const colors = {
      1: "#FFFFFF", // 白
      2: "#000000", // 黒
      3: "#FF0000", // 赤
      4: "#0000FF", // 青
      5: "#FFFF00", // 黄
      6: "#00FF00", // 緑
    };
    return colors[boatNumber as keyof typeof colors] || "#CCCCCC";
  };

  const getBoatColorClass = (boatNumber: number) => {
    return `boat-color-${boatNumber}`;
  };

  return (
    <div className="program-display">
      {/* レース情報ヘッダー */}
      <div className="race-info-header">
        <h4>🏁 レース情報</h4>
        <div className="race-info-grid">
          <div className="race-info-item">
            <span className="label">タイトル:</span>
            <span className="value">{programData.race_title}</span>
          </div>
          <div className="race-info-item">
            <span className="label">サブタイトル:</span>
            <span className="value">{programData.race_subtitle}</span>
          </div>
          <div className="race-info-item">
            <span className="label">距離:</span>
            <span className="value">{programData.race_distance}m</span>
          </div>
          <div className="race-info-item">
            <span className="label">締切:</span>
            <span className="value">
              {new Date(programData.race_closed_at).toLocaleString("ja-JP")}
            </span>
          </div>
        </div>
      </div>

      {/* 選手一覧 */}
      <div className="racers-grid">
        {racers.map((racer) => (
          <div
            key={racer.racer_boat_number}
            className={`racer-card ${getBoatColorClass(
              racer.racer_boat_number
            )}`}
          >
            {/* 艇番ヘッダー */}
            <div className="racer-header">
              <div
                className="boat-number"
                style={{
                  backgroundColor: getBoatColor(racer.racer_boat_number),
                  color:
                    racer.racer_boat_number === 1 ||
                    racer.racer_boat_number === 5
                      ? "#000"
                      : "#FFF",
                }}
              >
                {racer.racer_boat_number}
              </div>
              <div className="racer-basic-info">
                <div className="racer-name">{racer.racer_name}</div>
                <div className="racer-details">
                  {racer.racer_age}歳 / {racer.racer_class_number}級 /{" "}
                  {racer.racer_weight}kg
                </div>
              </div>
            </div>

            {/* 勝率情報 */}
            <div className="stats-section">
              <h5>🏆 勝率</h5>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">全国1着率</span>
                  <span className="stat-value">
                    {racer.racer_national_top_1_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">全国2連率</span>
                  <span className="stat-value">
                    {racer.racer_national_top_2_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">全国3連率</span>
                  <span className="stat-value">
                    {racer.racer_national_top_3_percent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 当地成績 */}
            <div className="stats-section">
              <h5>🏟️ 当地成績</h5>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">当地1着率</span>
                  <span className="stat-value">
                    {racer.racer_local_top_1_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">当地2連率</span>
                  <span className="stat-value">
                    {racer.racer_local_top_2_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">当地3連率</span>
                  <span className="stat-value">
                    {racer.racer_local_top_3_percent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* スタート情報 */}
            <div className="stats-section">
              <h5>🚀 スタート</h5>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">平均ST</span>
                  <span className="stat-value">
                    {racer.racer_average_start_timing.toFixed(2)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">F</span>
                  <span className="stat-value F-count">
                    {racer.racer_flying_count}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">L</span>
                  <span className="stat-value L-count">
                    {racer.racer_late_count}
                  </span>
                </div>
              </div>
            </div>

            {/* モーター・ボート成績 */}
            <div className="stats-section">
              <h5>🚤 機器成績</h5>
              <div className="machine-stats">
                <div className="machine-item">
                  <span className="machine-label">
                    モーター {racer.racer_assigned_motor_number}
                  </span>
                  <div className="machine-stats-row">
                    <span>
                      2連率:{" "}
                      {racer.racer_assigned_motor_top_2_percent.toFixed(1)}%
                    </span>
                    <span>
                      3連率:{" "}
                      {racer.racer_assigned_motor_top_3_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="machine-item">
                  <span className="machine-label">
                    ボート {racer.racer_assigned_boat_number}
                  </span>
                  <div className="machine-stats-row">
                    <span>
                      2連率:{" "}
                      {racer.racer_assigned_boat_top_2_percent.toFixed(1)}%
                    </span>
                    <span>
                      3連率:{" "}
                      {racer.racer_assigned_boat_top_3_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              ) : activeTab === "programs" ? (
                <ProgramDisplay data={data} />
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
