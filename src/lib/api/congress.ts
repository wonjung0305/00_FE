// 국회안건 (국민동의청원) 전용 API
import axios from "./axios";
import type { PetitionResponse, PetitionQuery } from "./mainCard";

type CongressParams = {
  how: number;
  status: number;
  limit: number;
  page: number;
  type?: number; 
  category?: string;
  keyWord?: string; 
};

// 국회안건 (국민 동의 청원)만 가져오는 함수
export const getCongressPetitions = async (
  params: Omit<PetitionQuery, "type">
) => {
  try {
    console.log("[getCongressPetitions received params]", params);

    const response = await axios.get<any>("/petition/cardNews", {
      params: { ...params, type: 1 }, // type = 1, 국회 안건
    });

    const data = response.data;

    if (Array.isArray(data)) return data as PetitionResponse[];
    if (Array.isArray(data?.content)) return data.content as PetitionResponse[];

    const candidate = data?.data ?? data?.result ?? data?.items ?? data?.list;
    if (Array.isArray(candidate)) return candidate as PetitionResponse[];

    console.log("예상 못한 congress 응답 형태:", data);
    return [];
  } catch (error) {
    console.error("국회안건 목록 불러오기 실패", error);
    return [];
  }
};
