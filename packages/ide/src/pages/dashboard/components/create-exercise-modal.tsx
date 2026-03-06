"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TestCase {
  label: string;
  input: string;
  expectedOutput: string;
}

const testCaseSchema = z.object({
  label: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
});

const createExerciseSchema = z.object({
  exTitle: z.string().min(1, "Título é obrigatório"),
  exDesc: z.string().min(1, "Descrição é obrigatória"),
  exDeadline: z.string().min(1, "Prazo é obrigatório"),
  exWeight: z.string().min(1, "Peso é obrigatório"),
  testCases: z.array(testCaseSchema),
});

type CreateExerciseFormValues = z.infer<typeof createExerciseSchema>;

const defaultTestCases: TestCase[] = [
  { label: "", input: "", expectedOutput: "" },
  { label: "", input: "", expectedOutput: "" },
  { label: "", input: "", expectedOutput: "" },
];

interface CreateExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
  userId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CreateExerciseModal({
  open,
  onOpenChange,
  classId,
  userId,
  onSuccess,
  onError,
}: CreateExerciseModalProps) {
  const form = useForm<CreateExerciseFormValues>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      exTitle: "",
      exDesc: "",
      exDeadline: "",
      exWeight: "1",
      testCases: defaultTestCases,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async (values: CreateExerciseFormValues) => {
    form.clearErrors();

    try {
      await api.post(
        "/exercises",
        {
          classId,
          title: values.exTitle,
          description: values.exDesc,
          deadline: values.exDeadline,
          gradeWeight: values.exWeight,
          testCases: values.testCases.filter(
            (tc) => tc.input.trim() || tc.expectedOutput.trim(),
          ),
        },
        {
          headers: {
            "x-user-id": userId,
          },
        },
      );

      onSuccess?.("Exercício criado com sucesso!");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      const message =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : "Erro ao criar exercício";
      onError?.(message);
    }
  };

  const resetForm = () => {
    form.reset({
      exTitle: "",
      exDesc: "",
      exDeadline: "",
      exWeight: "1",
      testCases: defaultTestCases,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Criar Exercício</DialogTitle>
          <DialogDescription className="text-slate-400">
            Defina os detalhes e casos de teste para o exercício
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-exercise-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 flex-1 overflow-y-auto max-h-[calc(90vh-180px)] p-6 font-sans"
          >
            <FormField
              control={form.control}
              name="exTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Hello World em Java--"
                      className="h-12 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição / Instruções</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Descreva o exercício em detalhes..."
                      className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo de Entrega</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="h-12 bg-black/30 border-white/10 text-slate-100 focus:border-[#0dccf2]/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso da Nota</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        {...field}
                        className="h-12 bg-black/30 border-white/10 text-slate-100 focus:border-[#0dccf2]/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="test-cases">
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between pr-2">
                    <span>Casos de Teste (Opcional)</span>
                    <span className="text-xs text-slate-500">
                      Expandir para configurar
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                      Defina pares de entrada/saída esperada para validação
                      automática do código do aluno.
                    </p>

                    {fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-2"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#0dccf2]">
                            #{idx + 1}
                          </span>

                          <FormField
                            control={form.control}
                            name={`testCases.${idx}.label`}
                            render={({ field: caseField }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    {...caseField}
                                    placeholder="Nome do caso (opcional)"
                                    className="h-9 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 text-xs focus:border-[#0dccf2]/50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`testCases.${idx}.input`}
                            render={({ field: caseField }) => (
                              <FormItem>
                                <FormLabel className="text-xs normal-case tracking-normal text-slate-500">
                                  Entrada (stdin)
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...caseField}
                                    rows={3}
                                    placeholder="Uma linha por entrada..."
                                    className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 text-xs font-mono focus:border-[#0dccf2]/50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`testCases.${idx}.expectedOutput`}
                            render={({ field: caseField }) => (
                              <FormItem>
                                <FormLabel className="text-xs normal-case tracking-normal text-slate-500">
                                  Saída esperada (stdout)
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...caseField}
                                    rows={3}
                                    placeholder="Saída esperada..."
                                    className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 text-xs font-mono focus:border-[#0dccf2]/50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
            form="create-exercise-form"
            disabled={form.formState.isSubmitting}
            className="bg-linear-to-r from-[#0dccf2] to-[#10b981] text-slate-800 hover:opacity-90"
          >
            {form.formState.isSubmitting ? "Criando..." : "Criar Exercício"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
