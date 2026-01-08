/* 카드 UI 1개 */
/* 메인페이지에서 사용하는 카드 */

import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/PetitionCard.module.css";
import { useAuthStore } from "@/store/authStore";
import { useScrapStore } from "@/store/scrapStore";

// 서버와 주고받을 데이터 타입
export type PetitionCardItem = {
  id: string; // 청원 id
  title: string; // 청원 제목
  category: string; // 카테고리
  allows: number; // 동의자 수
  startDate: string; // 시작 날짜 (YYYY-MM-DD)
  endDate: string; // 마감 날짜 (YYYY-MM-DD)

  status?: 0 | 1 | 2;
  type?: string;
};

// 카테고리 스타일 매핑
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

// 숫자 포맷
function formatNumber(n: number) {
  return n.toLocaleString("ko-KR");
}

// D-day 계산
function calcDday(endDate: string) {
  const end = new Date(endDate + "T00:00:00");
  const today = new Date();

  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Props
type PetitionCardProps = {
  item: PetitionCardItem;
  href?: string;
  forceCategoryGray?: boolean;

  onLoginRequired?: () => void;
};

export default function PetitionCard({
  item,
  href,
  forceCategoryGray,
  onLoginRequired,
}: PetitionCardProps) {
  // 카테고리 정규화
  const categoryKey = (item.category ?? "").trim().replace(/\//g, ", ");

  const categoryStyle = forceCategoryGray
    ? { bg: "#f1f1f1", text: "#767676" }
    : CATEGORY_STYLES[categoryKey] ?? { bg: "#f1f1f1", text: "#767676" };

  const formattedCategory = (item.category ?? "")
    .replace(/\//g, " · ")
    .replace(/,\s*/g, " · ");

  const dday = calcDday(item.endDate);
  const isUrgent = dday >= 0 && dday <= 7;
  const badgeColorClass = isUrgent ? styles.ddayRed : styles.ddayGray;

  // 상세 페이지 경로 (단수 petition!)
  const detailHref = href ?? `/petition/${item.id}`;

  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useScrapStore((s) => s.isLoading);

  const petId = Number(item.id);
  const scrapped = useScrapStore((s) =>
    Number.isFinite(petId) ? s.scraps.some((x) => x.petId === petId) : false
  );

  const loading = useScrapStore((s) =>
    Number.isFinite(petId) ? !!s.loadingById[petId] : false
  );

  const toggleScrap = useScrapStore((s) => s.toggleScrap);

  return (
    <article className={styles.cardWrapper}>
      {/* 상단 흰 카드 영역 (클릭 이동 x) */}
      <div className={styles.whiteCard}>
        <div className={styles.headerRow}>
          <span className={`${styles.ddayBadge} ${badgeColorClass}`}>
            {dday >= 0 ? `D-${dday}` : "마감"}
          </span>

          <button
            className={styles.bookmarkBtn}
            type="button"
            aria-label="북마크"
            onClick={async (e) => {
              e.stopPropagation();
              if (!Number.isFinite(petId)) return;

              if (!isAuthed) {
                onLoginRequired?.();
                return;
              }

              if (isLoading(petId)) return;

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

        <div className={styles.date}>{item.startDate}</div>

        <h3 className={styles.title}>{item.title}</h3>

        <div
          className={styles.categoryBadge}
          style={{
            backgroundColor: categoryStyle.bg,
            color: categoryStyle.text,
          }}
        >
          {formattedCategory}
        </div>
      </div>

      {/* 하단 보라색 버튼 (여기만 클릭 시 이동) */}
      <Link href={detailHref} className={styles.bottomLink}>
        <div className={styles.countArea}>
          <div className={styles.countIcon}>
            <Image src="/agree_purple.svg" alt="동의" width={24} height={24} />
          </div>
          <span className={styles.countText}>
            {formatNumber(item.allows)}명
          </span>
        </div>

        <div className={styles.arrowIcon}>
          <Image
            src="/right_arrow_white.svg"
            alt="이동"
            width={24}
            height={24}
          />
        </div>
      </Link>
    </article>
  );
}
