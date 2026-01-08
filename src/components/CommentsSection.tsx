import { useEffect, useMemo, useState } from "react";
import localApi from "@/lib/axios"; // 로컬 API 전용 axios

import { useLoginToast } from "@/hooks/useLoginToast";

import styles from "@/styles/CommentsSection.module.css";
import LoginToast from "@/components/LoginToast";

type CommentItem = {
  id: number;
  name: string;
  body: string;
  check?: boolean; // 내가 작성한 댓글 여부 (삭제 버튼 노출)
};

type Props = {
  petitionId: number;
  isAuthed: boolean;
};

function safeString(v: unknown, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

function safeNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeComments(data: any): CommentItem[] {
  const arr = Array.isArray(data) ? data : [];
  return arr
    .map((it: any) => {
      const id = safeNumber(it?.id, NaN);
      const name = safeString(it?.name, "");
      const body = safeString(it?.body, "");
      if (!Number.isFinite(id) || !body) return null;
      return { id, name: name || "익명", body, check: !!it?.check };
    })
    .filter(Boolean) as CommentItem[];
}

export default function CommentsSection({ petitionId, isAuthed }: Props) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const count = useMemo(() => items.length, [items.length]);

  const { toast, toastHide, showLoginToast } = useLoginToast();

  // 댓글 목록 불러오기
  const fetchComments = async () => {
    if (!petitionId) return;

    setLoading(true);
    try {
      const r = await localApi.get(`/api/petition/comment/${petitionId}`, {
        validateStatus: () => true,
      });

      if (r.status >= 200 && r.status < 300) {
        setItems(normalizeComments(r.data));
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petitionId]);

  // 댓글 작성
  const onSubmit = async () => {
    const body = draft.trim();
    if (!body) return;

    // 비로그인 -> toast
    if (!isAuthed) {
      showLoginToast();
      return;
    }

    if (posting) return;

    setPosting(true);
    setDraft("");

    try {
      const r = await localApi.post(
        `/api/petition/comment`,
        { id: petitionId, body },
        { validateStatus: () => true }
      );

      // 서버가 로그인 필요라고 주면 toast + 원복
      if (r.status === 401 || r.status === 402) {
        showLoginToast();
        setDraft(body);
        return;
      }

      if (r.status < 200 || r.status >= 300) {
        setDraft(body);
        return;
      }

      await fetchComments();
    } finally {
      setPosting(false);
    }
  };

  // 댓글 삭제
  const onDelete = async (commentId: number) => {
    //비로그인 -> toast
    if (!isAuthed) {
      showLoginToast();
      return;
    }

    const prev = items;
    setItems((p) => p.filter((x) => x.id !== commentId));
    setOpenMenuId(null);

    try {
      const r = await localApi.delete(`/api/petition/comment/${commentId}`, {
        validateStatus: () => true,
      });

      if (r.status === 401 || r.status === 402) {
        showLoginToast();
        setItems(prev);
        return;
      }

      // 실패면 롤백
      if (r.status < 200 || r.status >= 300) {
        setItems(prev);
        return;
      }

      // 서버 상태와 다시 동기화
      await fetchComments();
    } catch {
      setItems(prev);
    }
  };

  return (
    <>
      <LoginToast open={toast} hide={toastHide} />

      <section className={styles.wrap} onClick={() => setOpenMenuId(null)}>
        <h2 className={styles.title}>댓글 {count}개</h2>

        <div className={styles.inputRow}>
          <div className={styles.avatar} />
          <div className={styles.inputCol}>
            <input
              className={styles.input}
              placeholder={
                loading
                  ? "불러오는 중..."
                  : !isAuthed
                  ? "로그인 후 댓글을 작성할 수 있어요"
                  : "댓글을 입력하세요"
              }
              value={draft}
              onFocus={() => {
                if (!isAuthed) showLoginToast();
              }}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
              disabled={posting || !isAuthed}
              onMouseDown={(e) => {
                if (!isAuthed) {
                  e.preventDefault(); // 포커스/커서 안 들어가게
                  showLoginToast();
                }
              }}
            />
            <div className={styles.underline} />
          </div>
        </div>

        <div className={styles.list}>
          {items.map((c) => (
            <div key={c.id} className={styles.item}>
              <div className={styles.avatar} />

              <div className={styles.content}>
                <div className={styles.name}>{c.name}</div>
                <p className={styles.body}>{c.body}</p>
              </div>

              <div
                className={styles.menuWrap}
                onClick={(e) => e.stopPropagation()}
              >
                {c.check ? (
                  <>
                    <button
                      type="button"
                      className={styles.kebab}
                      onClick={() =>
                        setOpenMenuId((p) => (p === c.id ? null : c.id))
                      }
                      aria-label="댓글 메뉴"
                    >
                      ⋮
                    </button>

                    {openMenuId === c.id && (
                      <div className={styles.menu}>
                        <button
                          type="button"
                          className={styles.menuItem}
                          onClick={() => onDelete(c.id)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.kebabPlaceholder} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
