"use client";

import { useState } from "react";
import { X, Trash2, Pencil, Check, Plus, Clock } from "lucide-react";
import {
  AppData,
  Smoke,
  getTodaySmokes,
  removeSmokeById,
  updateSmokeTimestamp,
  addCigarette,
  saveData,
  todayStr,
  formatTime,
} from "@/lib/storage";

interface Props {
  data: AppData;
  onDataChange: (data: AppData) => void;
  onClose: () => void;
}

function tsToTimeInput(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function timeInputToTs(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export default function SmokesEditModal({ data, onDataChange, onClose }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTime, setAddTime] = useState(tsToTimeInput(Date.now()));

  const todaySmokes = getTodaySmokes(data.smokes).slice().reverse(); // newest first

  const persist = (next: AppData) => {
    saveData(next);
    onDataChange(next);
  };

  const handleDelete = (id: string) => {
    persist(removeSmokeById(data, id));
    if (editingId === id) setEditingId(null);
  };

  const startEdit = (smoke: Smoke) => {
    setEditingId(smoke.id);
    setEditValue(tsToTimeInput(smoke.timestamp));
  };

  const confirmEdit = (id: string) => {
    const ts = timeInputToTs(editValue);
    // Don't allow future times
    const clamped = Math.min(ts, Date.now());
    persist(updateSmokeTimestamp(data, id, clamped));
    setEditingId(null);
  };

  const handleAdd = () => {
    const ts = timeInputToTs(addTime);
    const clamped = Math.min(ts, Date.now());
    persist(addCigarette(data, clamped));
    setShowAddForm(false);
    setAddTime(tsToTimeInput(Date.now()));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Cigarettes du jour</h2>
            <p className="text-xs text-gray-400">
              {todaySmokes.length} cigarette{todaySmokes.length !== 1 ? "s" : ""} aujourd'hui
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {todaySmokes.length === 0 && (
            <p className="text-center text-gray-400 py-8">Aucune cigarette enregistrée</p>
          )}

          {todaySmokes.map((smoke, i) => (
            <div
              key={smoke.id}
              className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3"
            >
              <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-rose-500">
                  {todaySmokes.length - i}
                </span>
              </div>

              {editingId === smoke.id ? (
                <input
                  type="time"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 text-base font-semibold text-gray-800 bg-white border border-emerald-400 rounded-xl px-3 py-1.5 outline-none"
                  autoFocus
                />
              ) : (
                <div className="flex-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-base font-semibold text-gray-800">
                    {formatTime(smoke.timestamp)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1">
                {editingId === smoke.id ? (
                  <button
                    onClick={() => confirmEdit(smoke.id)}
                    className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(smoke)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(smoke.id)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add at custom time */}
        <div className="px-4 pb-6 pt-2 border-t border-gray-100 space-y-3">
          {showAddForm ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={addTime}
                  onChange={(e) => setAddTime(e.target.value)}
                  className="flex-1 text-base font-semibold text-gray-800 bg-transparent outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={handleAdd}
                className="px-4 py-3 bg-emerald-500 text-white font-bold rounded-2xl flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Ajouter
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter à une heure précise
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
