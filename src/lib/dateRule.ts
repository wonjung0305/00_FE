// 공개 후 30일 이내 규칙 적용

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// 파싱해서 날짜로만 변경
export function toDateOnly(isoOrYmd?: string) {
  if (!isoOrYmd) return null;

  const ymd = isoOrYmd.slice(0, 10); // YYYY-MM-DD
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;

  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function formatDot(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function todayStart() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

// 종료일
export function endDateByRule(voteStartDateIso?: string) {
  const start = toDateOnly(voteStartDateIso);
  if (!start) return null;
  return addDays(start, 30);
}

// dday 계산
export function ddayByEndDate(end: Date) {
  const t = todayStart();
  return Math.floor((end.getTime() - t.getTime()) / MS_PER_DAY);
}

// 마감인지 판단
export function isClosedByEndDate(end: Date) {
  const t = todayStart();
  return t.getTime() >= end.getTime();
}

// 조기 마감인지 판단
// status는 끝났는데 날짜 규칙상 아직 마감일이 안 지났으면 조기마감
export function isEarlyClosed(status?: number, voteStartDateIso?: string) {
  if (status !== 1) return false;
  const end = endDateByRule(voteStartDateIso);
  if (!end) return false;
  return !isClosedByEndDate(end);
}
