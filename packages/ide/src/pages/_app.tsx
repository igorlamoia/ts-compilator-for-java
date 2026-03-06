import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AlertProvider } from "@/components/alert";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";

type NextPageWithAuth = NextPage & {
  requireAuth?: boolean;
};

type AppPropsWithAuth = AppProps & {
  Component: NextPageWithAuth;
};

export default function App({ Component, pageProps }: AppPropsWithAuth) {
  return (
    <ThemeProvider>
      <AuthLayout>
        <AlertProvider>
          <ToastProvider>
            <div className="bg-white dark:bg-[#202020] text-gray-900 dark:text-gray-100 transition-colors duration-300">
              <AuthGuard requireAuth={Component.requireAuth}>
                <Component {...pageProps} />
              </AuthGuard>
            </div>
          </ToastProvider>
        </AlertProvider>
      </AuthLayout>
    </ThemeProvider>
  );
}

function AuthGuard({
  requireAuth,
  children,
}: {
  requireAuth?: boolean;
  children: ReactNode;
}) {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!requireAuth || !isHydrated || isAuthenticated) return;
    void router.push("/login");
  }, [isAuthenticated, isHydrated, requireAuth, router]);

  // TODO create a better loading state with a skeleton or with a logo spinner
  if (requireAuth && (!isHydrated || !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
        Carregando...
      </div>
    );
  }

  return <>{children}</>;
}
