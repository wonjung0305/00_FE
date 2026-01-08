import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

import Header from "@/components/Header";
import styles from "@/styles/TestResult.module.css";

type ChoiceType = "A" | "B" | "C" | "D";

/* 정적 데이터로 구성 */
const RESULT_MAP: Record<
  ChoiceType,
  {
    titleStrong: string; // 제목에 강조
    badge: string; // 새로운 판을 설계하는 혁신가
    desc: React.ReactNode; // 굵게 처리 포함
    card1Title: string;
    card1Body: string;
    card2Title: string;
    card2Body: string;
    imageSrc?: string; // 이미지
  }
> = {
  A: {
    titleStrong: "변화추구형",
    badge: "새로운 판을 설계하는 혁신가",
    desc: (
      <>
        당신은 눈앞의 문제를 해결하는 데 그치지 않고, 그 문제가 발생한{" "}
        <b>'근본 원인'</b>을 찾아내려 노력합니다.
        <br />
        임시방편적인 정책보다는 우리 사회의 <b>구조적인 모순을 해결</b>할 수
        있는 과감한 개혁에 매력을 느낍니다.
        <br />
        때로는 급진적이라는 평가를 받기도 하지만, 사회를 한 단계 진전시키는 것은
        결국 당신 같은 이들의 통찰력과 용기입니다.
      </>
    ),
    card1Title: "정책을 보는 관점",
    card1Body: `"이 정책이 미래의 표준이 될 수 있는가?"를 가장 먼저 고민합니다. 관행이나 관습보다는 '효율적인 미래'를 위해 판을 새로 짜는 제안에 열광하며, 변화를 두려워하지 않는 태도를 지녔습니다.`,
    card2Title: "이런 점이 돋보여요!",
    card2Body:
      "거시적인 안목과 통찰력, 사회적 문제를 비판적으로 바라보고 대안을 제시하는 기획력이 뛰어납니다.",
    imageSrc: "/result_A.svg",
  },
  B: {
    titleStrong: "안정중시형",
    badge: "신뢰와 질서를 지키는 파수꾼",
    desc: (
      <>
        당신은 변화의 필요성에는 공감하지만, 그 과정이{" "}
        <b>안정적이고 예측 가능</b>해야한다고 믿습니다.
        <br />
        아무리 좋은 취지의 정책이라도 준비 없이 시행되어 혼란을야기하는 것을
        경계합니다.
        <br />
        기존 제도가 가진 장점을 존중하며, 이를 토대로 하나씩 벽돌을 쌓아 올리듯{" "}
        <b>점진적으로 발전</b>해 나가는 방식을 선호합니다.
      </>
    ),
    card1Title: "정책을 보는 관점",
    card1Body: `"이 정책이 장기적으로 지속 가능한가?"를 중요하게 생각합니다. 예산의 현실성, 행정적인 실행 가능성, 그리고 사회 구성원들이 느낄 혼란을 최소화하는 세심한 설계에 높은 점수를 줍니다.`,
    card2Title: "이런 점이 돋보여요!",
    card2Body:
      "높은 책임감과 신중함, 리스크를 미리 예측하고 관리하는 꼼꼼한 분석 능력이 탁월합니다.",
    imageSrc: "/result_B.svg",
  },
  C: {
    titleStrong: "실용중심형",
    badge: "현실적인 대안을 제시하는 해결사",
    desc: (
      <>
        당신에게 가장 중요한것은 <b>'실제로 효과가 있는가?'</b>입니다.
        <br />
        거창한 담론이나 이념적인 논쟁보다는, 당장 내 지갑과 내 일상에 어떤변화를
        주는지를 예리하게 파악합니다.
        <br />
        복잡한 절차나 보여주기식 행정보다는
        <b>간결하고 명확한 혜택</b>을 선호하며, 이론보다는 <b>데이터와 결과</b>
        를 바탕으로정책을 평가합니다.
      </>
    ),
    card1Title: "정책을 보는 관점",
    card1Body: `"그래서 내 삶이 어떻게 나아지는가?"라는 질문에 명쾌한 답을 주는 정책을 지지합니다. 가성비가 좋고, 신청이 편리하며, 체감 효과가 즉각적인 실무 중심의 해결책을 선호하는 경향이 있습니다.`,
    card2Title: "이런 점이 돋보여요!",
    card2Body: `빠른 상황 판단력과 효율성을 극대화하는 실행력, 현장의 목소리를 정책에 반영하는 실천적 감각이 좋습니다.`,
    imageSrc: "/result_C.svg",
  },
  D: {
    titleStrong: "가치지향형!",
    badge: "공존의 가치를 빚어내는 중재자",
    desc: (
      <>
        당신은 정책이 단순한 효율성을 넘어 <b>'사회적 정의와 공정'</b>이라는
        가치를 담아야 한다고 믿습니다.
        <br />
        성장의 그늘에 <b>가려진 소외계층이나 사각지대</b>를 살피는 일에 깊은
        관심을 두며, 우리 사회가 지켜야할 올바른 방향성에 대해 끊임없이
        고민합니다.
        <br />
        결과만큼이나 <b>과정의 정당성</b>을 중요하게 생각하는 원칙주의자이기도
        합니다.
      </>
    ),
    card1Title: "정책을 보는 관점",
    card1Body: `"이 정책이 누구를 배려하고 있는가?"를 핵심으로 봅니다. 약자를 보호하고 평등한 기회를 보장하는 내용에 깊이 공감하며, 다소 시간이 걸리더라도 사회적 합의와 도덕적 가치를 지켜내는 정책을 높게 평가합니다.`,
    card2Title: "이런 점이 돋보여요!",
    card2Body: `높은 공감 능력과 인권 감수성, 눈앞의 이익보다 공동체의 선을 우선시하는 단단한 신념을 갖추고 있습니다.`,
    imageSrc: "/result_D.svg",
  },
};

