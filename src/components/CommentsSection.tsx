import { useEffect, useMemo, useState } from "react";
import localApi from "@/lib/axios";

import { useLoginToast } from "@/hooks/useLoginToast";
import { useAuthStore } from "@/store/authStore";

import styles from "@/styles/CommentsSection.module.css";
import LoginToast from "@/components/LoginToast";

type CommentItem = {
  id: number;
  name: string;
  status?: number;
  body: string;
  check?: boolean;
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
      const statusRaw = it?.status;
      const status =
        typeof statusRaw === "number" || typeof statusRaw === "string"
          ? safeNumber(statusRaw, undefined as any)
          : undefined;

      if (!Number.isFinite(id) || !body) return null;
      return {
        id,
        name: name || "익명",
        status: Number.isFinite(status as any) ? (status as number) : undefined,
        body,
        check: !!it?.check,
      };
    })
    .filter(Boolean) as CommentItem[];
}

function getPageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "dots")[] = [1];

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("dots");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("dots");

  pages.push(total);
  return pages;
}

const profileSrc = (status?: number) => {
  switch (status) {
    case 0:
      return "/profile_reformer.svg";
    case 1:
      return "/profile_stabilizer.svg";
    case 2:
      return "/profile_pragmatist.svg";
    case 3:
      return "/profile_value_driven.svg";
    default:
      return "/profile.svg";
  }
};

export default function CommentsSection({ petitionId, isAuthed }: Props) {
  const user = useAuthStore((s) => s.user);

  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const count = useMemo(() => items.length, [items.length]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / PAGE_SIZE)),
    [items.length]
  );

  const visibleItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.id - a.id);
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const pages = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  const { toast, toastHide, showLoginToast } = useLoginToast();

  const clampPage = (next: number) => Math.min(totalPages, Math.max(1, next));

  const fetchComments = async () => {
    if (!petitionId) return;

    setLoading(true);
    try {
      const r = await localApi.get(`/api/petition/comment/${petitionId}`, {
        validateStatus: () => true,
      });

      if (r.status >= 200 && r.status < 300) {
        const next = normalizeComments(r.data);
        setItems(next);

        const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(Math.max(1, p), nextTotalPages));
      } else {
        setItems([]);
        setPage(1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchComments();
  }, [petitionId]);

  const onSubmit = async () => {
    const body = draft.trim();
    if (!body) return;

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
      setPage(1);
    } finally {
      setPosting(false);
    }
  };

  const onDelete = async (commentId: number) => {
    if (!isAuthed) {
      showLoginToast();
      return;
    }

    const prev = items;
    const nextItems = prev.filter((x) => x.id !== commentId);

    setItems(nextItems);
    setOpenMenuId(null);

    const nextTotalPages = Math.max(1, Math.ceil(nextItems.length / PAGE_SIZE));
    setPage((p) => Math.min(p, nextTotalPages));

    try {
      const r = await localApi.delete(`/api/petition/comment/${commentId}`, {
        validateStatus: () => true,
      });

      if (r.status === 401 || r.status === 402) {
        showLoginToast();
        setItems(prev);
        return;
      }

      if (r.status < 200 || r.status >= 300) {
        setItems(prev);
        return;
      }

      await fetchComments();
    } catch {
      setItems(prev);
    }
  };

  const myAvatarSrc = profileSrc((user as any)?.status);

  return (
    <>
      <LoginToast open={toast} hide={toastHide} />

      <section className={styles.wrap} onClick={() => setOpenMenuId(null)}>
        <h2 className={styles.title}>댓글 {count}개</h2>

        <div className={styles.inputRow}>
          <div className={styles.avatar}>
            <img src={myAvatarSrc} alt="profile" width={36} height={36} />
          </div>

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
              readOnly={!isAuthed}
              onClick={() => {
                if (!isAuthed) showLoginToast();
              }}
              onFocus={() => {
                if (!isAuthed) showLoginToast();
              }}
              onChange={(e) => {
                if (!isAuthed) {
                  showLoginToast();
                  return;
                }
                setDraft(e.target.value);
              }}
              onKeyDown={(e) => {
                if (!isAuthed) {
                  if (e.key === "Enter") showLoginToast();
                  return;
                }
                if (e.key === "Enter") onSubmit();
              }}
              disabled={posting}
            />
            <div className={styles.underline} />
          </div>
        </div>

        <div className={styles.list}>
          {visibleItems.map((c) => {
            const commentAvatar = profileSrc(c.status);
            return (
              <div key={c.id} className={styles.item}>
                <div className={styles.avatar}>
                  <img src={commentAvatar} alt="profile" width={36} height={36} />
                </div>

                <div className={styles.content}>
                  <div className={styles.name}>{c.name}</div>
                  <p className={styles.body}>{c.body}</p>
                </div>

                <div className={styles.menuWrap} onClick={(e) => e.stopPropagation()}>
                  {c.check ? (
                    <>
                      <button
                        type="button"
                        className={styles.kebab}
                        onClick={() => setOpenMenuId((p) => (p === c.id ? null : c.id))}
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
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.navBtn}
              disabled={page === 1}
              onClick={() => setPage((p) => clampPage(p - 1))}
            >
              ‹
            </button>

            {pages.map((p, idx) =>
              p === "dots" ? (
                <span key={`dots-${idx}`} className={styles.dots}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageBtn} ${page === p ? styles.active : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              className={styles.navBtn}
              disabled={page === totalPages}
              onClick={() => setPage((p) => clampPage(p + 1))}
            >
              ›
            </button>
          </div>
        )}
      </section>
    </>
  );
}
