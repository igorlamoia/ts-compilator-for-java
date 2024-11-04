import { ToastProvider } from "@/contexts/ToastContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <div
        className="bg-white
      dark:bg-[#202020]
      text-gray-900
      dark:text-gray-100
      transition-colors duration-300"
      >
        <Component {...pageProps} />
      </div>
    </ToastProvider>
  );
}
