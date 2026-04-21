import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.example",
      },
      {
        protocol: "https",
        hostname: "images.example",
      },
    ],
  },
  i18n: {
    locales: ["pt-BR", "pt-PT", "es", "en"],
    defaultLocale: "pt-BR",
    localeDetection: false,
  },
};

export default config;
