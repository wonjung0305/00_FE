import type { NextPage } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "@/styles/More.module.css";

import Image from "next/image";

const MorePage: NextPage = () => {
  return (
    <div className={styles.page}>
      <Header />

      {/* 이미지 영역 */}
      <div className={styles.imageSection}>
        <Image
          src="/seeMora.svg"
          alt="상세 이미지"
          width={1440}
          height={3000}
          className={styles.image}
          priority
        />
      </div>

      <Footer transparent />
    </div>
  );
};

export default MorePage;
