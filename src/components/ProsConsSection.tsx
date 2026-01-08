import { useMemo } from "react";
import ProsCard from "@/components/ProsCard";
import ConsCard from "@/components/ConsCard";
import styles from "@/styles/ProsConsSection.module.css";

type InItem = {
  title: string;
  desc: string;
};

type OutItem = {
  title: string;
  desc: React.ReactNode;
};

type Props = {
  pros: InItem[];
  cons: InItem[];
  prosTags?: string[];
  consTags?: string[];
};

function parseBySlash(raw?: string): OutItem[] {
  if (!raw) return [];

  // 줄바꿈/공백 정리
  const s = raw.replace(/\r?\n/g, " ").trim();
  if (!s) return [];

  // 핵심 아이디어:
  // "...제목/본문...제목/본문..." 구조에서
  // '/' 기준으로 앞은 제목, 뒤는 본문(다음 제목 직전까지)
  const parts = s.split("/");

  // parts 예시:
  // [ "내 돈 구제", "피해자가...있습니다.,사기 예방", "강력한...있습니다.,신뢰 회복", "사회 전반...것입니다." ]
  // => i=0 제목, i=1 본문+다음제목 섞임 -> 여기서 "...,다음제목" 분리 필요

  const out: OutItem[] = [];

  let currentTitle = parts[0]?.trim().replace(/^,/, "").trim();
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];

    // chunk 안에는 "본문...,다음제목" 형태로 다음 제목이 붙어있을 수 있음
    // 다음 제목 후보는 마지막 콤마 뒤쪽(그리고 공백 제거)
    // ✅ 다음 제목이 실제로 존재하면: 뒤쪽이 짧고(제목) 앞쪽은 길다(본문) 패턴이 많음
    // 더 안전하게: ",<한글/영문/숫자/공백>"로 끝나는 경우만 제목으로 간주
    const m = chunk.match(/([\s\S]*?)(?:,)\s*([가-힣A-Za-z0-9\s]+)\s*$/);

    if (m) {
      const body = (m[1] || "").trim();
      const nextTitle = (m[2] || "").trim();

      if (currentTitle && body) {
        out.push({ title: currentTitle, desc: body });
      }

      currentTitle = nextTitle;
    } else {
      // 마지막 블록(뒤에 제목이 안 붙는 경우)
      const body = chunk.trim();
      if (currentTitle && body) {
        out.push({ title: currentTitle, desc: body });
      }
    }
  }

  // 혹시 title이 비어있는 이상 케이스 제거
  return out.filter((it) => it.title && String(it.desc).trim());
}

export default function ProsConsSection({ pros, cons, prosTags = [], consTags = [] }: Props) {
  const parsedPros: OutItem[] = useMemo(() => {
    const items: OutItem[] = [];
    (pros || []).forEach((it) => items.push(...parseBySlash(it.desc)));
    return items;
  }, [pros]);

  const parsedCons: OutItem[] = useMemo(() => {
    const items: OutItem[] = [];
    (cons || []).forEach((it) => items.push(...parseBySlash(it.desc)));
    return items;
  }, [cons]);

  return (
    <section className={styles.wrap}>
      <div className={styles.grid}>
        <ProsCard items={parsedPros} tags={prosTags} />
        <ConsCard items={parsedCons} tags={consTags} />
      </div>
    </section>
  );
}
