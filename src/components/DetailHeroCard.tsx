import { useMemo, useState } from "react";
import styles from "@/styles/DetailHeroCard.module.css";

type MetaItem = {
  iconSrc: string;
  label: string;
  value: React.ReactNode;
  valueHighlight?: boolean;
};

type DetailHeroCardProps = {
  badge: string;
  title: string;

  meta: MetaItem[];

  agreeCount: number;
  percent: number;

  statusPill?: string;

  /** ✅ 제어형 상태 */
  bookmarked: boolean;

  /** ✅ 클릭 시 다음 상태를 넘김 */
  onToggleBookmark?: (next: boolean) => Promise<void> | void;

  /** ✅ 로딩 시 버튼 잠금 */
  bookmarkLoading?: boolean;

  onClickGo?: () => void;
};

const DEFAULT_ICON: Record<string, string> = {
  동의기간: "/proicons_calendar.svg",
  소관위원회: "/Group (2).svg",
  상태: "/Group (1).svg",
  청원분야: "/proicons_attach.svg",
  위원회회부일: "/proicons_send.svg",
  처리결과: "/proicons_script.svg",
};

function hasValue(v: React.ReactNode) {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  return s.length > 0 && s !== "undefined" && s !== "null";
}

export default function DetailHeroCard({
  badge,
  title,
  meta,
  agreeCount,
  percent,
  statusPill = "마감",
  bookmarked,
  onToggleBookmark,
  bookmarkLoading = false,
  onClickGo,
}: DetailHeroCardProps) {
  const value = Math.max(0, Math.min(100, percent));

  // 내부 pending(연타 방지)
  const [pending, setPending] = useState(false);
  const disabled = bookmarkLoading || pending;

  const metaMap = useMemo(() => {
    const m = new Map<string, MetaItem>();
    meta.forEach((it) => m.set(it.label, it));
    return m;
  }, [meta]);

  const orderedMeta = useMemo(() => {
    const order = [
      "동의기간",
      "소관위원회",
      "상태",
      "청원분야",
      "위원회회부일",
      "처리결과",
    ];

    return order.map((label) => {
      const found = metaMap.get(label);

      if (label === "청원분야") {
        const v = found?.value;
        return {
          iconSrc: found?.iconSrc ?? DEFAULT_ICON[label],
          label,
          value: hasValue(v) ? v : badge || "-",
          valueHighlight: found?.valueHighlight ?? false,
        };
      }

      if (label === "동의기간") {
        const raw = hasValue(found?.value) ? String(found?.value) : "-";
        const parts = raw.split("~").map((s) => s.trim());

        const valueNode =
          parts.length >= 2 ? (
            <>
              <span>{parts[0]}</span>
              <span>{` ~ `}</span>
              <span className={styles.metaValueHighlight}>{parts[1]}</span>
            </>
          ) : (
            raw
          );

        return {
          iconSrc: found?.iconSrc ?? DEFAULT_ICON[label],
          label,
          value: valueNode,
          valueHighlight: false,
        };
      }

      if (label === "처리결과") {
        const v = found?.value;
        return {
          iconSrc: found?.iconSrc ?? DEFAULT_ICON[label],
          label,
          value: hasValue(v) ? v : "-",
          valueHighlight: found?.valueHighlight ?? true,
        };
      }

      if (label === "위원회회부일" || label === "소관위원회") {
        const v = found?.value;
        return {
          iconSrc: found?.iconSrc ?? DEFAULT_ICON[label],
          label,
          value: hasValue(v) ? v : "-",
          valueHighlight: found?.valueHighlight ?? false,
        };
      }

      const v = found?.value;
      return {
        iconSrc: found?.iconSrc ?? DEFAULT_ICON[label],
        label,
        value: hasValue(v) ? v : "-",
        valueHighlight: found?.valueHighlight ?? false,
      };
    });
  }, [metaMap, badge]);

  const handleBookmark = async () => {
    if (disabled) return;
    const next = !bookmarked;

    try {
      setPending(true);
      await onToggleBookmark?.(next);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          {statusPill ? <span className={styles.statusPill}>{statusPill}</span> : <span />}

          <button
            type="button"
            className={styles.bookmarkBtn}
            onClick={handleBookmark}
            aria-label="북마크"
            aria-pressed={bookmarked}
            disabled={disabled}
          >
            <img
              src={bookmarked ? "/bookMark_colored.svg" : "/bookMark.svg"}
              alt=""
              className={styles.bookmarkIcon}
            />
          </button>
        </div>

        <h1 className={styles.title}>{title}</h1>

        <div className={styles.divider} />

        <div className={styles.metaGrid}>
          {orderedMeta.map((m) => (
            <div className={styles.metaItem} key={m.label}>
              <div className={styles.metaIconBox}>
                <img src={m.iconSrc} alt="" className={styles.metaIcon} />
              </div>

              <div className={styles.metaText}>
                <div className={styles.metaLabel}>{m.label}</div>
                <div
                  className={`${styles.metaValue} ${
                    m.valueHighlight ? styles.metaValueHighlight : ""
                  }`}
                >
                  {m.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <div className={styles.left}>
            <div className={styles.statsRow}>
              <div className={styles.people}>
                <img src="/numberofpeople.svg" alt="" className={styles.peopleIcon} />
                <span className={styles.peopleText}>{agreeCount.toLocaleString()}명</span>
              </div>

              <span className={styles.percent}>{value}%</span>
            </div>

            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${value}%` }} />
            </div>
          </div>

          <button className={styles.cta} onClick={onClickGo}>
            바로가기
          </button>
        </div>
      </div>
    </section>
  );
}
