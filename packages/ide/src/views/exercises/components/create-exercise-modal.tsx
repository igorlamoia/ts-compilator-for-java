import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeroButton } from "@/components/buttons/hero";
import { TestCaseFields } from "./test-case-fields";

const testCaseSchema = z.object({
  label: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
});

const createExerciseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  testCases: z.array(testCaseSchema),
});

type CreateExerciseForm = z.infer<typeof createExerciseSchema>;

const defaultTestCases = [
  { label: "", input: "", expectedOutput: "" },
  { label: "", input: "", expectedOutput: "" },
  { label: "", input: "", expectedOutput: "" },
];

export function CreateExerciseModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const form = useForm<CreateExerciseForm>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: { title: "", description: "", testCases: defaultTestCases },
  });

  const { fields } = useFieldArray({ control: form.control, name: "testCases" });

  useEffect(() => {
    if (!open) form.reset({ title: "", description: "", testCases: defaultTestCases });
  }, [open, form]);

  const onSubmit = async (values: CreateExerciseForm) => {
    try {
      await api.post(
        "/exercises",
        {
          title: values.title,
          description: values.description,
          testCases: values.testCases.filter(
            (tc) => tc.input.trim() || tc.expectedOutput.trim()
          ),
        },
      );
      showToast({ type: "success", message: "Exercício criado!" });
      form.reset();
      onOpenChange(false);
      onCreated();
    } catch {
      showToast({ type: "error", message: "Erro ao criar exercício." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Novo Exercício</DialogTitle>
          <DialogDescription className="text-slate-400">
            Defina o enunciado e casos de teste para validação automática.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-exercise-page-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex-1 overflow-y-auto max-h-[calc(90vh-180px)] p-6 font-sans"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Hello World em Java"
                      className="h-12 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição / Enunciado</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Descreva o exercício em detalhes..."
                      className="bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="test-cases">
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between pr-2">
                    <span>Casos de Teste</span>
                    <span className="text-xs text-slate-500">
                      {fields.length} casos
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <TestCaseFields fields={fields} control={form.control} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </form>
        </Form>
        <DialogFooter className="bg-white/5 border-t border-white/10">
          <HeroButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          >
            Cancelar
          </HeroButton>
          <HeroButton
            type="submit"
            form="create-exercise-page-form"
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
