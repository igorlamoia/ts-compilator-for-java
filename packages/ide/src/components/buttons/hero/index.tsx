import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface HeroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline";
}

export function HeroButton(props: HeroButtonProps) {
  const { children, variant = "primary", ...rest } = props;

  return (
    <button
      {...rest}
      className={cn(
        "group inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[#102023] font-bold text-sm rounded-lg  transition-all duration-300 transform active:scale-[0.97]  hover:scale-[1.02] cursor-pointer",
        variant === "primary" &&
          "bg-linear-to-r from-[#0dccf2] to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 shadow-[0_0_15px_rgba(13,204,242,0.25)] hover:shadow-[0_0_25px_rgba(13,204,242,0.45)]",
        variant === "outline" &&
          "border border-white/10 hover:border-[#0dccf2]/50 hover:bg-[#0dccf2]/5 text-slate-300 hover:text-[#0dccf2]",
        props.className,
      )}
    >
      {children}
    </button>
  );
}
interface HeroLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  href: string;
}

export function HeroLink(props: HeroLinkProps) {
  const { children, variant = "primary", ...rest } = props;

  return (
    <Link
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[#102023] font-bold text-sm rounded-xl  transition-all duration-300 transform active:scale-[0.97] hover:scale-[1.02]  cursor-pointer",
        variant === "primary" &&
          "bg-linear-to-r from-[#0dccf2] to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 shadow-[0_0_15px_rgba(13,204,242,0.25)] hover:shadow-[0_0_25px_rgba(13,204,242,0.45)]",
        variant === "outline" &&
          "border border-white/10 hover:border-[#0dccf2]/50 hover:bg-[#0dccf2]/5 text-slate-300 hover:text-[#0dccf2]",
        props.className,
      )}
    >
      {children}
    </Link>
  );
}
