import axios from 'axios';

// APIのベースURL
const API_BASE_URL = 'http://localhost:8000/api';

// APIクライアントの設定
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// データの型定義
export interface RaceData {
  race_date: string;
  stadium_number: number;
  race_number: number;
  data: any;
}

export interface StadiumData {
  race_date: string;
  data: any;
}

// API関数
export const api = {
  // プログラム情報を取得
  getPrograms: async (
    raceDate: string,
    stadiumNumber: number,
    raceNumber: number
  ): Promise<RaceData> => {
    const response = await apiClient.get(
      `/programs/${raceDate}/${stadiumNumber}/${raceNumber}`
    );
    return response.data as RaceData;
  },

  // オッズ情報を取得
  getOdds: async (
    raceDate: string,
    stadiumNumber: number,
    raceNumber: number
  ): Promise<RaceData> => {
    const response = await apiClient.get(
      `/odds/${raceDate}/${stadiumNumber}/${raceNumber}`
    );
    return response.data as RaceData;
  },

  // 予想情報を取得
  getPreviews: async (
    raceDate: string,
    stadiumNumber: number,
    raceNumber: number
  ): Promise<RaceData> => {
    const response = await apiClient.get(
      `/previews/${raceDate}/${stadiumNumber}/${raceNumber}`
    );
    return response.data as RaceData;
  },

  // 結果情報を取得
  getResults: async (
    raceDate: string,
    stadiumNumber: number,
    raceNumber: number
  ): Promise<RaceData> => {
    const response = await apiClient.get(
      `/results/${raceDate}/${stadiumNumber}/${raceNumber}`
    );
    return response.data as RaceData;
  },

  // 競艇場情報を取得
  getStadiums: async (raceDate: string): Promise<StadiumData> => {
    const response = await apiClient.get(`/stadiums/${raceDate}`);
    return response.data as StadiumData;
  },

  // ヘルスチェック
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};