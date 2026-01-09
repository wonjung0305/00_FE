import { useEffect, useState } from "react";
import styles from "@/styles/LikeDislikeBar.module.css";
import api from "@/lib/axios";

type Props = {
  petitionId: number;
  good: number;
  bad: number;
  isAuthed: boolean;
  onChangeCounts?: (nextGood: number, nextBad: number) => void;
  onRequireLoginToast?: () => void;
  onRequestRefresh?: () => void;
};

type MyLike = null | 1 | -1;

function parseMyLike(data: any): MyLike {
  const v = Number(data?.likes ?? data);
  if (v === 1 || v === -1) return v as 1 | -1;
  return null;
}

function cacheKey(petitionId: number) {
  return `mora:likes:my:${petitionId}`;
}

function readCache(petitionId: number): MyLike {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(petitionId));
    const v = Number(raw);
    if (v === 1 || v === -1) return v as 1 | -1;
    return null;
  } catch {
    return null;
  }
}

function writeCache(petitionId: number, v: MyLike) {
  if (typeof window === "undefined") return;
  try {
    if (v === 1 || v === -1) window.localStorage.setItem(cacheKey(petitionId), String(v));
    else window.localStorage.removeItem(cacheKey(petitionId));
  } catch {}
}

export default function LikeDislikeBar({
  petitionId,
  good,
  bad,
  isAuthed,
  onChangeCounts,
  onRequireLoginToast,
  onRequestRefresh,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [myLoading, setMyLoading] = useState(false);

  const [my, setMy] = useState<MyLike>(() => {
    if (!petitionId) return null;
    return readCache(petitionId);
  });

  const goodCount = Number.isFinite(Number(good)) ? Number(good) : 0;
  const badCount = Number.isFinite(Number(bad)) ? Math.abs(Number(bad)) : 0;

  const likeIcon = my === 1 ? "/on.svg" : "/off.svg";
  const dislikeIcon = my === -1 ? "/fckon.svg" : "/fckoff.svg";

  useEffect(() => {
    if (!petitionId) return;
    setMy(readCache(petitionId));
  }, [petitionId]);

  useEffect(() => {
    if (!petitionId) return;

    let alive = true;
    setMyLoading(true);

    api
      .get(`/api/petition/likes/${petitionId}`, { validateStatus: () => true })
      .then((r) => {
        if (!alive) return;

        if (r.status === 401 || r.status === 402) {
          setMy(null);
          writeCache(petitionId, null);
          return;
        }

        const serverMy = parseMyLike(r.data);
        setMy(readCache(petitionId)); // 캐시 유지 
      })
      .catch(() => {
        if (!alive) return;
      })
      .finally(() => {
        if (!alive) return;
        setMyLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [petitionId]);

  const applyLocalCounts = (prevMy: MyLike, nextMy: MyLike) => {
    let g = goodCount;
    let b = badCount;

    if (prevMy === 1) g -= 1;
    if (prevMy === -1) b -= 1;

    if (nextMy === 1) g += 1;
    if (nextMy === -1) b += 1;

    onChangeCounts?.(Math.max(0, g), Math.max(0, b));
  };

  const post = async (likes: 1 | -1) => {
    if (!isAuthed) {
      onRequireLoginToast?.();
      return;
    }

    if (loading || myLoading) return;
    setLoading(true);

    const prevMy = my;
    const nextMy: MyLike = prevMy === likes ? null : likes;

    applyLocalCounts(prevMy, nextMy);
    setMy(nextMy);
    writeCache(petitionId, nextMy);

    try {
      const r = await api.post(
        `/api/petition/likes`,
        { id: petitionId, likes },
        { validateStatus: () => true }
      );

      if (r.status === 401 || r.status === 402) {
        applyLocalCounts(nextMy, prevMy);
        setMy(prevMy);
        writeCache(petitionId, prevMy);
        onRequireLoginToast?.();
        return;
      }

      if (r.status >= 400) {
        applyLocalCounts(nextMy, prevMy);
        setMy(prevMy);
        writeCache(petitionId, prevMy);
        alert("요청 처리에 실패했습니다.");
        return;
      }

      onRequestRefresh?.();
    } catch {
      applyLocalCounts(nextMy, prevMy);
      setMy(prevMy);
      writeCache(petitionId, prevMy);
      alert("요청 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || myLoading;

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <button
          type="button"
          className={`
            ${styles.btn}
            ${styles.likeBtn}
            ${my === 1 ? styles.activeGood : ""}
          `}
          onClick={() => post(1)}
          disabled={disabled}
        >
          <span className={styles.count}>{goodCount}</span>
          <img src={likeIcon} alt="좋아요" className={styles.iconImg} />
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          className={`
            ${styles.btn}
            ${styles.dislikeBtn}
            ${my === -1 ? styles.activeBad : ""}
          `}
          onClick={() => post(-1)}
          disabled={disabled}
        >
          <img src={dislikeIcon} alt="싫어요" className={styles.iconImg} />
          <span className={styles.count}>{badCount}</span>
        </button>
      </div>
    </div>
  );
}
