"use client";

import { ProgressLevel, LEVEL_COLORS } from "@/lib/goals";

interface Props {
  count: number;
  goal: number;
  level: ProgressLevel;
}

export default function CircularProgress({ count, goal, level }: Props) {
  const R = 80;
  const circumference = 2 * Math.PI * R;
  const ratio = goal > 0 ? Math.min(count / goal, 1) : count > 0 ? 1 : 0;
  const dash = ratio * circumference;
  const { ring } = LEVEL_COLORS[level];

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring (pulse when under limit) */}
      {level === "great" && (
        <div className="absolute w-52 h-52 rounded-full bg-emerald-100 pulse-ring" />
      )}

      <svg width={200} height={200} className="-rotate-90">
        {/* Track */}
        <circle
          cx={100}
          cy={100}
          r={R}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={14}
        />
        {/* Progress arc */}
        <circle
          cx={100}
          cy={100}
          r={R}
          fill="none"
          className={`${ring} transition-all duration-700 ease-out`}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-bold text-gray-800 leading-none">{count}</span>
        <span className="text-sm text-gray-400 mt-1">
          sur {goal === 0 ? "∞" : goal} max
        </span>
        {goal > 0 && count < goal && (
          <span className="text-xs text-gray-500 mt-1">
            encore {goal - count} restant{goal - count > 1 ? "s" : ""}
          </span>
        )}
        {goal > 0 && count >= goal && (
          <span className="text-xs text-red-500 mt-1 font-semibold">Limite atteinte</span>
        )}
      </div>
    </div>
  );
}
