import { GraduationCap, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HeroButton } from "@/components/buttons/hero";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioSelector } from "@/components/buttons/radio-selector";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["teacher", "student"]),
  organizationId: z.string().min(1, "Selecione uma instituição"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

type Organization = { id: string; name: string };

export function RegisterForm({
  form,
  onSubmit,
  serverError,
  organizations,
  loadingOrgs,
}: {
  form: UseFormReturn<RegisterFormValues>;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  serverError: string;
  organizations: Organization[];
  loadingOrgs: boolean;
}) {
  return (
    <Form {...form}>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(onSubmit)}
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

        {/* Select: Institution */}
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                Instituição
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={loadingOrgs}
                  className="w-full h-10 px-3 rounded-md border border-white/10 dark:bg-black/20 bg-slate-300/20 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50 disabled:opacity-50"
                >
                  <option value="" disabled className="bg-slate-900">
                    {loadingOrgs ? "Carregando..." : "Selecione sua instituição"}
                  </option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-slate-900">
                      {org.name}
                    </option>
                  ))}
                </select>
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
  );
}