const TYPE_TO_STATUS: Record<ChoiceType, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

const TestResultPage: NextPage = () => {
  const router = useRouter();

  // URL 쿼리에서 type 뽑기
  const type = useMemo(() => {
    const t = router.query.type;
    if (t === "A" || t === "B" || t === "C" || t === "D") return t;
    return null; // undefined null 처리(직접 접근 방지)
  }, [router.query.type]);

  // type이 유효하면 RESULT_MAP에서 데이터 가져오기
  // type이 null이면 data도 null (결과 없음)
  const data = type ? RESULT_MAP[type] : null;

  // 검사 다시하기, 메인 화면으로 이동
  const goRetry = () => router.push("/mypage/test");

  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.user);

  // 메인으로: 서버에 결과+닉네임 보내고 JWT 받아서 저장한 뒤 이동
  const goMain = async () => {
    // type 정규화
    const t = router.query.type;
    const type: ChoiceType | null =
      t === "A" || t === "B" || t === "C" || t === "D" ? t : null;

    if (!type) {
      router.replace("/mypage/test");
      return;
    }

    // 서버로 보내고 JWT 받기
    const status = TYPE_TO_STATUS[type]; // A->0, B->1, C->2, D->3

    const payload = {
      name: me?.name ?? "",
      age: me?.age ?? 0,
      status,
      email: me?.email ?? "",
    };

    // 토큰 없으면 업데이트 막기
    if (isAuthed && !token) {
      router.replace("/login");
      return;
    }

    if (isAuthed) {
      const r = await api.patch("/api/user", payload, {
        validateStatus: () => true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (r.status >= 200 && r.status < 400) {
        // store 갱신 -> 헤더/프로필 카드 이미지 즉시 바뀜
        await useAuthStore.getState().fetchMe();

        router.replace("/mypage");
        return;
      }

      console.error("status 업데이트 실패:", r.status, r.data);
      return;
    }

    // endingOnboarding 읽기 (signup에서 저장해둔 email/nickname)
    const raw = sessionStorage.getItem("pendingOnboarding");
    const pending = raw ? JSON.parse(raw) : null;

    const email = pending?.email ?? "";
    const nickname = pending?.nickname ?? "";

    // 값 없으면 흐름 깨진 거라 로그인으로
    if (!email || !nickname || !type) {
      router.replace("/login");
      return;
    }

    try {
      const r = await api.post(
        "/api/user/signUp",
        { email, name: nickname, age: 0, status },
        { validateStatus: () => true }
      );

      // 성공하면 로그인으로
      if (r.status >= 200 && r.status < 400) {
        sessionStorage.removeItem("pendingOnboarding");
        router.replace("/login");
        return;
      }

      console.error("회원가입 실패:", r.status, r.data);
    } catch (e) {
      console.error("회원가입 요청 에러:", e);
    }
  };

  if (!data) {
    // 쿼리 없이 직접 들어온 경우
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <p className={styles.empty}>
            결과 정보가 없어요. 검사를 먼저 진행해주세요.
          </p>
          <button className={styles.primaryBtn} onClick={goRetry}>
            검사하러 가기
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.resultTop}>
          {/* 이미지*/}
          <div className={styles.imageBox} />
          {/* !!!!!!!!!!!!!!!!!!!!!!! 나중에 이미지 쓰려면:
              <Image src={data.imageSrc!} ... />
              !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

              <Image src={data.imageSrc!} alt="" width={228} height={228} />
          */}

          {/* 제목 */}
          <h1 className={styles.resultTitle}>
            당신은 <span className={styles.strong}>{data.titleStrong}</span>!
          </h1>

          {/* 타이틀 아래 뱃지 */}
          <div className={styles.badge}>{data.badge}</div>
        </section>

        {/* 설명 영역*/}
        <section className={styles.desc}>{data.desc}</section>

        {/* 카드 묶음 - 정책을 보는 관점 / 이런 점이 돋보여요!*/}
        <section className={styles.cardGroup}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>{data.card1Title}</div>
            <div className={styles.cardBody}>{data.card1Body}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>{data.card2Title}</div>
            <div className={styles.cardBody}>{data.card2Body}</div>
          </div>
        </section>

        {/* 하단 버튼 영역 */}
        <section className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={goRetry}>
            검사 다시하기
          </button>
          <button className={styles.primaryBtn} onClick={goMain}>
            {isAuthed ? "저장하고 돌아가기" : "로그인하러 가기"}
          </button>
        </section>
      </main>
    </div>
  );
};

export default TestResultPage;
