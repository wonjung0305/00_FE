import { create } from "zustand";
import {
  deleteScraps,
  getMyScraps,
  postScrap,
  type ScrapItem,
} from "@/lib/scrapApi";

type ScrapStore = {
  scraps: ScrapItem[];

  // id별 로딩 (연타/중복 생성 방지)
  loadingById: Record<number, boolean>;

  // 전체 동기화 로딩
  syncing: boolean;

  // 서버에서 한 번 불러오기
  sync: () => Promise<void>;

  // 특정 id가 스크랩인지
  isScrapped: (petId: number) => boolean;

  // 특정 id가 로딩 중인지
  isLoading: (petId: number) => boolean;

  // 토글(추가/삭제)
  toggleScrap: (petId: number) => Promise<void>;
};

export const useScrapStore = create<ScrapStore>((set, get) => ({
  scraps: [],
  loadingById: {},
  syncing: false,

  isScrapped: (petId) => get().scraps.some((s) => s.petId === petId),
  isLoading: (petId) => !!get().loadingById[petId],

  sync: async () => {
    set({ syncing: true });
    try {
      const list = await getMyScraps();
      set({ scraps: dedupeByPetId(list) });
    } finally {
      set({ syncing: false });
    }
  },

  toggleScrap: async (petId: number) => {
    if (!petId) return;

    // 이 petId가 이미 처리 중이면 무시(중복 저장 방지)
    if (get().loadingById[petId]) return;

    // 이 petId만 로딩 표시
    set((s) => ({
      loadingById: { ...s.loadingById, [petId]: true },
    }));

    // 현재 상태 백업(실패 시 되돌리기용)
    const prevScraps = get().scraps;

    // 낙관적 업데이트: UI를 즉시 바꾼다
    const already = prevScraps.some((s) => s.petId === petId);

    if (already) {
      // 즉시 제거
      set({ scraps: prevScraps.filter((s) => s.petId !== petId) });
    } else {
      // 즉시 추가 (필수 필드가 없으니 최소 형태로 넣고, 이후 sync로 정확히 맞춤)
      set({ scraps: [...prevScraps, { petId } as any] });
    }

    try {
      // 서버 반영
      if (already) {
        await deleteScraps([petId]);
      } else {
        await postScrap(petId);
      }

      // 서버 기준으로 한번 더 동기화(정확성 확보)
      const list = await getMyScraps();
      set({ scraps: dedupeByPetId(list) });
    } catch (e) {
      // 실패하면 롤백
      set({ scraps: prevScraps });

      throw e;
    } finally {
      
      set((s) => {
        const next = { ...s.loadingById };
        delete next[petId];
        return { loadingById: next };
      });
    }
  },
}));

function dedupeByPetId(list: ScrapItem[]) {
  const map = new Map<number, ScrapItem>();
  for (const it of list ?? []) map.set(it.petId, it);
  return Array.from(map.values());
}
