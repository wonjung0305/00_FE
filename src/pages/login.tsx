import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import styles from "@/styles/Login.module.css";

export default function LoginPage() {
  const checkLoginFromUrl = useAuthStore((s) => s.checkLoginFromUrl);

  useEffect(() => {
    checkLoginFromUrl();
  }, [checkLoginFromUrl]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.head}>
            <h1 className={styles.title}>
              관심은 있는데,
              <br />
              <span className={styles.line2}>
                <span className={styles.highlight}>어디서 시작</span>할지
                모르겠다면
              </span>
            </h1>
          </div>

          <div className={styles.googleGroup}>
            <p className={styles.desc}>
              Google 계정으로 로그인 후
              <br />
              어떤 정책이 있는지 둘러볼까요?
            </p>

            <button
              className={styles.googleBtn}
              type="button"
              onClick={() => {
  const base = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  alert(`BASE=${base}`);

  const origin = "https://moragora.site";
  const url = `${base}/oauth2/authorization/google?origin=${encodeURIComponent(origin)}`;
  alert(`LOGIN URL=${url}`);

  // window.location.href = url;  // ✅ 확인 끝나면 이 줄 다시 켜
}}
            >
              <span className={styles.googleIcon} aria-hidden />
              Google 계정으로 로그인
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
