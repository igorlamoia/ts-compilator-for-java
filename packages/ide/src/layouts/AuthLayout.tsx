import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

export function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
