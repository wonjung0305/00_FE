import styles from "@/styles/ConsCard.module.css";

type Item = {
  title: string;
  desc: React.ReactNode;
};

type Props = {
  items: Item[];
  tags?: string[];
};

export default function ConsCard({ items, tags = [] }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <span className={styles.badge}>부정적</span>
        <div className={styles.rule} />
      </div>

      <div className={styles.list}>
        {items.map((it, idx) => (
          <div key={`${it.title}-${idx}`} className={styles.item}>
            <div className={styles.itemTitle}>{it.title}</div>
            <p className={styles.itemDesc}>{it.desc}</p>
          </div>
        ))}
      </div>

      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((t, i) => (
            <span key={`${t}-${i}`} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
