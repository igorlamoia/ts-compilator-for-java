import Image from "next/image";
import localFont from "next/font/local";
import { IDEView } from "@/views/ide";
import { EditorProvider } from "@/contexts/EditorContext";
import { Typing } from "@/components/text/typing";
import { ToggleTheme } from "@/components/toggle-theme";
import { Meteores } from "@/components/canvas/meteores";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Footer } from "@/components/footer";
import dynamic from "next/dynamic";
import { useState } from "react";

const TerminalView = dynamic(() => import("@/components/terminal"), {
  ssr: false,
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  return (
    <ThemeProvider>
      <Meteores />
      <main
        className={`${geistSans.variable} ${geistMono.variable}
          min-h-screen p-6 gap-2 sm:p-8 font-[family-name:var(--font-geist-sans)]
          z-100 relative
          `}
      >
        <section className="flex flex-col gap-6 pb-20 max-w-screen-2xl m-auto z-10">
          <div className="flex gap-6 items-center flex-col md:flex-row-reverse">
            <div className="ml-auto">
              <ToggleTheme />
            </div>

            <div>
              <div className="flex flex-col md:flex-row gap-2  items-center">
                <h1 className="text-4xl font-bold text-center">
                  Welcome to your IDE
                </h1>
                <div className="text-center">
                  <Typing
                    phrases={[
                      "JAVA --",
                      "where all is possible",
                      "perfect Lexer analysis",
                    ]}
                  />
                </div>
              </div>
              <p className="text-lg dark:text-gray-300 text-gray-700">
                Get started by editing the follwing file{" "}
                <code className="dark:text-gray-300 text-gray-700">
                  Home.java
                </code>
              </p>
            </div>
            <Image
              className="
            border-2 dark:border-slate-100 border-cyan-600  rounded-md
            "
              src="/java--.webp"
              alt="Next.js logo"
              width={70}
              height={20}
              // priority
            />
          </div>
          <EditorProvider>
            <IDEView />
            <TerminalView
              isTerminalOpen={isTerminalOpen}
              toggleTerminal={() => setIsTerminalOpen((old) => !old)}
            />
          </EditorProvider>
        </section>
      </main>
      <Footer toggleTerminal={() => setIsTerminalOpen((old) => !old)} />
    </ThemeProvider>
  );
}
