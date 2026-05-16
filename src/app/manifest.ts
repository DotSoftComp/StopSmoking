import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stop Smoking",
    short_name: "No Smoke",
    description: "Track and reduce your cigarettes day by day",
    start_url: "/",
    display: "standalone",
    background_color: "#fef9f0",
    theme_color: "#10b981",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
