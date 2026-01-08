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
    () =>
      !!trimmed &&
      !!trimmedEmail &&
      !isDuplicate &&
      !submitting &&
      !checking &&
      !submitError,
    [trimmed, trimmedEmail, isDuplicate, submitting, checking, submitError]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (!touched) setTouched(true);
    if (submitError && email) setSubmitError("");
  };

  const checkDuplicate = async (nickname: string) => {
    if (!nickname) return;

    try {
      setChecking(true);

      const r = await api.get(
        `/api/user/check/${encodeURIComponent(nickname)}`,
        {
          validateStatus: () => true,
        }
      );

      if (r.status === 302) setIsDuplicate(true);
      else if (r.status === 200) setIsDuplicate(false);
      else setIsDuplicate(false);
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
    if (!canSubmit) return;

    sessionStorage.setItem(
      "pendingOnboarding",
      JSON.stringify({
        email: trimmedEmail,
        nickname: trimmed,
      })
    );

    router.replace("/signup/complete");
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
          {!isDuplicate && !!submitError && (
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
