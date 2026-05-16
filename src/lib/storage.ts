export const STORAGE_KEY = "stop-smoking-v1";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface Smoke {
  id: string;
  timestamp: number; // ms since epoch
}

export interface Settings {
  initialDailyCount: number;
  ultimateGoal: number;
  reductionRate: number; // percent, e.g. 10 = 10%
  name: string;
  minIntervalMinutes: number; // 0 = no restriction
}

export interface AppData {
  smokes: Smoke[];
  settings: Settings;
  setupComplete: boolean;
}

const DEFAULT_DATA: AppData = {
  smokes: [],
  settings: {
    initialDailyCount: 20,
    ultimateGoal: 0,
    reductionRate: 10,
    name: "",
    minIntervalMinutes: 0,
  },
  setupComplete: false,
};

// ── Persistence ──────────────────────────────────────────────────────────────

export function loadData(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_DATA;
  try {
    const parsed = JSON.parse(raw);
    // Migrate old format (logs: DayLog[]) → smokes
    if (parsed.logs && !parsed.smokes) {
      const smokes: Smoke[] = [];
      for (const log of parsed.logs as { date: string; count: number }[]) {
        const base = new Date(log.date + "T12:00:00").getTime();
        for (let i = 0; i < log.count; i++) {
          smokes.push({ id: generateId(), timestamp: base + i * 60_000 });
        }
      }
      return { ...DEFAULT_DATA, ...parsed, smokes, logs: undefined };
    }
    return { ...DEFAULT_DATA, ...parsed };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateStrFor(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function dateStrDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatTimeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "à l'instant";
  const m = Math.floor(diff / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  return `il y a ${h}h${m % 60 > 0 ? String(m % 60).padStart(2, "0") : ""}`;
}

// ── Smoke queries ─────────────────────────────────────────────────────────────

export function getTodaySmokes(smokes: Smoke[]): Smoke[] {
  const today = todayStr();
  return smokes
    .filter((s) => dateStrFor(s.timestamp) === today)
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function getTodayCount(smokes: Smoke[]): number {
  return getTodaySmokes(smokes).length;
}

export function getLastSmoke(smokes: Smoke[]): Smoke | null {
  if (smokes.length === 0) return null;
  return smokes.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
}

export interface DayStats {
  date: string;
  count: number;
}

export function getLast7Days(smokes: Smoke[]): DayStats[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = dateStrDaysAgo(6 - i);
    const count = smokes.filter((s) => dateStrFor(s.timestamp) === date).length;
    return { date, count };
  });
}

export function getDaysSinceStart(smokes: Smoke[]): number {
  if (smokes.length === 0) return 0;
  const first = smokes.reduce((a, b) => (a.timestamp < b.timestamp ? a : b));
  return Math.floor((Date.now() - first.timestamp) / (1000 * 60 * 60 * 24));
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function addCigarette(data: AppData, timestamp = Date.now()): AppData {
  const smoke: Smoke = { id: generateId(), timestamp };
  return { ...data, smokes: [...data.smokes, smoke] };
}

export function removeLastCigarette(data: AppData): AppData {
  const today = todayStr();
  const todaySmokes = data.smokes
    .filter((s) => dateStrFor(s.timestamp) === today)
    .sort((a, b) => b.timestamp - a.timestamp);
  if (todaySmokes.length === 0) return data;
  const removeId = todaySmokes[0].id;
  return { ...data, smokes: data.smokes.filter((s) => s.id !== removeId) };
}

export function removeSmokeById(data: AppData, id: string): AppData {
  return { ...data, smokes: data.smokes.filter((s) => s.id !== id) };
}

export function updateSmokeTimestamp(data: AppData, id: string, timestamp: number): AppData {
  return {
    ...data,
    smokes: data.smokes.map((s) => (s.id === id ? { ...s, timestamp } : s)),
  };
}

// ── Interval logic ────────────────────────────────────────────────────────────

/** Returns seconds remaining until the next cigarette is allowed. 0 = allowed now. */
export function secondsUntilAllowed(smokes: Smoke[], minIntervalMinutes: number): number {
  if (minIntervalMinutes === 0) return 0;
  const last = getLastSmoke(smokes);
  if (!last) return 0;
  const elapsed = (Date.now() - last.timestamp) / 1000;
  const required = minIntervalMinutes * 60;
  return Math.max(0, required - elapsed);
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
