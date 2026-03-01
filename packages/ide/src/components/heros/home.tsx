// import Image from "next/image";
import { t } from "@/i18n";
import { ToggleTheme } from "../toggle-theme";
import { TypingAnimation } from "../ui/typing-animation";
import { useRouter } from "next/router";
import Link from "next/link";

export function HomeHero() {
    const { locale } = useRouter();
    return (
        <div className="flex gap-6 items-center flex-col md:flex-row-reverse">
            <div className="ml-auto flex items-center gap-3">
                <ToggleTheme />
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#0dccf2] to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-[#102023] font-bold text-sm rounded-xl shadow-[0_0_15px_rgba(13,204,242,0.25)] hover:shadow-[0_0_25px_rgba(13,204,242,0.45)] transition-all duration-300 transform active:scale-[0.97]"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Entrar
                </Link>
            </div>

            <div>
                <div className="flex flex-col md:flex-row gap-1 md:items-center text-center md:text-start">
                    <h1 className="text-4xl font-bold">{t(locale, "ui.hero_title")}</h1>
                </div>
                <p className="text-lg dark:text-gray-300 text-gray-700 text-center sm:text-start ">
                    {t(locale, "ui.hero_description")}{" "}
                    <code className="dark:text-gray-300 text-gray-700">
                        main.
                        <TypingAnimation
                            words={["?", "java", "c", "js", "py"]}
                            typeSpeed={100}
                            deleteSpeed={100}
                            pauseDelay={2000}
                            loop
                        />
                    </code>
                    {/* <TypingAnimation
            words={[
              "Análise léxica",
              "Análise sintática",
              "Código intermediário",
              "Tokens e AST",
            ]}
            typeSpeed={50}
            deleteSpeed={150}
            pauseDelay={2000}
            loop
          /> */}
                </p>
            </div>
            {/* <Image
        className="
            border-2 dark:border-slate-100 border-cyan-600  rounded-md
            "
        src="/java--.webp"
        alt="Next.js logo"
        width={70}
        height={20}
        // priority
      /> */}
        </div>
    );
}
