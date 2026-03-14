import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { HeroButton } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { Subtitle } from "@/components/text/subtitle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Code2,
  FlaskConical,
  Plus,
  Search,
  Calendar,
  Trash2,
  Eye,
  Pencil,
} from "lucide-react";
import type { ExerciseDTO } from "@/dtos/exercise.dto";

// ── create exercise schema ──────────────────────────────────────────────
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

// ── create exercise modal ───────────────────────────────────────────────
function CreateExerciseModal({
  open,
  onOpenChange,
  userId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
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
  }, [open]);

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
        { headers: { "x-user-id": userId } }
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
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                      Pares de entrada/saída para validação automática do código do aluno.
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

// ── exercise detail modal ────────────────────────────────────────────────
function ExerciseDetailModal({
  open,
  onOpenChange,
  exercise,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exercise: ExerciseDTO | null;
}) {
  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{exercise.title}</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Criado em{" "}
            {new Date(exercise.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] space-y-6 p-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Enunciado
            </h4>
            <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {exercise.description}
            </div>
          </div>

          {/* Test Cases */}
          {exercise.testCases.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Casos de Teste ({exercise.testCases.length})
              </h4>
              <div className="space-y-3">
                {exercise.testCases.map((tc, idx) => (
                  <div
                    key={tc.id}
                    className="p-3 bg-black/20 rounded-lg border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-[#0dccf2]">
                        #{idx + 1}
                      </span>
                      {tc.label && (
                        <span className="text-xs text-slate-400">{tc.label}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Entrada
                        </p>
                        <pre className="text-xs font-mono text-emerald-300 bg-black/30 p-2 rounded border border-white/5 whitespace-pre-wrap">
                          {tc.input || "(vazio)"}
                        </pre>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Saída Esperada
                        </p>
                        <pre className="text-xs font-mono text-cyan-300 bg-black/30 p-2 rounded border border-white/5 whitespace-pre-wrap">
                          {tc.expectedOutput || "(vazio)"}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-white/5 border-t border-white/10">
          <HeroButton
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            variant="outline"
          >
            Fechar
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── exercise card ────────────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  onView,
  onDelete,
}: {
  exercise: ExerciseDTO;
  onView: () => void;
  onDelete: () => void;
}) {
  const createdDate = new Date(exercise.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="group relative bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/35 hover:shadow-[0_4px_24px_rgba(13,204,242,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
      {/* top accent on hover */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#0dccf2]/10 border border-[#0dccf2]/20 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-[#0dccf2]" />
          </div>
          <h3 className="font-bold text-slate-100 leading-snug line-clamp-2 text-[15px]">
            {exercise.title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
        {exercise.description}
      </p>

      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-emerald-400/60" />
          {exercise.testCases.length} caso{exercise.testCases.length !== 1 ? "s" : ""} de
          teste
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500/60" />
          {createdDate}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          Visualizar
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── delete confirmation ─────────────────────────────────────────────────
function DeleteConfirmModal({
  open,
  onOpenChange,
  exerciseTitle,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exerciseTitle: string;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Excluir Exercício</DialogTitle>
          <DialogDescription className="text-slate-400">
            Tem certeza que deseja excluir{" "}
            <span className="font-semibold text-slate-200">
              &ldquo;{exerciseTitle}&rdquo;
            </span>
            ? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-white/5 border-t border-white/10">
          <HeroButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          >
            Cancelar
          </HeroButton>
          <HeroButton
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rose-600 text-white hover:bg-rose-700 border-rose-600"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── shared ui ────────────────────────────────────────────────────────────
function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl">
      <div className="w-20 h-20 mb-5 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10">
        <Code2 className="w-10 h-10 text-slate-600" />
      </div>
      <p className="text-slate-200 text-lg font-bold">
        Nenhum exercício encontrado
      </p>
      <p className="text-slate-500 text-sm mt-2 max-w-xs text-center leading-relaxed">
        Crie seu primeiro exercício para utilizar nas listas das suas turmas.
      </p>
    </div>
  );
}

// ── stats bar ────────────────────────────────────────────────────────────
function StatsBar({ exercises }: { exercises: ExerciseDTO[] }) {
  const totalTests = exercises.reduce((s, e) => s + e.testCases.length, 0);

  const stats = [
    {
      label: "Total de Exercícios",
      value: exercises.length,
      color: "text-[#0dccf2]",
      bgColor: "bg-[#0dccf2]/10 border-[#0dccf2]/20",
    },
    {
      label: "Casos de Teste",
      value: totalTests,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl ${stat.bgColor}`}
        >
          <span className={`text-3xl font-black tabular-nums ${stat.color}`}>
            {stat.value}
          </span>
          <span className="text-xs text-slate-400 font-medium leading-tight">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────
export default function ExercisesPage() {
  const { userId, user } = useAuth();
  const { showToast } = useToast();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewExercise, setViewExercise] = useState<ExerciseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExerciseDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExercises = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await api.get<ExerciseDTO[]>("/exercises", {
        headers: { "x-user-id": userId },
      });
      setExercises(data);
    } catch {
      showToast({ type: "error", message: "Erro ao carregar exercícios." });
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleDelete = async () => {
    if (!deleteTarget || !userId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/exercises/${deleteTarget.id}`, {
        headers: { "x-user-id": userId },
      });
      showToast({ type: "success", message: "Exercício excluído." });
      setDeleteTarget(null);
      fetchExercises();
    } catch {
      showToast({ type: "error", message: "Erro ao excluir exercício." });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = exercises.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  );

  if (!userId) return null;

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-[#0A0A0F]">
      <SpaceBackground />
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <main className="max-w-7xl mx-auto px-6 py-12 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <Title>
                  <GradientText>Meus Exercícios</GradientText>
                </Title>
                <Subtitle className="mt-1">
                  Crie e gerencie exercícios para usar nas suas listas
                </Subtitle>
              </div>
              {isTeacher && (
                <HeroButton
                  onClick={() => setShowCreate(true)}
                  className="gap-2 px-5 py-2.5 shrink-0 group"
                >
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                  Novo Exercício
                </HeroButton>
              )}
            </div>

            {/* Stats */}
            {!loading && exercises.length > 0 && (
              <StatsBar exercises={exercises} />
            )}

            {/* Search */}
            {!loading && exercises.length > 0 && (
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar exercícios..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#0dccf2]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <LoadingSpinner label="Carregando exercícios..." />
            ) : filtered.length === 0 && search ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                <Search className="w-8 h-8 text-slate-600" />
                <p className="text-sm font-medium">
                  Nenhum resultado para &ldquo;{search}&rdquo;
                </p>
              </div>
            ) : exercises.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onView={() => setViewExercise(exercise)}
                    onDelete={() => setDeleteTarget(exercise)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <CreateExerciseModal
        open={showCreate}
        onOpenChange={setShowCreate}
        userId={userId}
        onCreated={fetchExercises}
      />

      <ExerciseDetailModal
        open={!!viewExercise}
        onOpenChange={(v) => !v && setViewExercise(null)}
        exercise={viewExercise}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        exerciseTitle={deleteTarget?.title ?? ""}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

ExercisesPage.requireAuth = true;
