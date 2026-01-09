import { useMemo, useState, useEffect } from "react";
import styles from "@/styles/Signup.module.css";
import { useRouter } from "next/router";
import api from "@/lib/axios";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [checking, setChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [checkedName, setCheckedName] = useState("");
  const [checkError, setCheckError] = useState("");

  useEffect(() => {
    const q = router.query.email;
    const emailFromQuery = typeof q === "string" ? q : "";

    if (emailFromQuery) {
      setEmail(emailFromQuery);
      return;
    }

    setEmail("");
    //setSubmitError("이메일 정보가 없습니다. 다시 로그인 해주세요.");
  }, [router.query.email]);

  const trimmed = useMemo(() => name.trim(), [name]);
  const trimmedEmail = useMemo(() => email.trim(), [email]);

  const canSubmit = useMemo(
    () => !!trimmed && !!trimmedEmail && !submitting,
    [trimmed, trimmedEmail, submitting]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (!touched) setTouched(true);

    setCheckedName("");
    if (isDuplicate) setIsDuplicate(false);
    if (submitError && email) setSubmitError("");
  };

  const checkDuplicate = async (nickname: string) => {
    const n = nickname.trim();
    if (!n) return false;

    try {
      setChecking(true);
      setCheckError("");

      const r = await api.get(`/api/user/check/${encodeURIComponent(n)}`, {
        validateStatus: () => true,
      });

      console.log("CHECK:", r.status, r.data);

      // 서버 에러면 무조건 막기
      if (r.status >= 400) {
        setIsDuplicate(true); // 빨간 글씨 띄우기
        setCheckedName("");
        setCheckError(""); // "사용할 수 없음"만 보여주기
        return true; // 다음 페이지 막기
      }
      // 2) 기본: status 기반
      let dup = r.status === 302 || r.status === 409;

      // body 기반(객체/boolean)
      const d: any = r.data;

      if (d === true) dup = true;
      if (d === false) dup = false;

      if (d && typeof d === "object") {
        if (d.duplicate === true) dup = true;
        if (d.isDuplicate === true) dup = true;
        if (d.available === false) dup = true;
        if (d.canUse === false) dup = true;
        if (d.available === true) dup = false;
        if (d.canUse === true) dup = false;
      }

      const text =
        typeof d === "string"
          ? d
          : typeof d?.message === "string"
          ? d.message
          : "";

      if (text) {
        const t = text.toLowerCase();
        // "duplicate", "exists", "already" 같은 단어가 있으면 중복으로 간주
        if (
          t.includes("duplicate") ||
          t.includes("exist") ||
          t.includes("already")
        )
          dup = true;
        // 한국어 메시지면 이것도 잡기
        if (
          text.includes("중복") ||
          text.includes("이미") ||
          text.includes("사용할 수 없")
        )
          dup = true;
      }

      // 중복이면 빨간 글씨 뜨게 상태 세팅
      setIsDuplicate(dup);
      setCheckedName(n);
      setCheckError("");

      return dup;
    } finally {
      setChecking(false);
    }
  };

  const onBlurName = async () => {
    setTouched(true);
    if (!trimmed) return;
    await checkDuplicate(trimmed);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!trimmed || !trimmedEmail) return;
    if (submitting) return;

    setSubmitError("");
    setCheckError("");
    setIsDuplicate(false);

    setSubmitting(true);

    try {
      // signUp을 미리 시도해서 중복/실패를 판정
      const r = await api.post(
        "/api/user/signUp",
        { email: trimmedEmail, name: trimmed, age: 0, status: 0 }, // status는 임시값(설문 후 patch할 거면 0으로)
        { validateStatus: () => true }
      );

      if (r.status === 200) {
        // 성공이면 설문으로 이동
        router.replace("/signup/complete");
        return;
      }

      // 실패(중복 포함)면 이동 막고 빨간 글씨
      setIsDuplicate(true); // "사용할 수 없는 닉네임" 문구 띄우기
      setSubmitError("회원가입에 실패했습니다. 닉네임을 다시 확인해 주세요.");
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>회원가입</h1>

      <section aria-label="회원가입 카드">
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.text}>이메일</div>
          <div className={styles.inputWrap}>
            <input
              className={styles.input}
              value={trimmedEmail}
              readOnly
              disabled
              aria-label="이메일 표시"
            />
          </div>

          <div className={styles.text}>닉네임</div>
          <div className={styles.inputWrap}>
            <input
              className={`${styles.input} ${
                isDuplicate ? styles.inputError : ""
              }`}
              value={name}
              onChange={onChange}
              onBlur={onBlurName}
              placeholder="닉네임을 입력하세요."
              aria-label="닉네임 입력"
              disabled={!trimmedEmail}
            />
            {isDuplicate && <span className={styles.errorIcon} aria-hidden />}
          </div>

          {isDuplicate && (
            <p className={styles.errorText}>사용할 수 없는 닉네임입니다.</p>
          )}

          {!isDuplicate && !!checkError && (
            <p className={styles.errorText}>{checkError}</p>
          )}
          {!isDuplicate && !checkError && !!submitError && (
            <p className={styles.errorText}>{submitError}</p>
          )}

          <button
            type="submit"
            className={`${styles.submitBtn} ${
              canSubmit ? styles.submitActive : styles.submitDisabled
            }`}
            disabled={!canSubmit}
          >
            회원가입 완료하기
          </button>

          {!trimmedEmail && (
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => router.replace("/login")}
            >
              로그인 페이지로 돌아가기
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
