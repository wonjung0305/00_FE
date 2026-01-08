import { useEffect, useState } from "react";
import styles from "@/styles/LikeDislikeBar.module.css";
import api from "@/lib/axios";

type Props = {
  petitionId: number;
  good: number;
  bad: number;
  isAuthed: boolean;
  onChangeCounts?: (nextGood: number, nextBad: number) => void;
};

export default function LikeDislikeBar({ petitionId, good, bad, onChangeCounts }: Props) {
  const [loading, setLoading] = useState(false);
  const [my, setMy] = useState<null | 1 | -1>(null);

  const goodCount = Number.isFinite(Number(good)) ? Number(good) : 0;
  const badCount = Number.isFinite(Number(bad)) ? Math.abs(Number(bad)) : 0;

  const likeIcon = goodCount > 0 ? "/on.svg" : "/off.svg";
  const dislikeIcon = badCount > 0 ? "/fckon.svg" : "/fckoff.svg";

  useEffect(() => {
    if (!petitionId) return;

    let alive = true;

    api
      .get(`/api/petition/likes/${petitionId}`, { validateStatus: () => true })
      .then((r) => {
        if (!alive) return;

        if (r.status === 401) {
          setMy(null);
          return;
        }

        const d = r.data;
        const v = Number(d?.likes ?? d);

        if (v === 1 || v === -1) setMy(v as 1 | -1);
        else setMy(null);
      })
      .catch(() => {
        if (!alive) return;
        setMy(null);
      });

    return () => {
      alive = false;
    };
  }, [petitionId]);

  const applyLocalCounts = (nextMy: null | 1 | -1) => {
    let g = goodCount;
    let b = badCount;

    if (my === 1) g -= 1;
    if (my === -1) b -= 1;

    if (nextMy === 1) g += 1;
    if (nextMy === -1) b += 1;

    onChangeCounts?.(Math.max(0, g), Math.max(0, b));
  };

  const post = async (likes: 1 | -1) => {
    if (loading) return;
    setLoading(true);

    const nextMy = my === likes ? null : likes;

    applyLocalCounts(nextMy);
    setMy(nextMy);

    try {
      const r = await api.post(
        `/api/petition/likes`,
        { id: petitionId, likes },
        { validateStatus: () => true }
      );

      if (r.status === 401) {
        applyLocalCounts(my);
        setMy(my);

        if (confirm("로그인이 필요한 서비스입니다.\n로그인 하시겠습니까?")) {
          window.location.href = "/login";
        }
        return;
      }

      if (r.status >= 400) {
        applyLocalCounts(my);
        setMy(my);
        alert("요청 처리에 실패했습니다.");
        return;
      }
    } catch (error: any) {
      applyLocalCounts(my);
      setMy(my);

      if (error.response?.status === 401) {
        if (confirm("로그인이 필요한 서비스입니다.\n로그인 하시겠습니까?")) {
          window.location.href = "/login";
        }
      } else {
        alert("요청 처리에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <button
          type="button"
          className={`${styles.btn} ${my === 1 ? styles.activeGood : ""}`}
          onClick={() => post(1)}
          disabled={loading}
        >
          <span className={styles.count}>{goodCount}</span>
          <img src={likeIcon} alt="좋아요" className={styles.iconImg} />
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          className={`${styles.btn} ${my === -1 ? styles.activeBad : ""}`}
          onClick={() => post(-1)}
          disabled={loading}
        >
          <img src={dislikeIcon} alt="싫어요" className={styles.iconImg} />
          <span className={styles.count}>{badCount}</span>
        </button>
      </div>
    </div>
  );
}
