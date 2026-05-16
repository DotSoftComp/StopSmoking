"use client";

import { DayStats } from "@/lib/storage";
import { formatDate } from "@/lib/goals";

interface Props {
  days: DayStats[];
  dailyGoal: number;
}

export default function WeekChart({ days, dailyGoal }: Props) {
  const max = Math.max(dailyGoal, ...days.map((d) => d.count), 1);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        7 derniers jours
      </p>
      <div className="flex items-end justify-between gap-2 h-20">
        {days.map((day) => {
          const isToday = day.date === todayStr;
          const heightPct = (day.count / max) * 100;
          const goalPct  = Math.min((dailyGoal / max) * 100, 100);
          const over = day.count > dailyGoal && dailyGoal > 0;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative flex flex-col justify-end" style={{ height: 64 }}>
                {/* Goal line marker */}
                <div
                  className="absolute w-full border-t-2 border-dashed border-emerald-300 opacity-70"
                  style={{ bottom: `${goalPct}%` }}
                />
                {/* Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isToday
                      ? over ? "bg-red-400" : "bg-emerald-500"
                      : over ? "bg-red-200" : "bg-emerald-200"
                  }`}
                  style={{ height: `${Math.max(heightPct, day.count > 0 ? 8 : 0)}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isToday ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {formatDate(day.date)}
              </span>
              {isToday && (
                <span className="text-[10px] font-bold text-emerald-600">{day.count}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <div className="w-4 h-0 border-t-2 border-dashed border-emerald-300" />
        <span className="text-[10px] text-gray-400">objectif {dailyGoal}/jour</span>
      </div>
    </div>
  );
}
