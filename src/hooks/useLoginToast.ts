import { useCallback, useRef, useState } from "react";

/* 로그인 필요 toast */
export function useLoginToast() {
  const [toast, setToast] = useState(false);
  const [toastHide, setToastHide] = useState(false);

  // 연타 대비 타이머 정리용
  const t1 = useRef<number | null>(null);
  const t2 = useRef<number | null>(null);

  const clearTimers = () => {
    if (t1.current) window.clearTimeout(t1.current);
    if (t2.current) window.clearTimeout(t2.current);
    t1.current = null;
    t2.current = null;
  };

  const showLoginToast = useCallback(() => {
    clearTimers();

    // 다시 처음부터 보이게
    setToast(true);
    setToastHide(false);

    // 3초 뒤부터 페이드아웃 시작
    t1.current = window.setTimeout(() => setToastHide(true), 3000);

    // 페이드아웃 애니메이션 끝난 뒤 DOM에서 제거
    t2.current = window.setTimeout(() => {
      setToast(false);
      setToastHide(false);
    }, 3400);
  }, []);

  return { toast, toastHide, showLoginToast };
}