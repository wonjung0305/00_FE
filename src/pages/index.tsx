import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import styles from "@/styles/Home.module.css";

import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import Banner from "@/components/Banner";
import PetitionCard, { PetitionCardItem } from "@/components/PetitionCard";

import { getPetitions, PetitionResponse } from "@/lib/api/mainCard";

import { useLoginToast } from "@/hooks/useLoginToast";
import LoginToast from "@/components/LoginToast";
import { useScrapStore } from "@/store/scrapStore";

export default function Home() {
  const [assemblyList, setAssemblyList] = useState<PetitionCardItem[]>([]);
  const [dailyList, setDailyList] = useState<PetitionCardItem[]>([]);

  const { toast, toastHide, showLoginToast } = useLoginToast();

  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const syncScraps = useScrapStore((s) => s.sync);

  useEffect(() => {
    syncScraps();
  }, [isAuthed, syncScraps]);

  // 토큰 저장용
  const router = useRouter();

  // 데이터를 불러오기 함수
  const formatData = (list: PetitionResponse[]): PetitionCardItem[] => {
    if (!Array.isArray(list)) return [];

    return list.map((item) => ({
      id: String(item.id),
      title: item.title,
      category: item.category ?? "",
      allows: item.allows ?? 0,
      startDate: (item.voteStartDate ?? "").split("T")[0],
      endDate: (item.voteEndDate ?? "").split("T")[0],
      status: item.status as 0 | 1 | 2,
    }));
  };

  const fetchData = async () => {
    try {
      const [assemblyData, dailyData] = await Promise.all([
        getPetitions({ type: 1, how: 1, limit: 4 }),
        getPetitions({ type: 0, how: 1, limit: 4 }),
      ]);

      const formattedAssembly = formatData(assemblyData).sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      const formattedDaily = formatData(dailyData).sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      setAssemblyList(formattedAssembly);
      setDailyList(formattedDaily);
    } catch (error) {
      console.error("[Home] fetchData error", error);
      setAssemblyList([]);
      setDailyList([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 토큰 저장
  useEffect(() => {
    if (!router.isReady) return;

    const token = router.query.token;
    if (typeof token !== "string" || !token) return;

    // 토큰 저장 (fetchMe는 store의 setToken에서 자동 수행)
    useAuthStore.getState().setToken(token);

    // 내 정보 가져오기
    useAuthStore.getState().fetchMe();

    // afterSignup이면 설문으로, 아니면 메인 유지
    // 회원가입 직후 플래그(afterSignup)면 설문으로, 아니면 메인 유지
    const afterSignup = sessionStorage.getItem("afterSignup") === "1";
    if (afterSignup) sessionStorage.removeItem("afterSignup");

    // 주소창에서 token 쿼리 제거 + 분기 이동
    router.replace(afterSignup ? "/signup/complete" : "/", undefined, {
      shallow: true,
    });
  }, [router.isReady, router.query.token]);

  return (
    <>
      <Header />
      <LoginToast open={toast} hide={toastHide} />

      <div className={styles.page}>
        <Banner />

        <main className={styles.main}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>최신 국회 안건</h2>

              <Link href="/congress" className={styles.moreLink}>
                더보기
                <div className={styles.iconBox}>
                  <Image
                    src="/right_arrow_gray.svg"
                    alt="이동"
                    width={16}
                    height={16}
                    className={styles.iconGray}
                  />
                  <Image
                    src="/right_arrow_black.svg"
                    alt="이동"
                    width={16}
                    height={16}
                    className={styles.iconBlack}
                  />
                </div>
              </Link>
            </div>

            <div className={styles.cardGrid}>
              {assemblyList.length === 0 && <p>등록된 청원이 없습니다.</p>}
              {assemblyList.map((item) => (
                <PetitionCard
                  key={item.id}
                  item={item}
                  onLoginRequired={showLoginToast}
                />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>최신 생활 안건</h2>

              <Link href="/life" className={styles.moreLink}>
                더보기
                <div className={styles.iconBox}>
                  <Image
                    src="/right_arrow_gray.svg"
                    alt="이동"
                    width={16}
                    height={16}
                    className={styles.iconGray}
                  />
                  <Image
                    src="/right_arrow_black.svg"
                    alt="이동"
                    width={16}
                    height={16}
                    className={styles.iconBlack}
                  />
                </div>
              </Link>
            </div>

            <div className={styles.cardGrid}>
              {dailyList.length === 0 && <p>등록된 청원이 없습니다.</p>}
              {dailyList.map((item) => (
                <PetitionCard
                  key={item.id}
                  item={item}
                  forceCategoryGray
                  onLoginRequired={showLoginToast}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
