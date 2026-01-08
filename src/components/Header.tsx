import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "@/styles/Header.module.css";
import { useAuthStore } from "@/store/authStore";

// token으로 저장된 내용에 따라서 프로필 들고오기
const getProfileSrc = (status?: number) => {
  switch (status) {
    case 0:
      return "/profile_Reformer.svg"; // 변화추구형
    case 1:
      return "/profile_Stabilizer.svg"; // 안전중시형
    case 2:
      return "/profile_Pragmatist.svg"; // 실용중심형
    case 3:
      return "/profile_Value-driven.svg"; // 가치지향형
    default:
      return "/profile.svg";
  }
};

export default function Header() {
  const pathname = usePathname();

  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* 왼쪽: 로고 */}
        <div className={styles.left}>
          <Link href="/" aria-label="로고 및 홈으로 이동">
            <Image
              src="/logo.svg"
              alt="mora logo"
              width={137}
              height={37}
              priority
              className={styles.logoImage}
            />
          </Link>
        </div>

        {/* 가운데: 네비게이션 */}
        <nav className={styles.nav} aria-label="내비게이션바">
          <Link
            href="/congress"
            className={`${styles.navItem} ${
              pathname === "/congress" ? styles.active : ""
            }`}
          >
            국회안건
          </Link>
          <Link
            href="/life"
            className={`${styles.navItem} ${
              pathname === "/life" ? styles.active : ""
            }`}
          >
            생활안건
          </Link>
          <Link
            href="/more"
            className={`${styles.navItem} ${
              pathname === "/more" ? styles.active : ""
            }`}
          >
            몰아보기
          </Link>
        </nav>

        {/* 오른쪽 */}
        <div className={styles.rights}>
          {loading ? null : user ? (
            /* 기존 로그아웃 버튼 자리 → 마이페이지 아이콘 */
            <Link href="/mypage" className={styles.profileBtn}>
              <Image
                src={getProfileSrc(user?.status)}
                alt="마이페이지"
                width={40}
                height={40}
              />
            </Link>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
