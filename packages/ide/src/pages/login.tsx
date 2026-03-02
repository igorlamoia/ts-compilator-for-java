import { SpaceBackground } from "@/components/space-background";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { CodeXml, LogIn } from "lucide-react";
import { Title } from "@/components/text/title";
import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { Input } from "@/components/ui/input";
import { HeroButton } from "@/components/buttons/hero";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Falha ao entrar");
        return;
      }

      localStorage.setItem("lms_user_id", data.user.id);
      localStorage.setItem("lms_org_id", data.user.organizationId);
      router.push("/dashboard");
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 font-sans flex flex-col overflow-hidden">
      <SpaceBackground />

      {/* Navbar */}
      <header className="w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0dccf2] to-emerald-400 flex items-center justify-center text-[#101f22]">
              <CodeXml className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Java<span className="text-[#0dccf2]">--</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow flex items-center justify-center relative z-10 p-6">
        {/* Login Card */}
        <div className="relative z-10 w-full max-w-120">
          <div className="relative bg-[#182f34]/40 backdrop-blur-[3px] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
            <BorderBeam
              colorFrom="var(--color-primary)"
              colorTo="var(--color-secondary)"
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

            {/* Form */}
            <form className="flex flex-col gap-6" onSubmit={handleLogin}>
              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}

              {/* Email Field */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                  Endereço de E-mail
                </label>
                <Input
                  className="p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-0.5 focus:ring-[#0dccf2] focus:border-[#0dccf2] transition-all sm:text-sm"
                  placeholder="nome@empresa.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Senha
                  </label>
                  <Link
                    href="#"
                    className="text-xs text-[#0dccf2] hover:text-emerald-400 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  className="p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-0.5 focus:ring-[#0dccf2] focus:border-[#0dccf2] transition-all sm:text-sm"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <HeroButton type="submit">
                Entrar no Painel
                <LogIn />
              </HeroButton>
            </form>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="grow border-t border-white/10"></div>
              <span className="shrink-0 mx-4 text-xs text-slate-500 uppercase">
                Ou continue com
              </span>
              <div className="grow border-t border-white/10"></div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center gap-2 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0dccf2]/30 rounded-xl transition-all text-slate-300 hover:text-white text-sm font-medium"
                type="button"
              >
                Google
              </button>
              <button
                className="flex items-center justify-center gap-2 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0dccf2]/30 rounded-xl transition-all text-slate-300 hover:text-white text-sm font-medium"
                type="button"
              >
                GitHub
              </button>
            </div>

            {/* Footer Link */}
            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-slate-400 text-sm">
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
