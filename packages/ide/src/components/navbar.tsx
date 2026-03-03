import Link from "next/link";
import { Logo } from "./logo";
import { HeroLink } from "./buttons/hero";
import { LogIn } from "lucide-react";
import { useRouter } from "next/router";
import { t } from "@/i18n";
import { ToggleTheme } from "./toggle-theme";

interface NavbarProps {
  links?: { label: string; href: string }[];
  hasAuth?: boolean;
}

export function Navbar({ links, hasAuth = true }: NavbarProps) {
  const { locale } = useRouter();
  return (
    <>
      <header className="w-full border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto gap-6 px-6 h-16 flex items-center justify-between">
          <Logo />
          <ul className="ml-auto">
            {links && links.length > 0 && (
              <nav className="flex items-center gap-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </ul>
          {hasAuth && (
            <HeroLink href="/login">
              <LogIn className="w-4 h-4" />
              {t(locale, "ui.login")}
            </HeroLink>
          )}
        </div>
      </header>
      <div className="fixed left-4 bottom-4 z-1000">
        <ToggleTheme />
      </div>
    </>
  );
}
