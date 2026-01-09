import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";

import ProsConsSection from "@/components/ProsConsSection";
import DetailHeroCard from "@/components/DetailHeroCard";
import Header from "@/components/Header";
import AISummaryCard from "@/components/AISummaryCard";
import DetailMiniCard from "@/components/DetailMiniCard";
import PetitionOverview from "@/components/PetitionOverview";
import SummaryNotice from "@/components/SummaryNotice";
import LikeDislikeBar from "@/components/LikeDislikeBar";
import RelatedPolicyCard from "@/components/RelatedPolicyCard";
import CommentsSection from "@/components/CommentsSection";

import styles from "@/styles/PetitionDetail.module.css";
import { useAuthStore } from "@/store/authStore";

import { useLoginToast } from "@/hooks/useLoginToast";
import LoginToast from "@/components/LoginToast";

import { useScrapStore } from "@/store/scrapStore";

type PetitionDetailResponse = {
  title?: string;
  subTitle?: string;
  category?: string;
  type?: number;
  status?: number;

  voteStartDate?: string;
  voteEndDate?: string;

  finalDate?: string;
  result?: string;
  department?: string;

  petitionNeeds?: string;
  petitionSummary?: string;
  content?: string;

  positiveEx?: string;
  negativeEx?: string;

  good?: number;
  bad?: number;
  allows?: number;

  url?: string;
  petitionUrl?: string;
};

type LawItem = {
  title: string;
  summary: string;
};

function formatDotDate(iso?: string) {
  if (!iso) return "-";
  return iso.slice(0, 10).replaceAll("-", ".");
}

function statusLabel(status?: number) {
  const map: Record<number, string> = { 0: "진행중", 1: "종료", 2: "처리완료" };
  if (typeof status !== "number") return "-";
  return map[status] ?? String(status);
}

function safeString(v: unknown, fallback = "-") {
  if (typeof v === "string" && v.trim()) return v;
  return fallback;
}

function safeNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function computePercent(allows?: number) {
  const n = safeNumber(allows, 0);
  const target = 50000;
  const p = Math.floor((n / target) * 100);
  return Math.max(0, Math.min(100, p));
}

function normalizeLaws(data: any): LawItem[] {
  const arr = Array.isArray(data) ? data : [];
  return arr
    .map((it: any) => {
      const title = safeString(it?.title, "");
      if (!title) return null;
      return { title, summary: safeString(it?.summary, "") };
    })
    .filter(Boolean) as LawItem[];
}

