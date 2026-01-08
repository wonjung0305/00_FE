import styles from "@/styles/LoginToast.module.css";

type Props = {
  open: boolean;
  hide: boolean;
};

export default function LoginToast({ open, hide }: Props) {
  if (!open) return null;

  return (
    <div className={`${styles.toast} ${hide ? styles.toastHide : ""}`}>
      <img src="/error_white.svg" alt="error" className={styles.toastIcon} />
      <span>로그인 후 이용할 수 있는 기능이에요!</span>
    </div>
  );
}