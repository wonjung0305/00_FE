// mora/src/lib/api/mainCard.ts

import axios from "./axios";

export interface PetitionResponse {
  id: number;
  title: string;
  type: number; // 0: 청원24, 1: 국민동의청원
  status: 0 | 1; // 0,1,(진행, 심사, 종료)
  category: string;
  subtitle: string;
  voteStartDate: string;
  voteEndDate: string;
  allows: number;
}

export interface PetitionQuery {
  type?: number;
  status?: 0 | 1;
  limit?: number;
  page?: number;
  how: number; // 0(동의자/인기), 1(최신)
  keyWord?: string;
  category?: string | string[];
}

export interface PetitionTotalResponse {
  totalElements: number;
  totalPages: number;
}

function cleanParams<T extends Record<string, any>>(params: T) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

export const getPetitions = async (params: PetitionQuery) => {
  const cleaned = cleanParams(params);

  const res = await axios.get<PetitionResponse[]>("/petition/cardNews", {
    params: cleaned,
  });

  const data = res.data;

  if (Array.isArray(data)) return data;

  return [];
};

export const getPetitionsTotal = async (params: PetitionQuery) => {
  const cleaned = cleanParams(params);

  const res = await axios.get<PetitionTotalResponse>("/petition/cardNews/total", {
    params: cleaned,
  });

  return res.data;
};
