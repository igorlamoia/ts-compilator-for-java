import Image from "next/image";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 p-2 bg-[#0a0a0a]/[.8] text-gray-100 backdrop-blur-sm  w-full flex gap-6 flex-wrap items-center justify-center">
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
  );
}
