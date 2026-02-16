import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  i18n: {
    locales: ["pt-BR", "pt-PT", "es", "en"],
    defaultLocale: "pt-BR",
    localeDetection: false,
  },
};

export default config;
