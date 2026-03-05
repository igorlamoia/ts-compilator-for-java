import { SpaceBackground } from "@/components/space-background";
import { BorderBeam } from "@/components/ui/border-beam";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { GraduationCap, User } from "lucide-react";
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
import axios, { isAxiosError } from "axios";
import { Navbar } from "@/components/navbar";
import { RadioSelector } from "@/components/buttons/radio-selector";
import { Copyright } from "@/components/copyright";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["teacher", "student"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    setServerError("");

    try {
      const { data } = await axios.post("/auth/register", values);

      localStorage.setItem("lms_user_id", data.user.id);
      localStorage.setItem("lms_org_id", data.user.organizationId);

      router.push("/dashboard");
    } catch (error) {
      if (isAxiosError(error))
        return setServerError(
          error.response?.data?.error || "Erro de rede. Tente novamente.",
        );
      setServerError("Ocorreu um erro. Com os dados fornecidos.");
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col overflow-hidden">
      <SpaceBackground />

      <Navbar links={[{ label: "Entrar", href: "/login" }]} hasAuth={false} />

      {/* Main Content */}
      <main className="relative font-sans z-10 grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="relative dark:bg-[#182f34]/40 backdrop-blur-[3px] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
            <BorderBeam
              colorFrom="#0dccf2"
              colorTo="#34d399"
              duration={8}
              size={80}
            />

            <div className="mb-8 text-center mt-2">
              <Title>
                <GradientText>Crie sua Conta</GradientText>
              </Title>
              <p className="text-slate-400 text-sm mt-1">
                Entre para o futuro da educação em programação.
              </p>
            </div>

            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit(handleRegister)}
              >
                {serverError && (
                  <div className="text-red-400 text-sm text-center">
                    {serverError}
                  </div>
                )}

                {/* Role Selector */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex p-1 dark:bg-black/20 bg-slate-300/20 rounded-md border border-white/5">
                          <RadioSelector
                            options={[
                              {
                                value: "teacher",
                                label: "Professor",
                                Icon: GraduationCap,
                              },
                              { value: "student", label: "Aluno", Icon: User },
                            ]}
                            field={field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Input: Full Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                        Nome Completo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu nome completo"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Input: Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                        Endereço de E-mail
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="voce@exemplo.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Input: Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                        Senha
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Crie uma senha forte"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <HeroButton type="submit" className="w-full h-12 mt-2">
                  Cadastrar
                </HeroButton>
              </form>
            </Form>

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="relative w-full flex items-center">
                <div className="grow border-t border-white/10"></div>
                <span className="shrink-0 mx-4 text-slate-500 text-xs">
                  OU CONTINUE COM
                </span>
                <div className="grow border-t border-white/10"></div>
              </div>
              <SocialLogin />

              <p className="mt-4 text-center text-sm dark:text-slate-400 text-slate-500">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#0dccf2] hover:text-emerald-400 transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8">
            <Copyright />
          </p>
        </div>
      </main>
    </div>
  );
}

function SocialLogin() {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
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
