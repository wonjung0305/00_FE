import styles from "@/styles/PetitionOverview.module.css";

type Props = {
  title: string;
  text: string;
};

function splitText(text: string) {
  return text
    .split(".,")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function PetitionOverview({ text }: Props) {
  if (!text) return null;

  const paragraphs = splitText(text);

  return (
    <section className={styles.section}>
      <div className={styles.box}>
        <div className={styles.heading}>개요</div>
        <div className={styles.body}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}.</p>
          ))}
        </div>
      </div>
    </section>
  );
}