export default function PetitionDetailPage() {
  const router = useRouter();

  const { toast, toastHide, showLoginToast } = useLoginToast();

  const petitionId = useMemo(() => {
    const v = router.query.id;
    const n = typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [router.query.id]);

  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  const toggleScrap = useScrapStore((s) => s.toggleScrap);
  const syncScraps = useScrapStore((s) => s.sync);
  const syncing = useScrapStore((s) => s.syncing);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PetitionDetailResponse | null>(null);

  const [laws, setLaws] = useState<LawItem[]>([]);
  const [lawsError, setLawsError] = useState<string | null>(null);

  const [goodLocal, setGoodLocal] = useState(0);
  const [badLocal, setBadLocal] = useState(0);

  const isScrapped = useScrapStore((s) =>
    petitionId ? s.scraps.some((x) => x.petId === petitionId) : false
  );

  const thisLoading = useScrapStore((s) =>
    petitionId ? !!s.loadingById[petitionId] : false
  );

  useEffect(() => {
    if (!petitionId) return;
    syncScraps();
  }, [petitionId, isAuthed, syncScraps]);

  useEffect(() => {
    if (!petitionId) return;

    let alive = true;
    setLoading(true);
    setError(null);
    setLaws([]);
    setLawsError(null);

    Promise.all([
      axios.get(`/api/petition/${petitionId}`).then((r) => r.data as PetitionDetailResponse),
      axios.get(`/api/petition/laws/${petitionId}`).then((r) => r.data),
    ])
      .then(([detailData, lawsData]) => {
        if (!alive) return;
        setDetail(detailData);
        setLaws(normalizeLaws(lawsData));
        setGoodLocal(safeNumber(detailData.good, 0));
        setBadLocal(safeNumber(detailData.bad, 0));
      })
      .catch((e: any) => {
        if (!alive) return;
        const msg = e.response?.data?.message || e.message || "알 수 없는 오류";
        setError(msg);
        setDetail(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [petitionId]);

  const badge = useMemo(() => safeString(detail?.category, "-"), [detail?.category]);
  const title = useMemo(() => safeString(detail?.title, "제목 없음"), [detail?.title]);

  const agreeCount = useMemo(() => safeNumber(detail?.allows, 0), [detail?.allows]);
  const percent = useMemo(() => computePercent(detail?.allows), [detail?.allows]);

  const heroMeta = useMemo(() => {
    const period = `${formatDotDate(detail?.voteStartDate)} ~ ${formatDotDate(detail?.voteEndDate)}`;
    return [
      {
        iconSrc: "/proicons_calendar.svg",
        label: "동의기간",
        value: period,
        valueHighlight: true,
      },
      {
        iconSrc: "/Group (2).svg",
        label: "소관위원회",
        value: safeString(detail?.department, "-"),
      },
      {
        iconSrc: "/Group (1).svg",
        label: "상태",
        value: statusLabel(detail?.status),
      },
      { iconSrc: "/proicons_attach.svg", label: "청원분야", value: badge },
      {
        iconSrc: "/proicons_send.svg",
        label: "위원회회부일",
        value: detail?.voteStartDate ? formatDotDate(detail.finalDate) : "-",
      },
      {
        iconSrc: "/proicons_script.svg",
        label: "처리결과",
        value: safeString(detail?.result, "-"),
        valueHighlight: true,
      },
    ];
  }, [
    detail?.voteStartDate,
    detail?.voteEndDate,
    detail?.department,
    detail?.status,
    detail?.finalDate,
    detail?.result,
    badge,
  ]);

  const miniMeta = useMemo(() => {
    return [
      {
        iconSrc: "/proicons_calendar.svg",
        label: "마감날짜",
        value: formatDotDate(detail?.voteEndDate),
        valueHighlight: true,
      },
      {
        iconSrc: "/proicons_script.svg",
        label: "처리결과",
        value: safeString(detail?.result, "-"),
        valueHighlight: true,
      },
    ];
  }, [detail?.voteEndDate, detail?.result]);

  const aiText = useMemo(
    () => safeString(detail?.petitionSummary, "AI 요약 정보가 아직 없어요."),
    [detail?.petitionSummary]
  );

  const overviewTitle = useMemo(() => {
    const v = detail?.subTitle;
    return typeof v === "string" && v.trim() ? v : "";
  }, [detail?.subTitle]);

  const overviewText = useMemo(() => {
    const t = detail?.petitionNeeds || detail?.content || "";
    return safeString(t, "개요 정보가 아직 없어요.");
  }, [detail?.petitionNeeds, detail?.content]);

  const onClickGo = useCallback(() => {
    const raw = (detail?.url || detail?.petitionUrl || "").trim();

    if (!raw) {
      alert("바로가기 링크가 아직 등록되지 않았어요.");
      return;
    }

    const finalUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  }, [detail?.url, detail?.petitionUrl]);

  const prosItems = useMemo(() => {
    const s = safeString(detail?.positiveEx, "");
    return s ? [{ title: "긍정적 영향", desc: s }] : [];
  }, [detail?.positiveEx]);

  const consItems = useMemo(() => {
    const s = safeString(detail?.negativeEx, "");
    return s ? [{ title: "부정적 영향", desc: s }] : [];
  }, [detail?.negativeEx]);

  const showProsCons = prosItems.length > 0 || consItems.length > 0;

  if (!petitionId) {
    return (
      <main className={styles.page}>
        <Header />
        <LoginToast open={toast} hide={toastHide} />
        <div className={styles.container}>잘못된 id</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <Header />
        <LoginToast open={toast} hide={toastHide} />
        <div className={styles.container}>로딩중...</div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className={styles.page}>
        <Header />
        <LoginToast open={toast} hide={toastHide} />
        <div className={styles.container}>{error ?? "데이터 없음"}</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Header />
      <LoginToast open={toast} hide={toastHide} />
      <div className={styles.bgLayer} />

      <div className={styles.contentWrap}>
        <div className={styles.container}>
          <DetailHeroCard
            badge={badge}
            preTitle={overviewTitle}
            title={title}
            meta={heroMeta}
            agreeCount={agreeCount}
            percent={percent}
            statusPill="마감"
            bookmarked={isScrapped}
            bookmarkLoading={thisLoading || syncing}
            onToggleBookmark={async () => {
              if (!petitionId) return;
              if (!isAuthed) {
                showLoginToast();
                return;
              }
              if (thisLoading) return;
              await toggleScrap(petitionId);
            }}
            onClickGo={onClickGo}
          />

          <div className={styles.grid}>
            <div className={styles.leftCol}>
              <AISummaryCard text={aiText} />

              <PetitionOverview title="" text={overviewText} />

              <RelatedPolicyCard policies={laws} error={lawsError} />

              {showProsCons && <ProsConsSection pros={prosItems} cons={consItems} />}

              <SummaryNotice />

              <LikeDislikeBar
                petitionId={petitionId}
                good={goodLocal}
                bad={badLocal}
                isAuthed={isAuthed}
                onRequireLoginToast={showLoginToast}
                onChangeCounts={(g, b) => {
                  setGoodLocal(g);
                  setBadLocal(b);
                }}
              />

              <CommentsSection petitionId={petitionId} isAuthed={isAuthed} />
            </div>

            <aside className={styles.rightCol}>
              <div className={styles.miniSticky}>
                <DetailMiniCard
                  badge={badge}
                  title={title}
                  meta={miniMeta}
                  agreeCount={agreeCount}
                  percent={percent}
                  onClickGo={onClickGo}
                />
              </div>
            </aside>
          </div>

          <div className={styles.commentsPagerSpace} />
        </div>
      </div>
    </main>
  );
}
