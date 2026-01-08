

import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export type ScrapItem = {
  petId: number;
  title: string;
  status: number;
  result: string;
  voteStartDate: string;
  voteEndDate: string;
};

function authHeader() {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMyScraps(): Promise<ScrapItem[]> {
  const r = await axios.get("/api/user/scrap", {
    headers: authHeader(),
    validateStatus: () => true,
  });

  if (r.status === 200) return r.data ?? [];

  const err: any = new Error("getMyScraps failed");
  err.status = r.status;
  err.data = r.data;
  throw err;
}

export async function postScrap(petitionId: number) {
  const r = await axios.post(`/api/petition/scrap/${petitionId}`, null, {
    headers: authHeader(),
    validateStatus: () => true,
  });

  if (r.status === 200) return r.data;

  const err: any = new Error("postScrap failed");
  err.status = r.status;
  err.data = r.data;
  throw err;
}

export async function deleteScraps(ids: number[]) {
  const r = await axios.delete("/api/user/scrap", {
    headers: authHeader(),
    data: { id: ids }, // 명세: { id: [petitionId...] }
    validateStatus: () => true,
  });

  if (r.status === 200) return r.data;

  const err: any = new Error("deleteScraps failed");
  err.status = r.status;
  err.data = r.data;
  throw err;
}
