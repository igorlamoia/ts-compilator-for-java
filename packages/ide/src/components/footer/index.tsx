import Image from "next/image";
import { useState } from "react";
interface FooterProps {
  toggleTerminal: () => void;
  isTerminalOpen: boolean;
}
export function Footer({ toggleTerminal, isTerminalOpen }: FooterProps) {
  const [isDocOpen, setIsDocOpen] = useState(false);

  return (
    <>
      <div className={`${isTerminalOpen ? "mt-[8rem]" : "mt-0"}`}></div>
      <footer
        className={
          "fixed bottom-0 left-0 right-0 p-2 px-4 bg-[#0a0a0a]/80 text-gray-100 backdrop-blur-sm w-full flex justify-between items-center z-50"
        }
      >
        <div className="flex flex-col md:flex-row space-x-2 w-full md:items-center">
          <ButtonItem
            onClick={() => setIsDocOpen((old) => !old)}
            src="/globe.svg"
          >
            Documentation
            <span
              className={`transition-transform  duration-500 md:inline-block`}
            >
              <span
                className={`inline-block transform ${
                  isDocOpen
                    ? "rotate-180 md:rotate-[-90deg]"
                    : "rotate-0 md:rotate-90"
                } `}
              >
                ↑
              </span>
            </span>
          </ButtonItem>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isDocOpen
                ? "max-h-40 opacity-100 scale-100"
                : "max-h-0 opacity-0 scale-95"
            }`}
          >
            <DocumentationLinks />
          </div>
        </div>
        <ButtonItem
          onClick={toggleTerminal}
          src="/window.svg"
          alt="Window icon"
        >
          Terminal
        </ButtonItem>
      </footer>
    </>
  );
}

function DocumentationLinks() {
  return (
    <div className="flex flex-col md:flex-row gap-2 flex-wrap md:items-center justify-center">
      <LinkItem
        href="https://github.com/igorlamoia/ts-compilator-for-java/tree/main/packages/compiler"
        src="/file.svg"
        alt="File icon"
      >
        Lexer Code
      </LinkItem>
      <LinkItem
        href="https://github.com/igorlamoia/ts-compilator-for-java/tree/main/packages/ide"
        src="/file.svg"
        alt="IDE icon"
      >
        IDE
      </LinkItem>
      <LinkItem
        href="https://github.com/igorlamoia/ts-compilator-for-java"
        src="/globe.svg"
        alt="Github icon"
      >
        Github Project
      </LinkItem>
    </div>
  );
}

interface ButtonItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  src?: string;
  alt?: string;
  children: React.ReactNode;
}

function ButtonItem({
  src = "/file.svg",
  alt = "Button icon",
  children,
  ...rest
}: ButtonItemProps) {
  return (
    <button
      className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-transform"
      {...rest}
    >
      <Image src={src} alt={alt} aria-hidden width={16} height={16} />
      {children}
    </button>
  );
}

interface LinkItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  src?: string;
  alt?: string;
  children: React.ReactNode;
}

function LinkItem({
  src = "/file.svg",
  alt = "Link icon",
  children,
  ...rest
}: LinkItemProps) {
  return (
    <a
      className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-opacity"
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      <Image src={src} alt={alt} aria-hidden width={16} height={16} />
      {children}
    </a>
  );
}
