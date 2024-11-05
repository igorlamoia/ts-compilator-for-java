import Image from "next/image";
import localFont from "next/font/local";
import { IDEView } from "@/views/ide";
import { EditorProvider } from "@/contexts/EditorContext";
import { Typing } from "@/components/text/typing";
import { ToggleTheme } from "@/components/toggle-theme";
import { NightSky } from "@/components/canvas/night-sky";
import { Meteores } from "@/components/canvas/meteores";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
  return (
    <EditorProvider>
      <ThemeProvider>
        <div className="">
          <div className="">
            <Meteores />
          </div>
          {/* <NightSky /> */}
          <div
            className={`${geistSans.variable} ${geistMono.variable}
          min-h-screen p-6 gap-2 sm:p-8 font-[family-name:var(--font-geist-sans)]
          z-100 relative
          `}
          >
            <main className="flex flex-col gap-6 pb-20 max-w-screen-2xl m-auto z-10">
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
              <IDEView />
            </main>

            {/* bg-[var(--background)]/[0.9] */}
            <footer
              className="fixed bottom-0 left-0 p-2
         bg-[#0a0a0a]/[.8]
         text-gray-100
         backdrop-blur-sm  w-full flex gap-6 flex-wrap items-center justify-center"
            >
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://github.com/igorlamoia/ts-compilator-for-java/tree/main/packages/compiler"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/file.svg"
                  alt="File icon"
                  width={16}
                  height={16}
                />
                Lexer Code
              </a>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://github.com/igorlamoia/ts-compilator-for-java/tree/main/packages/ide"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/window.svg"
                  alt="Window icon"
                  width={16}
                  height={16}
                />
                IDE
              </a>
              <a
                className="hidden sm:flex items-center gap-2 hover:underline hover:underline-offset-4"
                href="https://github.com/igorlamoia/ts-compilator-for-java"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/globe.svg"
                  alt="Globe icon"
                  width={16}
                  height={16}
                />
                Github Project →
              </a>
            </footer>
          </div>
        </div>
      </ThemeProvider>
    </EditorProvider>
  );
}
