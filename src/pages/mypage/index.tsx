import type { NextPage } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/Mypage.module.css";

import ProfileCard from "@/components/ProfileCard";
import MyPetitionTable from "@/components/MyPetitionTable";

import { getMyScraps, deleteScraps, type ScrapItem } from "@/lib/scrapApi";
import { useAuthStore } from "@/store/authStore";

type Row = {
  id: string;
  title: string;
  ddayLabel: string;
  ddayTone: "gray" | "red";
  period: string;
  status: string;
};

const PAGE_SIZE = 10;

function formatDotDate(iso?: string) {
  if (!iso) return "-";
  return iso.slice(0, 10).replaceAll("-", ".");
}

function diffDays(toIso?: string) {
  if (!toIso) return null;

  const ymd = toIso.slice(0, 10);
  const [y, m, d] = ymd.split("-").map((v) => Number(v));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d))
    return null;

  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ms = target.getTime() - today.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function statusLabel(status?: number) {
  const map: Record<number, string> = { 0: "진행", 1: "심사", 2: "종료" };
  if (typeof status !== "number") return "-";
  return map[status] ?? String(status);
}

function toRow(it: ScrapItem): Row {
  const end = formatDotDate(it.voteEndDate);
  const period = `~${end}`;

  const d = diffDays(it.voteEndDate);
  const isClosed = d !== null ? d < 0 : true;

  const ddayLabel = isClosed ? "마감" : `D-${d}`;
  const ddayTone: "gray" | "red" = isClosed ? "gray" : "red";

  const status = it.result?.trim() ? it.result : statusLabel(it.status);

  return {
    id: String(it.petId),
    title: it.title ?? "제목 없음",
    ddayLabel,
    ddayTone,
    period,
    status,
  };
}

const MyPage: NextPage = () => {
  const router = require("next/router").useRouter?.() ?? null;

  const logout = useAuthStore((s) => s.logout);

  const [rows, setRows] = useState<Row[]>([]);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const currentPageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const currentPageIds = useMemo(
    () => currentPageRows.map((r) => r.id),
    [currentPageRows]
  );

  const isAllSelectedOnPage = useMemo(() => {
    if (currentPageIds.length === 0) return false;
    return currentPageIds.every((id) => selectedIds.includes(id));
  }, [currentPageIds, selectedIds]);

  const fetchRows = useCallback(async () => {
    try {
      const list = await getMyScraps();

      const uniq = Array.from(new Map(list.map((x) => [x.petId, x])).values());

      const nextRows = uniq.map(toRow);

      setRows(nextRows);
      setSelectedIds([]);

      const nextTotalPages = Math.max(
        1,
        Math.ceil(nextRows.length / PAGE_SIZE)
      );
      setCurrentPage((p) => Math.min(p, nextTotalPages));
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status;
      if (status === 401 || status === 402) {
        router?.replace?.("/login");
        return;
      }
      throw e;
    }
  }, [logout, router]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const selectAllOnPage = () => {
    setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
  };

  const unselectAllOnPage = () => {
    setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
  };

  const deleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;
    if (deleting) return;

    const ids = selectedIds
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));
    if (ids.length === 0) return;

    setDeleting(true);
    try {
      await deleteScraps(ids);
      await fetchRows();
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status;
      if (status === 401 || status === 402) {
        router?.replace?.("/login");
        return;
      }
      throw e;
    } finally {
      setDeleting(false);
    }
  }, [selectedIds, deleting, fetchRows, logout, router]);

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.profileSection}>
          <ProfileCard />
        </section>

        <section className={styles.actionsSection}>
          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={selectAllOnPage}
              disabled={
                currentPageIds.length === 0 || isAllSelectedOnPage || deleting
              }
            >
              전체 선택
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={unselectAllOnPage}
              disabled={currentPageIds.length === 0 || deleting}
            >
              선택 해제
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={deleteSelected}
              disabled={selectedIds.length === 0 || deleting}
            >
              선택 삭제
            </button>
          </div>
        </section>

        <section className={styles.tableSection}>
          <MyPetitionTable
            rows={currentPageRows}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
    </main>
  );
};

export default MyPage;
