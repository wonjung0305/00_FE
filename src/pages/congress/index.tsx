import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { KeyboardEvent } from "react";
import styles from "@/styles/Congress.module.css";

import Footer from "@/components/Footer";

import { useLoginToast } from "@/hooks/useLoginToast";
import LoginToast from "@/components/LoginToast";
import { useScrapStore } from "@/store/scrapStore";
import { useAuthStore } from "@/store/authStore";

import { endDateByRule, formatDot } from "@/lib/dateRule";

import ListCard, { CongressCardItem } from "@/components/ListCard";

import Pagination from "@/components/Pagination";

// API + 타입 import
import { getCongressPetitions } from "@/lib/api/congress";
import type { PetitionResponse } from "@/lib/api/mainCard";

// 카테고리 목록 데이터 (4열 배치를 위해 순서대로 나열)
const CATEGORIES = [
  "정치/선거/국회운영",
  "산업/통상",
  "외교/통일/국방/안보",
  "문화/체육/관광/언론",
  "수사/법무/사법제도",
  "소비자/공정거래",
  "보건의료",
  "재난/안전/환경",
  "재정/세제/금융/예산",
  "농업/임업/수산업/축산업",
  "복지/보훈",
  "기타",
  "행정/지방자치",
  "교육",
  "인권/성평등/노동",
  "", // 빈칸 맞추기용
  "국토/해양/교통",
  "과학기술/정보통신",
  "저출산/고령화/아동/청소년/가족",
  "",
];

// 한 페이지에 보이는 카드 수
const ITEMS_PER_PAGE = 24; // 한 페이지 카드 수 24

