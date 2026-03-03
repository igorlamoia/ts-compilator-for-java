import { SpaceBackground } from "@/components/space-background";
import { BorderBeam } from "@/components/ui/border-beam";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { LogIn } from "lucide-react";
import { Title } from "@/components/text/title";
import { GradientText } from "@/components/text/gradient";
import { Subtitle } from "@/components/text/subtitle";
import { Input } from "@/components/ui/input";
import { HeroButton } from "@/components/buttons/hero";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Navbar } from "@/components/navbar";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Falha ao entrar");
        return;
      }

      localStorage.setItem("lms_user_id", data.user.id);
      localStorage.setItem("lms_org_id", data.user.organizationId);
      router.push("/dashboard");
    } catch {
      setServerError("Erro de conexão");
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 font-sans flex flex-col overflow-hidden">
      <SpaceBackground />

      <Navbar
        links={[{ label: "Cadastre-se", href: "/register" }]}
        hasAuth={false}
      />

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
            <Form {...form}>
              <form
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit(handleLogin)}
              >
                {serverError && (
                  <div className="text-red-400 text-sm text-center">
                    {serverError}
                  </div>
                )}

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel>Endereço de E-mail</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nome@empresa.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <div className="flex justify-between items-center ml-1">
                        <FormLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Senha
                        </FormLabel>
                        <Link
                          href="#"
                          className="text-xs text-[#0dccf2] hover:text-emerald-400 transition-colors"
                        >
                          Esqueceu a senha?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <HeroButton type="submit" className="py-3">
                  Entrar no Painel
                  <LogIn />
                </HeroButton>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="grow border-t border-white/10"></div>
              <span className="shrink-0 mx-4 text-xs text-slate-500 uppercase">
                Ou continue com
              </span>
              <div className="grow border-t border-white/10"></div>
            </div>

            {/* Social Login */}
            <SocialLogin />

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

function SocialLogin() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <HeroButton
        variant="outline"
        className="bg-white/5 border font-medium"
        type="button"
      >
        Google
      </HeroButton>
      <HeroButton
        variant="outline"
        className="bg-white/5 border font-medium"
        type="button"
      >
        GitHub
      </HeroButton>
    </div>
  );
}
