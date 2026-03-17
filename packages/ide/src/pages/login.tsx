import { SpaceBackground } from "@/components/space-background";
import { BorderBeam } from "@/components/ui/border-beam";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { Title } from "@/components/text/title";
import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useToast } from "@/contexts/ToastContext";
import { LoginForm, loginSchema, type LoginFormValues } from "@/components/auth/login-form";
import { SocialLogin } from "@/components/auth/social-login";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setServerError("");

    try {
      const { data } = await api.post<{ accessToken: string }>("/auth/login", values);
      login({ token: data.accessToken });
      router.push("/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(error, "Falha ao entrar");
      setServerError(message);
      showToast({ type: "error", message });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <SpaceBackground />

      <Navbar
        links={[{ label: "Cadastre-se", href: "/register" }]}
        hasAuth={false}
      />

      {/* Main Content */}
      <main className="grow flex items-center justify-center relative z-10 p-6 font-sans text-slate-500 dark:text-slate-400">
        {/* Login Card */}
        <div className="relative z-10 w-full max-w-120">
          <div className="relative dark:bg-[#182f34]/40 backdrop-blur-[3px] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
            <BorderBeam
              colorFrom="#0dccf2"
              colorTo="#34d399"
              duration={8}
              size={80}
            />
            {/* Header */}
            <div className="mb-10 text-center">
              <Title>
                <GradientText>Bem-vindo de Volta</GradientText>
              </Title>
              <Subtitle className="mt-1 text-sm">
                Insira suas credenciais para acessar o LMS
              </Subtitle>
            </div>

            <LoginForm
              form={form}
              onSubmit={handleLogin}
              serverError={serverError}
            />

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="grow border-t border-white/10"></div>
              <span className="shrink-0 mx-4 text-xs text-slate-500 uppercase">
                Ou continue com
              </span>
              <div className="grow border-t border-white/10"></div>
            </div>

            <SocialLogin />

            {/* Footer Link */}
            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-sm">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="text-[#0dccf2] hover:text-emerald-400 font-semibold transition-colors"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
