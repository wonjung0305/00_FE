import styles from "@/styles/DetailMiniCard.module.css";

type MiniMetaItem = {
  iconSrc: string;
  label: string;
  value: string;
  valueHighlight?: boolean;
};

type DetailMiniCardProps = {
  badge: string;
  title: string;
  meta: MiniMetaItem[];
  agreeCount: number;
  percent: number;
  onClickGo?: () => void;
};

export default function DetailMiniCard({
  badge,
  title,
  meta,
  agreeCount,
  percent,
  onClickGo,
}: DetailMiniCardProps) {
  const value = Math.round(Math.max(0, Math.min(100, percent)));

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <span className={styles.badge}>{badge}</span>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.dividerTop} />

        <div className={styles.metaList}>
          {meta.map((m, idx) => (
            <div className={styles.metaItem} key={`${m.label}-${idx}`}>
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

        <div className={styles.dividerBottom} />

        <div className={styles.statsRow}>
          <div className={styles.people}>
            <img src="/numberofpeople.svg" className={styles.peopleIcon} />
            <span className={styles.peopleText}>
              {agreeCount.toLocaleString()}명
            </span>
          </div>
          <span className={styles.percent}>{value}%</span>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${value}%` }}
          />
        </div>

        <button className={styles.cta} onClick={onClickGo}>
          바로가기
        </button>
      </div>
    </section>
  );
}
