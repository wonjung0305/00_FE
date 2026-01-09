// ListCard는 국회 안건(Congress,국민 동의 청원),  생활안건(청원24)에서 쓰이는 공통 카드

import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Listcard.module.css";

import { useAuthStore } from "@/store/authStore";
import { useScrapStore } from "@/store/scrapStore";
import { toDateOnly, isClosedByEndDate, ddayByEndDate } from "@/lib/dateRule";

// 데이터 타입 정의
export type CongressCardItem = {
  id: string;
  title: string;
  category: string;
  allows: number;
  startDate: string;
  endDate: string;
};

// 카테고리별 색상 매핑
const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  "정치, 선거, 국회운영": { bg: "#e7f0ff", text: "#6990cf" },
  "수사, 법무, 사법제도": { bg: "#e7f0ff", text: "#6990CF" },
  "재정, 세제, 금융, 예산": { bg: "#e7f0ff", text: "#6990CF" },
  "소비자, 공정거래": { bg: "#fff4e6", text: "#daa25b" },
  교육: { bg: "#efe7ff", text: "#9071cd" },
  "과학기술, 정보통신": { bg: "#efe7ff", text: "#9071cd" },
  "외교, 통일, 국방, 안보": { bg: "#efe7ff", text: "#9071cd" },
  "재난, 안전, 환경": { bg: "#fff9e8", text: "#cda430" },
  "행정, 지방자치": { bg: "#f0fff0", text: "#79B495" },
  "문화, 체육, 관광, 언론": { bg: "#fff9e8", text: "#cda430" },
  "농업, 임업, 수산업, 축산업": { bg: "#fff4e6", text: "#daa25b" },
  "산업, 통상": { bg: "#f0fff0", text: "#79B495" },
  보건의료: { bg: "#ffe8ee", text: "#c77288" },
  "복지, 보훈": { bg: "#ffe8ee", text: "#c77288" },
  "국토, 해양, 교통": { bg: "#f0fff0", text: "#79B495" },
  "인권, 성평등, 노동": { bg: "#ffe8ee", text: "#c77288" },
  "저출산, 고령화, 아동, 청소년, 가족": { bg: "#ffe8ee", text: "#c77288" },
  기타: { bg: "#f1f1f1", text: "#767676" },
};

// 숫자 포맷 (1,000)
function formatNumber(n: number) {
  return n.toLocaleString("ko-KR");
}

type Props = {
  item: CongressCardItem;
  href?: string;

  forceCategoryGray?: boolean;
  // 페이지에서 toast 띄우는 함수 내려받기
  onLoginRequired?: () => void;
};

export default function CongressCard({
  item,
  href,
  forceCategoryGray,
  onLoginRequired,
}: Props) {
  // 카테고리 키 / -> ,
  const categoryKey = item.category.replace(/\//g, ", ");

  // 카테고리 스타일 가져오기
  const catStyle = forceCategoryGray
    ? { bg: "#f1f1f1", text: "#767676" }
    : CATEGORY_STYLES[categoryKey] ?? { bg: "#f1f1f1", text: "#767676" };
  const formattedCategory = item.category.replace(/\//g, " · ");

  // 종료일 당일(0)은 마감으로 처리
  const end = toDateOnly(item.endDate.replace(/\./g, "-")); // item.endDate가 "YYYY.MM.DD"라서 -로 맞춤
  const closed = end ? isClosedByEndDate(end) : false;
  const dday = end ? ddayByEndDate(end) : null;

  // 긴급은 "마감 전 1~7일"만 빨강 (0은 마감이므로 제외)
  const isUrgent = dday !== null && dday >= 1 && dday <= 7;

  // 링크 주소
  const detailHref = href ?? `/petition/${item.id}`;

  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  const isLoading = useScrapStore((s) => s.isLoading);
  const toggleScrap = useScrapStore((s) => s.toggleScrap);
  const petId = Number(item.id);

  const scrapped = useScrapStore((s) =>
    Number.isFinite(petId) ? s.scraps.some((x) => x.petId === petId) : false
  );

  // 로딩도 boolean으로 구독하는 게 더 확실함
  const loading = useScrapStore((s) =>
    Number.isFinite(petId) ? !!s.loadingById[petId] : false
  );

  return (
    <article className={styles.cardWrapper}>
      {/* 헤더: D-Day & 북마크 */}
      <div className={styles.headerRow}>
        <span
          className={`${styles.ddayBadge} ${isUrgent ? styles.ddayRed : ""}`}
        >
          {!end ? "-" : closed ? "마감" : dday === null ? "-" : `D-${dday}`}
        </span>
        <button
          className={styles.bookmarkBtn}
          type="button"
          aria-label="북마크"
          onClick={async (e) => {
            // 이벤트 버블링 방지
            e.stopPropagation();

            if (!Number.isFinite(petId)) return;

            // 로그인 아니면 부모에게 toast 요청
            if (!isAuthed) {
              onLoginRequired?.();
              return;
            }

            if (isLoading(petId)) return;

            // 서버 처리 + store 갱신 끝날 때까지 기다림
            await toggleScrap(petId);
          }}
        >
          <Image
            src={scrapped ? "/bookMark_colored.svg" : "/bookMark.svg"}
            alt=""
            width={24}
            height={24}
          />
        </button>
      </div>

      <div className={styles.infoGroup}>
        <div className={styles.date}>{item.startDate}</div>
        <h3 className={styles.title}>{item.title}</h3>
      </div>

      {/* 카테고리 뱃지 */}
      <div className={styles.categoryWrapper}>
        <span
          className={styles.categoryBadge}
          style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
        >
          {formattedCategory}
        </span>
      </div>

      {/* --- 하단 바 (동의자 수) --- */}
      <Link href={detailHref} className={styles.bottomBar}>
        <div className={styles.agreeInfo}>
          {/* 체크 아이콘 (보라색) */}
          <div className={styles.checkIcon}>
            <Image src="/agree_purple.svg" alt="동의" width={24} height={24} />
          </div>
          <span>{formatNumber(item.allows)}명</span>
        </div>

        {/* 오른쪽 화살표 */}
        <div className={styles.arrowIcon}>
          <Image
            src="/right_arrow_black.svg"
            alt="이동"
            width={24}
            height={24}
          />
        </div>
      </Link>
    </article>
  );
}
