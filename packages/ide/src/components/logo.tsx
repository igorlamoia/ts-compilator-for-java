import { CodeXml } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0dccf2] to-[#10b981] flex items-center justify-center text-[#101f22] shadow-[0_0_15px_rgba(13,204,242,0.4)] group-hover:shadow-[0_0_25px_rgba(13,204,242,0.6)] transition-all duration-300">
        <CodeXml />
      </div>
      <p className="text-2xl font-black text-white tracking-tight">
        La&apos;Vile
        <span className="text-[#0dccf2] drop-shadow-[0_0_8px_rgba(13,204,242,0.8)]">
          la
        </span>
      </p>
    </Link>
  );
}
