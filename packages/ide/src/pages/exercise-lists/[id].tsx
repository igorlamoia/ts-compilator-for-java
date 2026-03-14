import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SpaceBackground } from "@/components/space-background";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HeroButton } from "@/components/buttons/hero";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  GripVertical,
  Loader2,
  Plus,
  Send,
  Trash2,
  X,
  Circle,
} from "lucide-react";
import type { ExerciseListDTO, ExerciseListItemDTO } from "@/dtos/exercise-list.dto";
import type { ExerciseDTO } from "@/dtos/exercise.dto";

// ── types ────────────────────────────────────────────────────────────────────

type SubmissionRecord = {
  id: string;
  studentId: string;
  exerciseId: string;
  status: string;
  score: number | null;
  submittedAt: string;
  student?: { name: string; email: string };
  exercise?: { title: string };
};

type ClassOption = { id: string; name: string };

type ClassExerciseListEntry = {
  exerciseListId: string;
  classId: string;
  deadline: string;
  completedCount: number;
  totalCount: number;
  exerciseList: {
    items: { exerciseId: string; submitted: boolean; exercise: { id: string; title: string; status: string } }[];
  };
};

// ── helpers ──────────────────────────────────────────────────────────────────

function deadlineInfo(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: "Prazo encerrado", cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days === 0) return { text: "Hoje!", cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days <= 3) return { text: `Faltam ${days}d`, cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days <= 7) return { text: `Faltam ${days}d`, cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
  return { text: `Faltam ${days}d`, cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
}

// ── publish modal ────────────────────────────────────────────────────────────

const publishSchema = z.object({
  classId: z.string().min(1, "Selecione uma turma"),
  totalGrade: z.string().min(1, "Nota total é obrigatória"),
  minRequired: z.string().min(1, "Mínimo obrigatório"),
});
type PublishForm = z.infer<typeof publishSchema>;

function PublishModal({
  open,
  onOpenChange,
  listId,
  userId,
  classes,
  onPublished,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string;
  userId: string;
  classes: ClassOption[];
  onPublished: () => void;
}) {
  const { showToast } = useToast();
  const form = useForm<PublishForm>({
    resolver: zodResolver(publishSchema),
    defaultValues: { classId: "", totalGrade: "10", minRequired: "1" },
  });

  const onSubmit = async (values: PublishForm) => {
    try {
      await api.post(
        `/exercise-lists/${listId}/publish`,
        {
          classId: values.classId,
          totalGrade: Number(values.totalGrade),
          minRequired: Number(values.minRequired),
        },
        { headers: { "x-user-id": userId } },
      );
      showToast({ type: "success", message: "Lista publicada com sucesso!" });
      form.reset();
      onOpenChange(false);
      onPublished();
    } catch {
      showToast({ type: "error", message: "Erro ao publicar lista." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Publicar Lista</DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure prazo e requisitos antes de publicar para a turma.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="publish-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-1"
          >
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turma</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-11 bg-black/30 border border-white/10 rounded-md px-3 text-sm text-slate-100 focus:outline-none focus:border-[#0dccf2]/50"
                    >
                      <option value="" className="bg-[#101f22]">Selecione...</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#101f22]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota total</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="0.5"
                        {...field}
                        className="h-11 bg-black/30 border-white/10 text-slate-100 focus:border-[#0dccf2]/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mínimo obrigatório</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        className="h-11 bg-black/30 border-white/10 text-slate-100 focus:border-[#0dccf2]/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
          <HeroButton type="submit" form="publish-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Publicando..." : "Publicar"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── add exercise modal ────────────────────────────────────────────────────────

function AddExerciseModal({
  open,
  onOpenChange,
  listId,
  userId,
  existingIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string;
  userId: string;
  existingIds: Set<string>;
  onAdded: () => void;
}) {
  const { showToast } = useToast();
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .get<ExerciseDTO[]>("/exercises", { headers: { "x-user-id": userId } })
      .then(({ data }) => setExercises(data))
      .catch(() => showToast({ type: "error", message: "Erro ao carregar exercícios." }))
      .finally(() => setLoading(false));
  }, [open, userId, showToast]);

  const handleAdd = async (exerciseId: string) => {
    setAdding(exerciseId);
    try {
      await api.post(
        `/exercise-lists/${listId}/exercises`,
        { exerciseId, gradeWeight: 1 },
        { headers: { "x-user-id": userId } },
      );
      showToast({ type: "success", message: "Exercício adicionado!" });
      onAdded();
    } catch {
      showToast({ type: "error", message: "Erro ao adicionar exercício." });
    } finally {
      setAdding(null);
    }
  };

  const available = exercises.filter((e) => !existingIds.has(e.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Exercício</DialogTitle>
          <DialogDescription className="text-slate-400">
            Selecione um exercício para adicionar a esta lista.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto space-y-2 py-2 px-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#0dccf2]" />
            </div>
          ) : available.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-8">
              {exercises.length === 0
                ? "Você não possui exercícios criados."
                : "Todos os seus exercícios já estão nesta lista."}
            </p>
          ) : (
            available.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-[#0dccf2]/25 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">{ex.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ex.testCases.length} caso{ex.testCases.length !== 1 ? "s" : ""} de teste
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(ex.id)}
                  disabled={adding === ex.id}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors disabled:opacity-50"
                >
                  {adding === ex.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Adicionar"}
                </button>
              </div>
            ))
          )}
        </div>
        <DialogFooter className="bg-white/5 border-t border-white/10">
          <HeroButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-white/5 text-slate-300"
          >
            Fechar
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── teacher detail view ───────────────────────────────────────────────────────

function TeacherDetailView({
  list,
  userId,
  classes,
  onRefresh,
}: {
  list: ExerciseListDTO;
  userId: string;
  classes: ClassOption[];
  onRefresh: () => void;
}) {
  const { showToast } = useToast();
  const [showPublish, setShowPublish] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const existingIds = new Set(list.items.map((i) => i.exerciseId));

  const loadSubmissions = useCallback(async () => {
    if (list.items.length === 0) return;
    setLoadingSubmissions(true);
    try {
      const results = await Promise.all(
        list.items.map((item) =>
          api
            .get<SubmissionRecord[]>(`/submissions?exerciseId=${item.exerciseId}`, {
              headers: { "x-user-id": userId },
            })
            .then(({ data }) => data),
        ),
      );
      setSubmissions(results.flat());
    } catch {
      showToast({ type: "error", message: "Erro ao carregar submissões." });
    } finally {
      setLoadingSubmissions(false);
    }
  }, [list.items, userId, showToast]);

  const handleToggleSubmissions = () => {
    if (!showSubmissions && submissions.length === 0) {
      loadSubmissions();
    }
    setShowSubmissions((v) => !v);
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    try {
      await api.delete(`/exercise-lists/${list.id}/exercises?exerciseId=${exerciseId}`, {
        headers: { "x-user-id": userId },
      });
      showToast({ type: "success", message: "Exercício removido." });
      onRefresh();
    } catch {
      showToast({ type: "error", message: "Erro ao remover exercício." });
    } finally {
      setRemoveTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* header card */}
      <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{list.title}</h1>
            {list.description && (
              <p className="text-slate-400 text-sm mt-1">{list.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <HeroButton
              onClick={() => setShowPublish(true)}
              className="gap-2 px-4 py-2 text-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Publicar
            </HeroButton>
          </div>
        </div>
      </div>

      {/* exercises panel */}
      <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0dccf2]" />
            <h2 className="font-semibold text-slate-200">
              Exercícios nesta lista
            </h2>
            <span className="text-xs text-slate-500 ml-1">
              ({list.items.length})
            </span>
          </div>
          <HeroButton
            variant="outline"
            onClick={() => setShowAddExercise(true)}
            className="gap-1.5 px-3 py-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </HeroButton>
        </div>

        {list.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <BookOpen className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-sm">Nenhum exercício adicionado ainda.</p>
            <button
              onClick={() => setShowAddExercise(true)}
              className="mt-3 text-xs text-[#0dccf2] hover:underline"
            >
              Adicionar exercício
            </button>
          </div>
        ) : (
          <ul>
            {list.items
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((item, idx) => (
                <ExerciseRow
                  key={item.exerciseId}
                  item={item}
                  index={idx}
                  onRemove={() => setRemoveTarget(item.exerciseId)}
                />
              ))}
          </ul>
        )}

        <div className="px-6 py-3 border-t border-white/5">
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 text-slate-500 text-sm hover:border-[#0dccf2]/30 hover:text-[#0dccf2] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Exercício
          </button>
        </div>
      </div>

      {/* submissions panel */}
      <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
        <button
          onClick={handleToggleSubmissions}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-200">Submissões</h2>
            {submissions.length > 0 && (
              <span className="text-xs text-slate-500">({submissions.length})</span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${showSubmissions ? "rotate-180" : ""}`}
          />
        </button>

        {showSubmissions && (
          <div className="border-t border-white/8">
            {loadingSubmissions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[#0dccf2]" />
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">
                Nenhuma submissão ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-white/5">
                      <th className="px-6 py-3 text-left">Aluno</th>
                      <th className="px-6 py-3 text-left">Exercício</th>
                      <th className="px-6 py-3 text-left">Enviado</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <SubmissionRow key={sub.id} submission={sub} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* modals */}
      <PublishModal
        open={showPublish}
        onOpenChange={setShowPublish}
        listId={list.id}
        userId={userId}
        classes={classes}
        onPublished={onRefresh}
      />
      <AddExerciseModal
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        listId={list.id}
        userId={userId}
        existingIds={existingIds}
        onAdded={onRefresh}
      />
      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover exercício?</AlertDialogTitle>
            <AlertDialogDescription>
              Este exercício será removido da lista. As submissões existentes não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeTarget && handleRemoveExercise(removeTarget)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ExerciseRow({
  item,
  index,
  onRemove,
}: {
  item: ExerciseListItemDTO;
  index: number;
  onRemove: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 px-6 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
      <GripVertical className="w-4 h-4 text-white/20 group-hover:text-slate-500 transition-colors shrink-0 cursor-grab" />
      <span className="text-xs font-mono text-slate-500 w-6 text-right shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="flex-1 text-sm text-slate-200 truncate">
        {item.exercise.title}
      </span>
      <button
        onClick={onRemove}
        className="shrink-0 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}

function SubmissionRow({ submission }: { submission: SubmissionRecord }) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Pendente", cls: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
    SUBMITTED: { label: "Submetido", cls: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
    GRADED: { label: "Avaliado", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
    LATE: { label: "Atrasado", cls: "bg-red-500/15 text-red-300 border-red-500/25" },
  };
  const s = statusMap[submission.status] ?? statusMap.PENDING;

  return (
    <tr className="border-b border-white/5 hover:bg-white/2 transition-colors">
      <td className="px-6 py-3.5 text-slate-300 font-medium">
        {submission.student?.name ?? submission.studentId.slice(0, 8)}
      </td>
      <td className="px-6 py-3.5 text-slate-400 text-sm">
        {submission.exercise?.title ?? submission.exerciseId.slice(0, 8)}
      </td>
      <td className="px-6 py-3.5 text-slate-500 text-xs">
        {new Date(submission.submittedAt).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-6 py-3.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
          {s.label}
        </span>
      </td>
      <td className="px-6 py-3.5 text-slate-300 font-mono text-sm">
        {submission.score != null ? submission.score : "—"}
      </td>
    </tr>
  );
}

// ── student detail view ───────────────────────────────────────────────────────

function StudentDetailView({
  list,
  classId,
  userId,
}: {
  list: ExerciseListDTO;
  classId: string;
  userId: string;
}) {
  const { showToast } = useToast();
  const [classEntry, setClassEntry] = useState<ClassExerciseListEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    api
      .get<ClassExerciseListEntry[]>(`/classes/${classId}/exercise-lists`, {
        headers: { "x-user-id": userId },
      })
      .then(({ data }) => {
        const entry = data.find((e) => e.exerciseListId === list.id) ?? null;
        setClassEntry(entry);
      })
      .catch(() => showToast({ type: "error", message: "Erro ao carregar progresso." }))
      .finally(() => setLoading(false));
  }, [classId, list.id, userId, showToast]);

  const submittedIds = new Set(
    classEntry?.exerciseList.items.filter((i) => i.submitted).map((i) => i.exerciseId) ?? [],
  );

  const publication = list.classes.find((c) => c.classId === classId);
  const totalCount = list.items.length;
  const completedCount = submittedIds.size;
  const minRequired = publication?.minRequired ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* header card */}
      <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{list.title}</h1>
            {list.description && (
              <p className="text-slate-400 text-sm mt-1">{list.description}</p>
            )}
          </div>

          {publication && (
            <div className="shrink-0 flex flex-col items-end gap-2">
              {(() => {
                const dl = deadlineInfo(String(publication.deadline));
                return (
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${dl.cls}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {dl.text}
                  </span>
                );
              })()}
              <span className="text-xs text-slate-500">
                Mínimo: {minRequired} exercício{minRequired !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* progress */}
        {!loading && (
          <div className="mt-5 pt-5 border-t border-white/8">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>
                {completedCount} de {totalCount} exercícios concluídos
              </span>
              <span className="font-semibold text-slate-200">{progress}%</span>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {completedCount >= minRequired && minRequired > 0 && (
              <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Requisito mínimo atingido!
              </p>
            )}
          </div>
        )}
      </div>

      {/* exercises list */}
      <div className="bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/8">
          <BookOpen className="w-4 h-4 text-[#0dccf2]" />
          <h2 className="font-semibold text-slate-200">Exercícios</h2>
        </div>
        {list.items.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-12">
            Nenhum exercício nesta lista.
          </p>
        ) : (
          <ul>
            {list.items
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((item, idx) => {
                const done = submittedIds.has(item.exerciseId);
                return (
                  <li
                    key={item.exerciseId}
                    className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <span className="w-5 shrink-0">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" />
                      )}
                    </span>
                    <span className="text-xs font-mono text-slate-500 w-6 text-right shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm text-slate-200">
                      {item.exercise.title}
                    </span>
                    <Link
                      href={`/exercises/${item.exerciseId}?listId=${list.id}&classId=${classId}`}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors"
                    >
                      {done ? "Ver solução" : "Resolver"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ExerciseListDetailPage() {
  const router = useRouter();
  const { id, classId } = router.query as { id?: string; classId?: string };
  const { userId, user, organizationId } = useAuth();
  const { showToast } = useToast();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [list, setList] = useState<ExerciseListDTO | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    if (!userId || !id) return;
    try {
      const [listRes, classesRes] = await Promise.all([
        api.get<ExerciseListDTO>(`/exercise-lists/${id}`, {
          headers: { "x-user-id": userId },
        }),
        isTeacher
          ? api.get<ClassOption[]>("/classes", {
              headers: {
                "x-user-id": userId,
                "x-org-id": organizationId ?? "",
              },
            })
          : Promise.resolve({ data: [] }),
      ]);
      setList(listRes.data);
      setClasses(classesRes.data);
    } catch {
      showToast({ type: "error", message: "Lista não encontrada." });
      router.push("/exercise-lists");
    } finally {
      setLoading(false);
    }
  }, [userId, id, isTeacher, organizationId, showToast, router]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  if (loading || !userId) {
    return (
      <div className="min-h-screen bg-[#101f22] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0dccf2]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      <SpaceBackground />
      <Navbar
        links={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Listas", href: "/exercise-lists" },
        ]}
      />
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/exercise-lists" className="hover:text-slate-300 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Listas
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
          <span className="text-slate-300 font-medium">{list?.title ?? "..."}</span>
        </nav>

        {list &&
          (isTeacher ? (
            <TeacherDetailView
              list={list}
              userId={userId}
              classes={classes}
              onRefresh={fetchList}
            />
          ) : (
            <StudentDetailView
              list={list}
              classId={classId ?? ""}
              userId={userId}
            />
          ))}
      </main>
    </div>
  );
}

ExerciseListDetailPage.requireAuth = true;
