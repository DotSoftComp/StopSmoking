"use client";

import { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { AppData } from "@/lib/storage";

interface Props {
  settings: AppData["settings"];
  onSave: (settings: AppData["settings"]) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onReset, onClose }: Props) {
  const [name, setName]       = useState(settings.name);
  const [initial, setInitial] = useState(settings.initialDailyCount);
  const [goal, setGoal]       = useState(settings.ultimateGoal);
  const [rate, setRate]       = useState(settings.reductionRate);
  const [interval, setInterval] = useState(settings.minIntervalMinutes);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = () => {
    onSave({ name, initialDailyCount: initial, ultimateGoal: goal, reductionRate: rate, minIntervalMinutes: interval });
    onClose();
  };

  const intervalLabel = interval === 0 ? "Pas de limite" : `${interval} min`;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Paramètres</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Prénom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-emerald-400"
          />
        </div>

        {/* Initial count */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">
            Nombre de départ : <span className="text-emerald-600">{initial}/jour</span>
          </label>
          <input
            type="range" min={1} max={60} value={initial}
            onChange={(e) => setInitial(Number(e.target.value))}
            className="w-full accent-rose-400"
          />
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">
            Objectif final : <span className="text-emerald-600">{goal} cig/jour</span>
          </label>
          <input
            type="range" min={0} max={Math.max(initial - 1, 1)} value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Reduction rate */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Vitesse de réduction</label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                  rate === r ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* Min interval */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">
            Délai minimum entre cigarettes :{" "}
            <span className="text-indigo-600">{intervalLabel}</span>
          </label>
          <input
            type="range" min={0} max={120} step={5} value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Aucun</span>
            <span>30 min</span>
            <span>1h</span>
            <span>2h</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-200"
        >
          <Save className="w-5 h-5" />
          Enregistrer
        </button>

        <div>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-3 text-red-400 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Réinitialiser toutes les données
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-red-500 font-medium">
                Effacer toutes les données ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { onReset(); onClose(); }}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl"
                >
                  Effacer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
