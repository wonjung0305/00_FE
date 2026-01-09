import Image from "next/image";
import styles from "@/styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.center}>
        <div className={styles.links}>
          <span>이용약관</span>
          <span className={styles.divider}>|</span>
          <span>개인정보처리방침</span>
          <span className={styles.divider}>|</span>
          <span>문의하기</span>
        </div>

        <p className={styles.copy}>© 2026 mora. All rights reserved.</p>
      </div>

      <div className={styles.logoWrap}>
        <Image
          src="/mora.svg"
          alt="mora"
          width={600}
          height={180}
          priority
        />
      </div>
    </footer>
  );
}

