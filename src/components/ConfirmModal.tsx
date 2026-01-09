import styles from "@/styles/ConfirmModal.module.css";

type Props = {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void; // 취소/밖 클릭
};

export default function ConfirmModal({
  isOpen,
  title = "회원탈퇴",
  message,
  confirmText = "예",
  cancelText = "아니요",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "처리중..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
