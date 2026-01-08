import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/Congress.module.css";
import { useLoginToast } from "@/hooks/useLoginToast";
import LoginToast from "@/components/LoginToast";

import ListCard, { CongressCardItem } from "@/components/ListCard";

import Pagination from "@/components/Pagination";

// API + 타입 import
import { getLifePetitions } from "@/lib/api/life";
import type { PetitionResponse } from "@/lib/api/mainCard";

// 날짜 정렬을 위해서 (Date로 변환)
function parseDate(dateStr: string) {
  const normalized = dateStr.trim().replace(/\./g, "-");
  return new Date(normalized + "T00:00:00");
}

// 진행 중인가 (endDate가 오늘 이후면 진행중 (true로))
function isOngoing(endDate: string) {
  const end = parseDate(endDate);
  if (isNaN(end.getTime())) return false;

  const today = new Date();
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return end.getTime() >= today.getTime(); // 오늘 포함이면 진행중
}

// 한 페이지에 보이는 카드 수
const ITEMS_PER_PAGE = 24; // 한 페이지 카드 수 24

export default function LifePage() {
  // 필터 상태관리 (ongoing / completed)
  // 진행/완료 상태 기본은 ongoing
  const [activeStatus, setActiveStatus] = useState<"ongoing" | "completed">(
    "ongoing"
  );

  // 정렬(최신순) 드롭다운 상태 관리
  const [isSortOpen, setIsSortOpen] = useState(false); // 열림/닫힘 여부
  const [sortOption, setSortOption] = useState("최신순"); // 현재 선택된 텍스트

  // 페이지네이션 상태 (1페이지부터)
  const [currentPage, setCurrentPage] = useState(1);

  // 바깥 클릭 감지용 Ref
  const sortRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<CongressCardItem[]>([]);
  const [totalPages, setTotalPages] = useState(1); // 일단 1 (total API 붙이면 정확해짐)
  const [loading, setLoading] = useState(false);

  // 검색 input에 입력 중인 값
  const [searchInput, setSearchInput] = useState("");

  // 실제 서버에 보낼 검색어
  const [searchKeyword, setSearchKeyword] = useState("");

  // 핸들러
  const handleSortClick = (option: string) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  const { toast, toastHide, showLoginToast } = useLoginToast();

  const router = useRouter();

  useEffect(() => {
    setActiveStatus("ongoing");
    setSortOption("최신순");
    setIsSortOpen(false);

    setSearchInput("");
    setSearchKeyword("");

    setCurrentPage(1);

    router.replace("/life", undefined, { shallow: true });
  }, [router.isReady, router.query.reset]);

  // 바깥 클릭하면 정렬 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 서버 응답 -> ListCard용 변환
  const mapToCardItem = (p: PetitionResponse): CongressCardItem => {
    const raw = p.category ?? "";

    const joined = Array.isArray(raw)
      ? raw.join(", ") // ["환경","청년"] -> "환경, 청년"
      : String(raw); // "재난, 안전, 환경" -> 그대로

    return {
      id: String(p.id),
      title: p.title,
      category: joined.replace(/,\s*/g, "/"), // ListCard가 "/" 표기 쓰니까 통일
      allows: p.allows ?? 0,
      startDate: (p.voteStartDate ?? "").split("T")[0].replace(/-/g, "."),
      endDate: (p.voteEndDate ?? "").split("T")[0].replace(/-/g, "."),
    };
  };

  // 서버 호출 함수
  const fetchLife = async () => {
    setLoading(true);
    try {
      const how = sortOption === "인기순" ? 0 : 1;
      const statusForServer = activeStatus === "ongoing" ? 0 : 2;

      const data = await getLifePetitions({
        how,
        status: statusForServer,
        limit: ITEMS_PER_PAGE,
        page: currentPage,
        keyWord: searchKeyword || undefined,
      });

      // 서버 데이터 변환
      const mapped = data.map(mapToCardItem);

      setItems(mapped);

      setTotalPages(1);
    } catch (e) {
      console.error("생활안건 데이터 로딩 실패", e);
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLife();
  }, [currentPage, activeStatus, sortOption, searchKeyword]);

  // 필터/정렬 결과 바뀌면 1 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, sortOption, searchKeyword]);

  // 렌더링 하는 부분
  return (
    <>
      <LoginToast open={toast} hide={toastHide} />
      <main className={styles.container}>
        {/* 제목 영역 */}
        <section className={styles.titleSection}>
          <h1 className={styles.pageTitle}>생활안건</h1>
        </section>

        {/* 필터 및 검색 영역 */}
        <section className={styles.filterRow}>
          <div className={styles.filterLeftGroup}>
            {/* 진행 중 */}
            <button
              type="button"
              className={`${styles.statusBtn} ${
                activeStatus === "ongoing"
                  ? styles.statusBtnActive
                  : styles.statusBtnInactive
              }`}
              onClick={() => setActiveStatus("ongoing")}
            >
              진행 중
            </button>

            {/* 완료된 */}
            <button
              type="button"
              className={`${styles.statusBtn} ${
                activeStatus === "completed"
                  ? styles.statusBtnActive
                  : styles.statusBtnInactive
              }`}
              onClick={() => setActiveStatus("completed")}
            >
              완료된
            </button>

            <Image src="/divider_gray.svg" alt="구분선" width={1} height={16} />

            {/* 최신순 드롭다운 */}
            <div className={styles.dropdownWrapper} ref={sortRef}>
              <button
                type="button"
                className={styles.dropdownBtn}
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                {sortOption}
                <Image
                  src="/up_sign.svg"
                  alt="열기"
                  width={20}
                  height={20}
                  className={`${styles.iconUp} ${
                    isSortOpen ? styles.rotate : ""
                  }`}
                />
              </button>

              {isSortOpen && (
                <div className={styles.sortDropdown}>
                  <div
                    className={styles.sortOption}
                    onClick={() => handleSortClick("인기순")}
                  >
                    인기순
                  </div>
                  <div className={styles.sortDivider}></div>
                  <div
                    className={styles.sortOption}
                    onClick={() => handleSortClick("최신순")}
                  >
                    최신순
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 검색바 */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchBar}>
              <div className={styles.searchIcon}>
                <Image
                  src="/search_gray.svg"
                  alt="검색"
                  width={24}
                  height={24}
                />
              </div>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="검색어를 입력하세요."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = (
                      e.currentTarget as HTMLInputElement
                    ).value.trim();
                    setSearchKeyword(v);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* 카드리스트 영역 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)", // 한 줄에 4개
            gap: "24px",
            marginTop: "40px",
          }}
        >
          {loading && <p>로딩중...</p>}
          {!loading && items.length === 0 && <p>등록된 청원이 없습니다.</p>}
          {!loading &&
            items.map((item) => (
              <ListCard
                key={item.id}
                item={item}
                forceCategoryGray
                onLoginRequired={showLoginToast}
              />
            ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </>
  );
}
