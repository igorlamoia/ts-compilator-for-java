"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import axios from "axios";
import { HeroButton } from "@/components/buttons/hero";

const joinClassSchema = z.object({
  joinCode: z
    .string()
    .min(1, "Código de acesso é obrigatório")
    .max(6, "Código deve ter no máximo 6 caracteres"),
});

type JoinClassFormValues = z.infer<typeof joinClassSchema>;

interface JoinClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function JoinClassModal({
  open,
  onOpenChange,
  userId,
  onSuccess,
  onError,
}: JoinClassModalProps) {
  const form = useForm<JoinClassFormValues>({
    resolver: zodResolver(joinClassSchema),
    defaultValues: {
      joinCode: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (values: JoinClassFormValues) => {
    form.clearErrors();

    try {
      await api.post(
        "/classes/join",
        { accessCode: values.joinCode.toUpperCase() },
        {
          headers: { "x-user-id": userId },
        },
      );

      onSuccess?.("Você entrou na turma!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const message =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : "Código inválido";
      onError?.(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#182f34] border-white/10 text-white">
        <DialogHeader className="flex flex-col">
          <DialogTitle>Entrar em Turma</DialogTitle>
          <DialogDescription className="text-slate-400">
            Digite o código de acesso fornecido por seu professor
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="join-class-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 px-6"
          >
            <FormField
              control={form.control}
              name="joinCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Acesso</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                      maxLength={6}
                      placeholder="EX: A3F9K2"
                      className="h-12 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50 font-mono text-center text-base tracking-widest uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="bg-white/5 border-t border-white/10">
          <HeroButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          >
            Cancelar
          </HeroButton>
          <HeroButton
            type="submit"
            form="join-class-form"
            disabled={form.formState.isSubmitting}
            className="bg-linear-to-r from-[#0dccf2] to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
