// import Image from "next/image";
import { t } from "@/i18n";
import { ToggleTheme } from "../toggle-theme";
import { TypingAnimation } from "../ui/typing-animation";
import { useRouter } from "next/router";

export function HomeHero() {
  const { locale } = useRouter();
  return (
    <div className="flex gap-6 items-center flex-col md:flex-row-reverse">
      <div className="ml-auto">
        <ToggleTheme />
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
