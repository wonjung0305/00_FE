// mora/src/hooks/useScrap.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteScraps, getMyScraps, postScrap, ScrapItem } from "@/lib/scrapApi";

type UseScrapOptions = {
  petitionId: number;
  onRequireLogin?: () => void; // 401일 때 실행
};

export function useScrap({ petitionId, onRequireLogin }: UseScrapOptions) {
  const [scraps, setScraps] = useState<ScrapItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const isScrapped = useMemo(() => {
    if (!scraps) return false;
    return scraps.some((s) => s.petId === petitionId);
  }, [scraps, petitionId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getMyScraps();
      setScraps(list);
    } catch (e: any) {
      if (e?.status === 401) {
        setScraps([]); // 미로그인은 "스크랩 없음"으로 처리
      } else {
        throw e;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(async () => {
    if (loading) return; // 연타 방지
    setLoading(true);

    try {
      if (isScrapped) {
        await deleteScraps([petitionId]);
      } else {
        await postScrap(petitionId);
      }
      await refresh();
    } catch (e: any) {
      if (e?.status === 401) {
        setScraps([]); // 상태 일관성
        onRequireLogin?.();
        return;
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, [loading, isScrapped, petitionId, refresh, onRequireLogin]);

  return { scraps, isScrapped, loading, refresh, toggle };
}
