"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed (running as standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("pwa-dismissed")) return;

    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(navigator as unknown as { standalone?: boolean }).standalone;

    if (isIos) {
      setTimeout(() => setShowIosHint(true), 2000);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstallEvent(null);
      setShowIosHint(false);
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("pwa-dismissed", "1");
    setDismissed(true);
    setInstallEvent(null);
    setShowIosHint(false);
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setInstallEvent(null);
  };

  if (dismissed) return null;

  // Android / Chrome / Edge install banner
  if (installEvent) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xl">
          🌿
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Installer l'application</p>
          <p className="text-xs text-gray-500">Accès rapide depuis ton écran d'accueil</p>
        </div>
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 bg-emerald-500 text-white text-sm font-semibold px-3 py-2 rounded-xl flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          Installer
        </button>
        <button onClick={dismiss} className="p-1 text-gray-400 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // iOS Safari hint
  if (showIosHint) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-in slide-in-from-bottom-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800">Ajouter à l'écran d'accueil</p>
          <button onClick={dismiss} className="p-1 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>1.</span>
            <Share className="w-4 h-4 text-blue-500" />
            <span>Appuie sur Partager</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          2. Puis <span className="font-semibold">"Sur l'écran d'accueil"</span>
        </p>
        {/* Arrow pointing down toward browser chrome */}
        <div className="flex justify-center mt-3">
          <div className="text-blue-400 text-lg animate-bounce">↓</div>
        </div>
      </div>
    );
  }

  return null;
}
