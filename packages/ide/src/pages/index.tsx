import localFont from "next/font/local";
import { EditorProvider } from "@/contexts/EditorContext";
import { KeywordProvider } from "@/contexts/KeywordContext";
import { Footer } from "@/components/footer";
import { useState } from "react";
import { Meteores } from "@/components/canvas/meteores";
import { HomeHero } from "@/components/heros/home";
import { IDETerminal } from "@/views/ide-terminal-wrapper";

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
    <>
      <Meteores />
      <main
        className={`${geistSans.variable} ${geistMono.variable}
          min-h-screen p-6 gap-2 sm:p-8 font-[family-name:var(--font-geist-sans)]
          z-100 relative
          `}
      >
        <section className="flex flex-col gap-6 pb-20 max-w-screen-2xl m-auto z-10">
          <HomeHero />
          <EditorProvider>
            <KeywordProvider>
              <IDETerminal
                isTerminalOpen={isTerminalOpen}
                setIsTerminalOpen={setIsTerminalOpen}
              />
            </KeywordProvider>
          </EditorProvider>
        </section>
      </main>
      <Footer
        toggleTerminal={() => setIsTerminalOpen((old) => !old)}
        isTerminalOpen={isTerminalOpen}
      />
    </>
  );
}
