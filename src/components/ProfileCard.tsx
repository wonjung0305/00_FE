import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/ProfileCard.module.css";
import api from "@/lib/axios";

import EditModal from "@/components/EditModal";
import { useAuthStore } from "@/store/authStore";

const statusLabel = (status?: number) => {
  switch (status) {
    case 0:
      return "변화추구형";
    case 1:
      return "안정중시형";
    case 2:
      return "실용중심형";
    case 3:
      return "가치지향형";
    default:
      return "유형 미정";
  }
};

const profileSrc = (status?: number) => {
  switch (status) {
    case 0:
      return "/profile_Reformer.svg";
    case 1:
      return "/profile_Stabilizer.svg";
    case 2:
      return "/profile_Pragmatist.svg";
    case 3:
      return "/profile_Value-driven.svg";
    default:
      return "/profile.svg";
  }
};

export default function ProfileCard() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const token = useAuthStore((s) => s.token);

  const updateUser = async (payload: {
    name?: string;
    age?: number;
    status?: number;
  }) => {
    const r = await api.patch("/api/user", payload, {
      validateStatus: () => true,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (r.status >= 200 && r.status < 400) {
      await useAuthStore.getState().fetchMe(); // store 갱신 (이미지/유형/닉네임 즉시 반영)
      return true;
    }

    console.error("회원 수정 실패:", r.status, r.data);
    return false;
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const nickname = user?.name ?? "사용자";
  const email = user?.email ?? "";

  // 프로필(사진, 성향) 저장은 위한 state
  const status = user?.status;
  const statusText = statusLabel(status);
  const avatarSrc = profileSrc(status);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuWrapRef.current) return;
      if (!menuWrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const onLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <section className={styles.card}>
        <div className={styles.avatar}>
          <Image
            src={avatarSrc}
            alt="프로필 이미지"
            fill
            className={styles.avatarImage}
            priority
          />
        </div>

        <div className={styles.content}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{nickname}</span>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="프로필 수정"
              onClick={() => setIsEditOpen(true)}
            />
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaText}>{statusText}</span>

            <Link href="/mypage/test" className={styles.retryLink}>
              유형 검사 다시하기
              <Image
                src="/sign_right_gray.svg"
                alt=""
                width={16}
                height={16}
                className={styles.chevIcon}
              />
            </Link>
          </div>

          <div className={styles.email}>{email}</div>
        </div>

        <div className={styles.actions} ref={menuWrapRef}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="더보기"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Image src="/option_btn.svg" alt="" width={20} height={20} />
          </button>

          {menuOpen && (
            <div className={styles.menu}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  setIsEditOpen(true);
                  setMenuOpen(false);
                }}
              >
                <Image src="/pencil.svg" alt="" width={16} height={16} />
                <span>수정하기</span>
              </button>

              <button
                type="button"
                className={styles.menuItem}
                onClick={onLogout}
              >
                <Image src="/logout.svg" alt="" width={16} height={16} />
                <span>로그아웃</span>
              </button>

              <div className={styles.divider} />

              <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                <Image src="/secession.svg" alt="" width={16} height={16} />
                <span>회원탈퇴</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <EditModal
        isOpen={isEditOpen}
        initialNickname={nickname}
        profileImageUrl={avatarSrc}
        onClose={() => setIsEditOpen(false)}
        onSave={async (nextNickname: string) => {
          const ok = await updateUser({
            name: nextNickname,
            age: user?.age ?? 0,
            status: user?.status ?? 0,
          });

          if (!ok) throw new Error("닉네임 수정 실패");
          setIsEditOpen(false);
        }}
      />
    </>
  );
}