export default function CongressPage() {
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

  // 카테고리 드롭다운 State & Ref
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // 진짜 저장된 카테고리 (서버로 보낼 데이터)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // 드롭다운 안에서만 쓰는 임시 카테고리
  const [tempCategories, setTempCategories] = useState<string[]>([]);

  const categoryRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 감지용 Ref
  const sortRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<CongressCardItem[]>([]);
  const [totalPages, setTotalPages] = useState(1); // 일단 1 (total API 붙이면 정확해짐)
  const [loading, setLoading] = useState(false);

  // input에 입력 중인 텍스트
  const [inputText, setInputText] = useState("");

  // 실제 서버 검색에 쓰일 확정 키워드
  const [searchKeyword, setSearchKeyword] = useState("");

  /* 토스트 - 로그인 했는지 */
  const { toast, toastHide, showLoginToast } = useLoginToast();
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const syncScraps = useScrapStore((s) => s.sync);

  // 바깥 클릭하면 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // sortRef가 존재하고
      // 클릭한 곳(event.target)이 sortRef 안쪽이 아니라면 닫기
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }

      // 카테고리 닫기 (저장을 안 하고 닫음)
      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setIsCategoryOpen(false);
      }
    }

    // 화면 전체에 클릭 이벤트 리스너 붙이기
    document.addEventListener("mousedown", handleClickOutside);

    // 컴포넌트가 사라질 때 리스너 제거
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 핸들러
  // 정렬 옵션 선택
  const handleSortClick = (option: string) => {
    setSortOption(option); // 텍스트 변경 (예: 최신순 -> 인기순)
    setIsSortOpen(false); // 드롭다운 닫기
  };

  // 카테고리 드롭다운 열기/닫기 버튼 클릭 시
  const handleCategoryDropdownToggle = () => {
    setIsCategoryOpen((prev) => {
      // 열릴 때만 temp 동기화
      if (!prev) setTempCategories([...selectedCategories]);
      return !prev;
    });
  };

  // 카테고리 체크박스 클릭 (임시 데이터만 건드림)
  const toggleCategory = (category: string) => {
    if (!category) return;

    setTempCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  };

  // 적용하기 버튼 (임시 데이터를 진짜 데이터로 저장)
  const handleApplyCategory = () => {
    setSelectedCategories(tempCategories); // 저장
    setIsCategoryOpen(false); // 닫기
  };

  // 선택 초기화 (드롭다운 안에서만 초기화)
  const handleResetTempCategories = () => {
    setTempCategories([]); // 체크 표시도 즉시 해제
    setSelectedCategories([]); // 서버 필터도 즉시 해제
    setIsCategoryOpen(false); // 드롭다운 닫기
    setCurrentPage(1); // 1페이지로
  };

  // 서버 응답 -> ListCard용 변환
  const mapToCardItem = (p: PetitionResponse): CongressCardItem => {
    const raw = p.category ?? "";

    const computedEnd = endDateByRule(p.voteStartDate);

    const joined = Array.isArray(raw)
      ? raw.join(", ") // ["환경","청년"] -> "환경, 청년"
      : String(raw); // "재난, 안전, 환경" -> 그대로

    return {
      id: String(p.id),
      title: p.title,
      category: joined.replace(/,\s*/g, "/"), // ListCard가 "/" 표기 쓰니까 통일
      allows: p.allows ?? 0,
      startDate: (p.voteStartDate ?? "").split("T")[0].replace(/-/g, "."),
      endDate: computedEnd
        ? formatDot(computedEnd)
        : (p.voteEndDate ?? "").split("T")[0].replace(/-/g, "."),
      status: p.status,
    };
  };

  // 서버 호출 함수
  const fetchCongress = async () => {
    setLoading(true);

    try {
      const how = sortOption === "인기순" ? 0 : 1;
      const statusForServer = activeStatus === "ongoing" ? 0 : 1;

      const categoryForServer =
        selectedCategories.length === 0 ? undefined : selectedCategories[0];

      const keyword = searchKeyword.trim();

      const data = await getCongressPetitions({
        how,
        status: statusForServer,
        limit: ITEMS_PER_PAGE,
        page: currentPage,
        category: categoryForServer,
        keyWord: keyword ? keyword : undefined,
      });

      // 서버 데이터 변환
      const mapped = data.map(mapToCardItem);

      setItems(mapped);

      setTotalPages(1);
    } catch (e) {
      console.error("국회안건 데이터 로딩 실패", e);
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCongress();
  }, [
    currentPage,
    activeStatus,
    sortOption,
    selectedCategories,
    searchKeyword,
  ]);

  // 필터/정렬 결과 바뀌면 1 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, sortOption, selectedCategories, searchKeyword]);

  //로그인 상태면 스크랩 목록을 한 번 동기화
  useEffect(() => {
    if (!isAuthed) return;
    syncScraps();
  }, [isAuthed, syncScraps]);

  // 렌더링 하는 부분
  return (
    <>
      <LoginToast open={toast} hide={toastHide} />

      <main className={styles.container}>
        {/* 제목 영역 */}
        <section className={styles.titleSection}>
          <h1 className={styles.pageTitle}>국회안건</h1>
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

            {/* 카테고리 드롭다운 */}
            <div className={styles.dropdownWrapper} ref={categoryRef}>
              {/* 버튼 클릭 시 handleCategoryDropdownToggle 실행 */}
              <button
                type="button"
                className={styles.dropdownBtn}
                onClick={handleCategoryDropdownToggle}
              >
                카테고리
                <Image
                  src="/up_sign.svg"
                  alt="열기"
                  width={20}
                  height={20}
                  className={`${styles.iconUp} ${
                    isCategoryOpen ? styles.rotate : ""
                  }`}
                />
              </button>

              {isCategoryOpen && (
                <div className={styles.categoryDropdown}>
                  <div className={styles.categoryGrid}>
                    {CATEGORIES.map((cat, index) =>
                      cat === "" ? (
                        <div key={index}></div>
                      ) : (
                        <div
                          key={cat}
                          className={styles.categoryItem}
                          onClick={() => toggleCategory(cat)}
                        >
                          <Image
                            src={
                              tempCategories.includes(cat)
                                ? "/checked.svg" // 보라색 체크 (파일명 확인 필수)
                                : "/checkbox.svg" // 회색 빈 박스 (파일명 확인 필수)
                            }
                            alt="check"
                            width={24}
                            height={24}
                            className={styles.checkboxIcon}
                          />
                          <span
                            className={
                              tempCategories.includes(cat)
                                ? styles.activeText
                                : ""
                            }
                          >
                            {cat}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className={styles.categoryFooter}>
                    {/* 적용하기 버튼 */}
                    <button
                      type="button"
                      className={styles.applyBtn}
                      onClick={handleApplyCategory}
                    >
                      적용하기
                    </button>

                    {/* 초기화 버튼 */}
                    <button
                      type="button"
                      className={styles.resetBtn}
                      onClick={handleResetTempCategories}
                    >
                      <Image
                        src="/return.svg"
                        alt="초기화"
                        width={12}
                        height={12}
                        className={styles.resetIcon}
                      />
                      선택 초기화
                    </button>
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
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                }}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  const composing =
                    (e.nativeEvent as any)?.isComposing === true;

                  if (composing) return;

                  if (e.key === "Enter") {
                    const v = e.currentTarget.value.trim();

                    setSearchKeyword(v);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* 카드리스트 영역 */}
        <div className={styles.cardGrid}>
          {loading && <p>로딩중...</p>}
          {!loading && items.length === 0 && <p>등록된 청원이 없습니다.</p>}

          {!loading &&
            items.map((item) => (
              <ListCard
                key={item.id}
                item={item}
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

      <Footer />
    </>
  );
}
