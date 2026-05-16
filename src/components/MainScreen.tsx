"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, RotateCcw, Pencil, Clock } from "lucide-react";
import {
  AppData,
  addCigarette,
  removeLastCigarette,
  getTodayCount,
  getTodaySmokes,
  getLast7Days,
  getDaysSinceStart,
  getLastSmoke,
  secondsUntilAllowed,
  formatCountdown,
  formatTimeAgo,
  formatTime,
  saveData,
} from "@/lib/storage";
import {
  calculateDailyGoal,
  getProgressLevel,
  getMotivationalMessage,
  LEVEL_COLORS,
} from "@/lib/goals";
import CircularProgress from "./CircularProgress";
import WeekChart from "./WeekChart";
import SettingsModal from "./SettingsModal";
import SmokesEditModal from "./SmokesEditModal";

interface Props {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export default function MainScreen({ data, onDataChange }: Props) {
  const [showUndo, setShowUndo]           = useState(false);
  const [showSettings, setShowSettings]   = useState(false);
  const [showEditSmokes, setShowEditSmokes] = useState(false);
  const [buttonPop, setButtonPop]         = useState(false);
  const [secondsLeft, setSecondsLeft]     = useState(0);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayCount = getTodayCount(data.smokes);
  const dailyGoal  = calculateDailyGoal(data);
  const last7      = getLast7Days(data.smokes);
  const level      = getProgressLevel(todayCount, dailyGoal);
  const colors     = LEVEL_COLORS[level];
  const message    = getMotivationalMessage(level, todayCount);
  const daysSince  = getDaysSinceStart(data.smokes);
  const lastSmoke  = getLastSmoke(data.smokes);
  const todaySmokes = getTodaySmokes(data.smokes);
  const minInterval = data.settings.minIntervalMinutes;

  // Live countdown timer
  useEffect(() => {
    const tick = () => {
      setSecondsLeft(Math.ceil(secondsUntilAllowed(data.smokes, minInterval)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.smokes, minInterval]);

  const canSmoke = secondsLeft === 0;

  const handleSmoke = useCallback(() => {
    if (!canSmoke) return;
    if ("vibrate" in navigator) navigator.vibrate(50);

    const newData = addCigarette(data);
    saveData(newData);
    onDataChange(newData);
    setButtonPop(true);
    setTimeout(() => setButtonPop(false), 300);

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setShowUndo(true);
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000);
  }, [data, onDataChange, canSmoke]);

  const handleUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setShowUndo(false);
    const newData = removeLastCigarette(data);
    saveData(newData);
    onDataChange(newData);
  }, [data, onDataChange]);

  const handleSaveSettings = (settings: AppData["settings"]) => {
    const newData = { ...data, settings };
    saveData(newData);
    onDataChange(newData);
  };

  const handleReset = () => {
    const fresh: AppData = { smokes: [], settings: data.settings, setupComplete: false };
    saveData(fresh);
    onDataChange(fresh);
  };

  const remainingText =
    dailyGoal > 0
      ? todayCount >= dailyGoal
        ? `+${todayCount - dailyGoal} au-dessus de la limite`
        : `${dailyGoal - todayCount} restant${dailyGoal - todayCount > 1 ? "s" : ""} aujourd'hui`
      : "Objectif : zéro cigarette";

  return (
    <div className={`min-h-screen flex flex-col safe-top safe-bottom transition-colors duration-500 ${colors.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {data.settings.name ? `Courage, ${data.settings.name} 💪` : "Courage ! 💪"}
          </h1>
          {daysSince > 0 && (
            <p className="text-xs text-gray-400">Jour {daysSince + 1} du parcours</p>
          )}
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center"
        >
          <Settings className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Week chart */}
      <div className="px-5 pt-3">
        <WeekChart days={last7} dailyGoal={dailyGoal} />
      </div>

      {/* Main progress + last smoke info */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <CircularProgress count={todayCount} goal={dailyGoal} level={level} />

        <p className={`text-sm font-semibold ${colors.text}`}>{remainingText}</p>

        {/* Last cigarette info + edit today button */}
        <div className="flex items-center gap-3">
          {lastSmoke && (
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                Dernière : {formatTime(lastSmoke.timestamp)} ({formatTimeAgo(lastSmoke.timestamp)})
              </span>
            </div>
          )}
          {todaySmokes.length > 0 && (
            <button
              onClick={() => setShowEditSmokes(true)}
              className="flex items-center gap-1 bg-white/70 rounded-full px-3 py-1.5"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">Modifier</span>
            </button>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-xs text-center">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 flex flex-col items-center gap-3">
        {showUndo && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-2 text-sm text-gray-500 py-2 px-4 bg-white rounded-full shadow-sm active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Annuler
          </button>
        )}

        {/* Interval countdown */}
        {!canSmoke && minInterval > 0 && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-gray-500">Prochaine cigarette autorisée dans</p>
            <span className="text-3xl font-bold tabular-nums text-indigo-600">
              {formatCountdown(secondsLeft)}
            </span>
          </div>
        )}

        <button
          onClick={handleSmoke}
          disabled={!canSmoke}
          className={`w-full max-w-sm py-5 rounded-3xl font-bold text-xl text-white transition-all duration-200 shadow-xl ${
            buttonPop ? "pop" : ""
          } ${
            !canSmoke
              ? "bg-gray-300 shadow-gray-100 cursor-not-allowed"
              : level === "over"
              ? "bg-red-500 shadow-red-200 active:scale-95"
              : "bg-rose-500 shadow-rose-200 active:scale-95"
          }`}
        >
          {canSmoke ? "🚬  J'ai fumé une cigarette" : "⏳  Patiente encore un peu"}
        </button>

        <p className="text-xs text-gray-400">
          Objectif du jour :{" "}
          {dailyGoal > 0 ? `max ${dailyGoal} cigarette${dailyGoal > 1 ? "s" : ""}` : "aucune"}
          {minInterval > 0 && ` · ${minInterval} min entre chaque`}
        </p>
      </div>

      {showSettings && (
        <SettingsModal
          settings={data.settings}
          onSave={handleSaveSettings}
          onReset={handleReset}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showEditSmokes && (
        <SmokesEditModal
          data={data}
          onDataChange={onDataChange}
          onClose={() => setShowEditSmokes(false)}
        />
      )}
    </div>
  );
}
