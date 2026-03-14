import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen } from "lucide-react";

export function Sidebar() {
  const { pathname } = useRouter();
  const { isAuthenticated } = useAuth();

  const menuItems = [
    {
      id: "turmas",
      label: "Minhas Turmas",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/dashboard",
      activeMatchers: ["/dashboard", "/classes"],
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <aside className="w-64 h-full shrink-0 flex flex-col bg-[#110c1c] border-r border-[#ffffff0a] relative z-40">
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-6">
        {menuItems.map((item) => {
          const isActive = item.activeMatchers.some((matcher) =>
            pathname.startsWith(matcher)
          );

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-[#251e3c] border border-[#3b305c] text-white shadow-sm"
                  : "text-[#8a8698] border border-transparent hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <div
                className={`${
                  isActive ? "text-[#e9e8ed]" : "text-[#8a8698] group-hover:text-slate-300 transition-colors"
                }`}
              >
                {item.icon}
              </div>
              <span className={`text-[14px] font-bold ${isActive ? "text-white" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
