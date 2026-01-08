import localApi from "@/lib/axios";

export type ScrapItem = {
  petId: number;
  title: string;
  status: number;
  result: string;
  voteStartDate: string;
  voteEndDate: string;
};

/* 내 스크랩 조회*/
export async function getMyScraps(): Promise<ScrapItem[]> {
  const r = await localApi.get("/api/user/scrap", { validateStatus: () => true });

  if (r.status === 401 || r.status === 402) return [];
  if (r.status < 200 || r.status >= 300) throw r;

  return Array.isArray(r.data) ? r.data : [];
}

/* 스크랩 삭제 */
export async function deleteScraps(ids: number[]): Promise<void> {
  const r = await localApi.delete("/api/user/scrap", {
    data: ids, // 배열 자체만 보내기
    headers: {
      "Content-Type": "application/json",
    },
    validateStatus: () => true,
  });

  if (r.status === 401 || r.status === 402) throw { status: r.status };
  if (r.status < 200 || r.status >= 300) throw r;
}
/* 스크랩 추가: */
export async function postScrap(petId: number): Promise<void> {
  const r = await localApi.post(`/api/petition/scrap/${petId}`, null, {
    validateStatus: () => true,
  });

  if (r.status === 401 || r.status === 402) throw { status: r.status };
  if (r.status < 200 || r.status >= 300) throw r;
}
