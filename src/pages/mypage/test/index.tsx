import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

import Header from "@/components/Header";
import styles from "@/styles/MypageTest.module.css";

/* 유형 */
type ChoiceType = "A" | "B" | "C" | "D";

type Option = {
  text: string;
  type: ChoiceType; // A/B/C/D 매핑
};

type Question = {
  id: number;
  title: string;
  options: Option[];
  highlight?: string[];
};

// !!!!!!!!!!!!!!!!!!! 내용 추가하기  !!!!!!!!!!!!!!!!!!!
const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "새로운 정책이 제안되었을 때, 가장 먼저 드는 생각은?",
    highlight: ["새로운 정책", "생각은"],
    options: [
      { text: "현재의 문제 구조를 바꿀 수 있는 정책인가?", type: "A" },
      { text: "기존 제도와 충돌되지 않는 정책인가?", type: "B" },
      { text: "실제로 효과가 있는가?", type: "C" },
      {
        text: "사회적으로 올바른 방향인가?",
        type: "D",
      },
    ],
  },
  {
    id: 2,
    title: "정부가 새로운 청년 정책을 발표할 때, 당신의 반응은?",
    highlight: ["새로운 청년 정책", "반응은"],
    options: [
      { text: "기존의 제도를 유지하면서 개선할 수 있는가?", type: "B" },
      { text: "근본적인 문제를 해결하는 정책인가?", type: "A" },
      {
        text: "공정성과 형평성을 지키는 정책인가?",
        type: "D",
      },
      { text: "청년에게 실질적인 도움이 되는 정책인가?.", type: "C" },
    ],
  },
  {
    id: 3,
    title: "사회 문제 해결 방식으로 가장 중요하다고 생각하는 것은?",
    highlight: ["사회 문제 해결 방식", "가장 중요"],
    options: [
      { text: "빠르고 실효성 있는 해결", type: "C" },
      { text: "사회적 안정 속에서의 점진적 개선", type: "B" },
      {
        text: "사회적 의미와 가치의 반영",
        type: "D",
      },
      { text: "제도와 구조 자체의 변화", type: "A" },
    ],
  },
  {
    id: 4,
    title: "정책 논쟁을 볼 때 더 공감되는 말은?",
    highlight: ["정책 논쟁", "공감"],
    options: [
      { text: "말보다 결과가 중요하다.", type: "C" },
      { text: "이 구조 자체를 바꿔야 한다", type: "A" },
      {
        text: "누구에게 도움을 줄 수 있는지가 중요하다.",
        type: "D",
      },
      { text: "급격한 변화는 오히려 혼란을 낳는다.", type: "B" },
    ],
  },
  {
    id: 5,
    title: "정책이 실패한다고 느낄 때, 가장 큰 이유는?",
    highlight: ["정책이 실패", "이유"],
    options: [
      { text: "현실을 고려하지 않고 이상만 앞세우기 때문이다.", type: "B" },
      { text: "근본적인 구조 개선이 없기 때문이다.", type: "A" },
      {
        text: "사회적 약자의 의견을 반영하지 않았기 때문이다.",
        type: "D",
      },
      { text: "실효성 없는 보여주기식 정책이기 때문이다.", type: "C" },
    ],
  },
  {
    id: 6,
    title: "새로운 제도를 도입할 때 가장 우선해야 할 기준은?",
    highlight: ["새로운 제도", "기준"],
    options: [
      {
        text: "가치와 원칙에 부합하는가?",
        type: "D",
      },
      { text: "사회 구조를 더 나은 방향으로 바꾸는가?", type: "A" },
      { text: "실제로 효과를 낼 수 있는가?", type: "C" },
      { text: "사회의 안정성을 해치지 않는가?", type: "B" },
    ],
  },
  {
    id: 7,
    title: "정책 논쟁을 지켜볼 때 나의 태도는?",
    highlight: ["정책 논쟁", "나의 태도"],
    options: [
      { text: "현실적으로 가능한 대안인가?", type: "C" },
      { text: "지금 방식도 나름의 이유가 있지 않은가?", type: "B" },
      {
        text: "옳은 방향으로 가는가?",
        type: "D",
      },
      { text: "이건 바뀌어야 할 문제다.", type: "A" },
    ],
  },
  {
    id: 8,
    title: "당신이 생각하는 ‘좋은 정책’이란?",
    highlight: ["‘좋은 정책’"],
    options: [
      { text: "사회 구조를 한 단계 진전시키는 정책", type: "A" },
      { text: "사회 질서를 안정적으로 유지하는 정책", type: "B" },
      { text: "일상의 불편을 실제로 줄여주는 정책", type: "C" },
      {
        text: "사회적 가치를 지켜내는 정책",
        type: "D",
      },
    ],
  },
  {
    id: 9,
    title:
      "실효성 논란이 있는 정책을 보았을 때의 당신의 반응은?",
    highlight: ["실효성", "반응",],
    options: [
      { text: "구조를 다시 설계할 필요가 있다.", type: "A" },
      {
        text: "이 정책이 어떤 가치를 담는지가 중요하다.",
        type: "D",
      },
      { text: "결과를 보고 판단하겠다.", type: "C" },
      { text: "기존 제도를 보완하는 것이 낫다.", type: "B" },
    ],
  },
];

