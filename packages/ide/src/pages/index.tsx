import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import { createContext, useContext, useState } from "react";
import { SpaceBackground } from "@/components/space-background";
import { HomeHero } from "@/components/heros/home";
import { IDEFunction } from "@/views/ide-terminal-wrapper";

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

type TerminalContextType = {
  isTerminalOpen: boolean;
  setIsTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const TerminalContext = createContext<TerminalContextType>(
  {} as TerminalContextType,
);

export function useTerminalContext() {
  return useContext(TerminalContext);
}

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isOpenKeywordCustomizer, setIsOpenKeywordCustomizer] = useState(false);
  return (
    <div className="relative overflow-hidden">
      <SpaceBackground />
      <TerminalContext.Provider value={{ isTerminalOpen, setIsTerminalOpen }}>
        <main
          className={`${geistSans.variable} ${geistMono.variable}
          min-h-screen p-6 gap-2 sm:p-8 font-(family-name:--font-geist-sans)
          z-100 relative
          `}
        >
          <section className="flex flex-col gap-6 pb-20 max-w-screen-2xl m-auto z-10">
            <HomeHero />
            <IDEFunction
              isOpenKeywordCustomizer={isOpenKeywordCustomizer}
              setIsOpenKeywordCustomizer={setIsOpenKeywordCustomizer}
            />
          </section>
        </main>
        <Footer
          toggleKeywordCustomizer={() =>
            setIsOpenKeywordCustomizer((old) => !old)
          }
        />
      </TerminalContext.Provider>
    </div>
  );
}
