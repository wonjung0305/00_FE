import Image from "next/image";
import styles from "@/styles/Footer.module.css";

type FooterProps = {
  transparent?: boolean; // /more에서만 true로 주기 위함
};

export default function Footer({ transparent = false }: FooterProps) {
  return (
    <footer
      className={`${styles.footer} ${transparent ? styles.transparent : ""}`}
    >

      {/* 상단 링크 영역 - 실제로 되지는 않음 */}
      <div className={styles.links}>
        <span className={styles.link}>이용약관</span>
        <span className={styles.separator}>|</span>
        <span className={styles.link}>개인정보처리방침</span>
        <span className={styles.separator}>|</span>
        <span className={styles.link}>문의하기</span>
      </div>

      {/* 저작권 문구 */}
      <div className={styles.copyright}>© 2026 mora. All rights reserved.</div>

      {/* 로고 영역 */}
      <div className={styles.logoWrapper}>
        <Image src="/footer_logo.svg" alt="mora footer logo" fill priority />
      </div>
    </footer>
  );
}
