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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import axios from "axios";
import { HeroButton } from "@/components/buttons/hero";

const createClassSchema = z.object({
  className: z.string().min(1, "Nome da turma é obrigatório"),
  classDesc: z.string().min(1, "Descrição é obrigatória"),
});

type CreateClassFormValues = z.infer<typeof createClassSchema>;

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  orgId: string;
  onSuccess?: (message: string, accessCode: string) => void;
  onError?: (message: string) => void;
}

export function CreateClassModal({
  open,
  onOpenChange,
  userId,
  orgId,
  onSuccess,
  onError,
}: CreateClassModalProps) {
  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      className: "",
      classDesc: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (values: CreateClassFormValues) => {
    form.clearErrors();

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await api.post(
        "/classes",
        {
          name: values.className,
          description: values.classDesc,
          accessCode,
        },
        {
          headers: {
            "x-user-id": userId,
            "x-org-id": orgId || "",
          },
        },
      );

      onSuccess?.(`Turma criada! Código de acesso: ${accessCode}`, accessCode);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const message =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : "Erro ao criar turma";
      onError?.(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha os dados da sua turma
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-class-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 flex-1 overflow-y-auto max-h-[60vh] p-6 font-sans"
          >
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Turma</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Programação para Iniciantes"
                      className="h-12 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Descreva a turma..."
                      className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
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
            form="create-class-form"
            disabled={form.formState.isSubmitting}
            className="bg-linear-to-r from-[#0dccf2] to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {form.formState.isSubmitting ? "Criando..." : "Criar Turma"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
