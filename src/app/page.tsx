"use client";

import { useState, useEffect } from "react";
import { loadData, saveData, AppData } from "@/lib/storage";
import SetupScreen from "@/components/SetupScreen";
import MainScreen from "@/components/MainScreen";

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  const handleSetupComplete = (settings: AppData["settings"]) => {
    const newData: AppData = {
      smokes: [],
      settings,
      setupComplete: true,
    };
    saveData(newData);
    setData(newData);
  };

  const handleDataChange = (newData: AppData) => {
    setData(newData);
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-300 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!data.setupComplete) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  return <MainScreen data={data} onDataChange={handleDataChange} />;
}