// 제출 시 동점이면 랜덤(제출 순간에만 1번 동작)
function pickResultTypeRandom(counts: Record<ChoiceType, number>): ChoiceType {
  const maxCount = Math.max(counts.A, counts.B, counts.C, counts.D);
  const candidates = (Object.keys(counts) as ChoiceType[]).filter(
    (t) => counts[t] === maxCount
  );

  // 후보가 1개면 그대로
  if (candidates.length === 1) return candidates[0];

  // 랜덤
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

// highlight 하는 함수
function renderWithHighlight(text: string, highlight?: string[]) {
  if (!highlight || highlight.length === 0) return text;

  let parts: ReactNode[] = [text];

  for (const word of highlight) {
    parts = parts.flatMap((p) => {
      if (typeof p !== "string") return [p];

      return p.split(word).flatMap((chunk, i, arr) => {
        const nodes: ReactNode[] = [chunk];
        if (i < arr.length - 1) {
          nodes.push(
            <span key={`${word}-${i}`} className={styles.highlight}>
              {word}
            </span>
          );
        }
        return nodes;
      });
    });
  }

  return parts;
}

const TestPage: NextPage = () => {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  // questionId -> optionIndex(0~3)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // 전부 답했는지
  const isAllAnswered = useMemo(
    () => QUESTIONS.every((q) => answers[q.id] !== undefined),
    [answers]
  );

  // A/B/C/D 카운트
  const counts = useMemo(() => {
    const base: Record<ChoiceType, number> = { A: 0, B: 0, C: 0, D: 0 };

    for (const q of QUESTIONS) {
      const pickedIdx = answers[q.id];
      if (pickedIdx === undefined) continue;

      const t = q.options[pickedIdx]?.type;
      if (!t) continue;

      base[t] += 1;
    }
    return base;
  }, [answers]);

  // 보기 선택
  const onPick = (questionId: number, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  // 제출 -> 서버 전송 -> 메인 이동
  const onSubmit = () => {
    if (!isAllAnswered || submitting) return;

    setSubmitting(true);

    const resultType = pickResultTypeRandom(counts);

    router.push({
      pathname: "/mypage/test/result",
      query: { type: resultType },
    });
  };

  return (
    <div className={styles.testPage}>
      <Header />

      {/* 헤더 아래 영역: 스크롤 + 가운데 */}
      <main className={styles.testMain}>
        {/* 상단 타이틀 */}
        <section className={styles.testIntro}>
          <b className={styles.testTitle}>모라 유형 검사</b>
          <div className={styles.testSubtitle}>
            정책을 바라보는 나의 관점은?
          </div>
        </section>

        {/* 질문 리스트 */}
        <section className={styles.questionList}>
          <article className={styles.questionCard}>
            {QUESTIONS.map((q, index) => {
              const picked = answers[q.id];

              return (
                <div key={q.id} className={styles.questionBlock}>
                  {/* 질문 헤더 */}
                  <div className={styles.questionHeader}>
                    <b className={styles.questionIndex}>Q{q.id}.</b>
                    <div className={styles.questionText}>
                      {renderWithHighlight(q.title, q.highlight)}
                    </div>
                  </div>

                  {/* 보기 목록 */}
                  <div className={styles.optionList}>
                    {q.options.map((opt, idx) => {
                      const active = picked === idx;

                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`${styles.optionItem} ${
                            active ? styles.optionItemActive : ""
                          }`}
                          onClick={() => onPick(q.id, idx)}
                        >
                          <span className={styles.optionText}>{opt.text}</span>

                          <span className={styles.optionIcon}>
                            <Image
                              src={active ? "/radio_on.svg" : "/radio_off.svg"}
                              alt=""
                              width={17.5}
                              height={17.5}
                              className={styles.radioImg}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 마지막 질문이 아니면 구분 여백 */}
                  {index !== QUESTIONS.length - 1 && (
                    <div className={styles.questionDivider} />
                  )}
                </div>
              );
            })}
          </article>

          {/* 결과보기 버튼*/}
          <button
            type="button"
            className={styles.submitButton}
            disabled={!isAllAnswered || submitting}
            onClick={onSubmit}
          >
            {submitting ? "제출 중..." : "결과보기!"}
          </button>
        </section>
      </main>
    </div>
  );
};

export default TestPage;
