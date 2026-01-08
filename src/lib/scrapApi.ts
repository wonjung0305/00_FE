// mora/src/lib/scrapApi.ts
import localApi from "@/lib/axios";

export type ScrapItem = {
  petId: number;
  title: string;
  status: number;
  result: string;
  voteStartDate: string;
  voteEndDate: string;
};

type ApiError = { status: number; message: string };

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function normalizeAxiosError(e: any): ApiError {
  const status = e?.response?.status ?? 0;
  const message =
    e?.response?.data?.message ??
    (typeof e?.response?.data === "string" ? e.response.data : null) ??
    e?.message ??
    "요청에 실패했습니다.";
  return { status, message };
}

export async function postScrap(petitionId: number): Promise<void> {
  try {
    await localApi.post(`${API_BASE}/petition/scrap/${petitionId}`);
  } catch (e: any) {
    throw normalizeAxiosError(e);
  }
}

export async function getMyScraps(): Promise<ScrapItem[]> {
  try {
    const res = await localApi.get<ScrapItem[]>(`${API_BASE}/user/scrap`);
    return res.data;
  } catch (e: any) {
    throw normalizeAxiosError(e);
  }
}

export async function deleteScraps(petitionIds: number[]): Promise<void> {
  try {
    await localApi.delete(`${API_BASE}/user/scrap`, {
      data: { id: petitionIds }, 
    });
  } catch (e: any) {
    throw normalizeAxiosError(e);
  }
}
