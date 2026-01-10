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
    // category만 따로 빼서 repeat param으로 만들기
    const { category, ...rest } = params;

    const sp = new URLSearchParams();

    // 나머지 파라미터들 추가 (빈 값/undefined 제거)
    Object.entries({ ...rest, type: 1 }).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      sp.append(k, String(v));
    });

    // category는 여러 개면 category=... 를 여러 번 append
    if (Array.isArray(category)) {
      category.forEach((c) => {
        if (c) sp.append("category", c);
      });
    } else if (typeof category === "string" && category !== "") {
      sp.append("category", category);
    }

    // 최종 요청: ?category=A&category=B 형태 
    const response = await axios.get<any>(`/petition/cardNews?${sp.toString()}`);

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