import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PwaPrompt from "@/components/PwaPrompt";

export const metadata: Metadata = {
  title: "Stop Smoking",
  description: "Track and reduce your cigarettes day by day",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "No Smoke",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen antialiased">
        <ServiceWorkerRegister />
        {children}
        <PwaPrompt />
      </body>
    </html>
  );
}
