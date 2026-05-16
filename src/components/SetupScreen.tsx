"use client";

import { useState } from "react";
import { Cigarette, Target, TrendingDown, User } from "lucide-react";
import { AppData } from "@/lib/storage";

interface Props {
  onComplete: (settings: AppData["settings"]) => void;
}

export default function SetupScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [initial, setInitial] = useState(20);
  const [goal, setGoal] = useState(0);
  const [rate, setRate] = useState(10);

  const steps = [
    {
      icon: <User className="w-10 h-10 text-emerald-500" />,
      title: "Bonjour !",
      subtitle: "Comment tu t'appelles ?",
      content: (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton prénom..."
          className="w-full text-center text-2xl font-medium border-b-2 border-emerald-400 bg-transparent outline-none py-3 text-gray-800 placeholder:text-gray-300"
          autoFocus
        />
      ),
      canNext: name.trim().length > 0,
    },
    {
      icon: <Cigarette className="w-10 h-10 text-rose-400" />,
      title: "Situation actuelle",
      subtitle: "Combien de cigarettes par jour en ce moment ?",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-7xl font-bold text-gray-800">{initial}</span>
            <span className="text-2xl text-gray-500 ml-2">/ jour</span>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            value={initial}
            onChange={(e) => setInitial(Number(e.target.value))}
            className="w-full accent-rose-400"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>1</span>
            <span>30</span>
            <span>60</span>
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      icon: <Target className="w-10 h-10 text-emerald-500" />,
      title: "Ton objectif",
      subtitle: "Combien de cigarettes par jour veux-tu atteindre ?",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-7xl font-bold text-gray-800">{goal}</span>
            <span className="text-2xl text-gray-500 ml-2">/ jour</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(initial - 1, 1)}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>0 (arrêter)</span>
            <span>{Math.max(initial - 1, 1)}</span>
          </div>
          {goal === 0 && (
            <p className="text-center text-emerald-600 font-medium text-sm">
              Objectif : arrêter complètement 🎉
            </p>
          )}
        </div>
      ),
      canNext: true,
    },
    {
      icon: <TrendingDown className="w-10 h-10 text-indigo-500" />,
      title: "Vitesse de réduction",
      subtitle: "De combien réduire chaque semaine ?",
      content: (
        <div className="space-y-4">
          {[
            { value: 5,  label: "Douce",    desc: "−5% par semaine" },
            { value: 10, label: "Modérée",  desc: "−10% par semaine (recommandé)" },
            { value: 15, label: "Rapide",   desc: "−15% par semaine" },
            { value: 20, label: "Intense",  desc: "−20% par semaine" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRate(opt.value)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                rate === opt.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <span className="font-semibold text-gray-800">{opt.label}</span>
              <span className="text-sm text-gray-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        name: name.trim(),
        initialDailyCount: initial,
        ultimateGoal: goal,
        reductionRate: rate,
        minIntervalMinutes: 0,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 safe-top safe-bottom bg-gradient-to-b from-white to-emerald-50">
      {/* Progress dots */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-emerald-500" : i < step ? "w-2 bg-emerald-300" : "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          {current.icon}
          <h1 className="text-2xl font-bold text-gray-800">{current.title}</h1>
          <p className="text-gray-500">{current.subtitle}</p>
        </div>
        <div className="w-full">{current.content}</div>
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!current.canNext}
        className={`w-full max-w-sm py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
          current.canNext
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 active:scale-95"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {step < steps.length - 1 ? "Continuer →" : "Commencer mon parcours 🌱"}
      </button>
    </div>
  );
}
