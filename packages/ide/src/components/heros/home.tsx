import Image from "next/image";
import { ToggleTheme } from "../toggle-theme";
import { TypingAnimation } from "../ui/typing-animation";

export function HomeHero() {
  return (
    <div className="flex gap-6 items-center flex-col md:flex-row-reverse">
      <div className="ml-auto">
        <ToggleTheme />
      </div>

      <div>
        <div className="flex flex-col lg:flex-row gap-1  items-center">
          <h1 className="text-4xl font-bold text-center">
            Welcome to your IDE
          </h1>
          <div className="text-center">
            <TypingAnimation
              words={[
                "JAVA --",
                "where all is possible",
                "perfect Lexer analysis",
              ]}
              typeSpeed={50}
              deleteSpeed={150}
              pauseDelay={2000}
              loop
            />
          </div>
        </div>
        <p className="text-lg dark:text-gray-300 text-gray-700">
          Get started by editing the follwing file{" "}
          <code className="dark:text-gray-300 text-gray-700">Home.java</code>
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
  );
}
