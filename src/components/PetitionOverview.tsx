import styles from "@/styles/PetitionOverview.module.css";

type Props = {
  title: string; 
  text: string;  
};

export default function PetitionOverview({ title, text }: Props) {
  if (!text) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>개요</h2>

      <div className={styles.box}>
        {title && <div className={styles.question}>{title}</div>}

        <div className={styles.body}>{text}</div>
      </div>
    </section>
  );
}