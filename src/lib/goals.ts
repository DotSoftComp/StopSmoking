import { AppData, getLast7Days } from "./storage";

export function calculateDailyGoal(data: AppData): number {
  const { settings, smokes } = data;
  const { initialDailyCount, ultimateGoal, reductionRate } = settings;

  // Use last 7 completed days (exclude today)
  const last7 = getLast7Days(smokes).slice(0, 6);
  const hasHistory = last7.some((d) => d.count > 0);

  if (!hasHistory) return initialDailyCount;

  const avg = last7.reduce((sum, d) => sum + d.count, 0) / 7;
  const reduced = avg * (1 - reductionRate / 100);
  return Math.max(ultimateGoal, Math.ceil(reduced));
}

export type ProgressLevel = "great" | "good" | "warning" | "over";

export function getProgressLevel(count: number, goal: number): ProgressLevel {
  if (goal === 0) return count === 0 ? "great" : "over";
  const ratio = count / goal;
  if (ratio <= 0.5) return "great";
  if (ratio <= 0.8) return "good";
  if (ratio < 1) return "warning";
  return "over";
}

export const LEVEL_COLORS: Record<
  ProgressLevel,
  { bg: string; text: string; ring: string; bar: string }
> = {
  great:   { bg: "bg-emerald-50",  text: "text-emerald-600", ring: "stroke-emerald-500", bar: "bg-emerald-500" },
  good:    { bg: "bg-amber-50",    text: "text-amber-600",   ring: "stroke-amber-400",   bar: "bg-amber-400"   },
  warning: { bg: "bg-orange-50",   text: "text-orange-600",  ring: "stroke-orange-500",  bar: "bg-orange-500"  },
  over:    { bg: "bg-red-50",      text: "text-red-600",     ring: "stroke-red-500",     bar: "bg-red-500"     },
};

export const MOTIVATIONAL_MESSAGES: Record<ProgressLevel, string[]> = {
  great: [
    "Tu fais un super boulot ! Continue 💪",
    "Incroyable volonté aujourd'hui !",
    "Tes poumons te remercient 🌿",
    "Chaque cigarette évitée est une victoire !",
  ],
  good: [
    "Bon rythme, reste forte !",
    "Tu es sur la bonne voie !",
    "À mi-chemin, tu y arrives !",
    "Un pas à la fois 🚶",
  ],
  warning: [
    "Ralentis un peu, tu approches de la limite",
    "Prends une grande inspiration 🌬️",
    "Tu es presque à la limite — tiens bon !",
    "Pense au chemin parcouru",
  ],
  over: [
    "Au-dessus aujourd'hui, mais demain c'est un nouveau départ 🌅",
    "C'est ok — on repart de zéro demain",
    "Chaque jour est une nouvelle chance. Tu peux le faire !",
    "Ne lâche pas — les progrès ne sont pas toujours linéaires",
  ],
};

export function getMotivationalMessage(level: ProgressLevel, seed: number): string {
  const messages = MOTIVATIONAL_MESSAGES[level];
  return messages[seed % messages.length];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3);
}
