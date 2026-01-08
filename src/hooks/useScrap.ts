

import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteScraps, getMyScraps, postScrap, ScrapItem } from "@/lib/scrapApi";

type UseScrapOptions = {
  petitionId: number;
  onRequireLogin?: () => void;
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
      if (e?.status === 401) setScraps([]);
      else throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!petitionId) return;
    refresh();
  }, [petitionId, refresh]);

  /** ✅ next 상태로 확정 분기 */
  const setScrap = useCallback(
    async (next: boolean) => {
      if (!petitionId) return;
      if (loading) return;

      setLoading(true);
      try {
        if (next) await postScrap(petitionId);
        else await deleteScraps([petitionId]);

        await refresh();
      } catch (e: any) {
        if (e?.status === 401) {
          setScraps([]);
          onRequireLogin?.();
          return;
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [petitionId, loading, refresh, onRequireLogin]
  );

  const toggle = useCallback(async () => {
    await setScrap(!isScrapped);
  }, [isScrapped, setScrap]);

  return { scraps, isScrapped, loading, refresh, toggle, setScrap };
}
