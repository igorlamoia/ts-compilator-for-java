// import Image from "next/image";
import { t } from "@/i18n";
import { TypingAnimation } from "../ui/typing-animation";
import { useRouter } from "next/router";

export function HomeHero() {
  const { locale } = useRouter();
  return (
    <div className="flex gap-6 items-center flex-col ">
      <div>
        <div className="flex flex-col gap-1 md:items-center text-center md:text-start">
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
        </p>
      </div>
    </div>
  );
}
