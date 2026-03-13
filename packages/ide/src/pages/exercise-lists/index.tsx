import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SpaceBackground } from "@/components/space-background";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  ChevronRight,
  Clock,
  ListChecks,
  Plus,
  Send,
  Users,
} from "lucide-react";
import type { ExerciseListDTO } from "@/dtos/exercise-list.dto";

// ── types ──────────────────────────────────────────────────────────────────

type ClassOption = { id: string; name: string };

type ClassExerciseListEntry = {
  exerciseListId: string;
  classId: string;
  deadline: string;
  totalGrade: number;
  minRequired: number;
  exerciseList: {
    id: string;
    title: string;
    description: string;
    items: {
      exerciseId: string;
      exercise: { id: string; title: string };
      submitted: boolean;
    }[];
  };
  completedCount: number;
  totalCount: number;
};

// ── helpers ─────────────────────────────────────────────────────────────────

function deadlineInfo(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: "Prazo encerrado", cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days === 0) return { text: "Hoje!", cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days <= 3) return { text: `Faltam ${days}d`, cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (days <= 7) return { text: `Faltam ${days}d`, cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
  return { text: `Faltam ${days}d`, cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
}

function listProgress(completed: number, total: number) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function studentListStatus(entry: ClassExerciseListEntry) {
  const overdue = new Date(entry.deadline) < new Date();
  if (entry.completedCount >= entry.minRequired)
    return { text: "Concluída", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" };
  if (overdue)
    return { text: "Atrasada", cls: "bg-red-500/15 text-red-300 border-red-500/25" };
  if (entry.completedCount > 0)
    return { text: "Em andamento", cls: "bg-blue-500/15 text-blue-300 border-blue-500/25" };
  return { text: "Não iniciada", cls: "bg-slate-500/15 text-slate-400 border-slate-500/25" };
}

// ── create list modal ────────────────────────────────────────────────────────

const createListSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
});
type CreateListForm = z.infer<typeof createListSchema>;

function CreateListModal({
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
  const form = useForm<CreateListForm>({
    resolver: zodResolver(createListSchema),
    defaultValues: { title: "", description: "" },
  });

  const onSubmit = async (values: CreateListForm) => {
    try {
      await api.post(
        "/exercise-lists",
        { title: values.title, description: values.description },
        { headers: { "x-user-id": userId } },
      );
      showToast({ type: "success", message: "Lista criada com sucesso!" });
      form.reset();
      onOpenChange(false);
      onCreated();
    } catch {
      showToast({ type: "error", message: "Erro ao criar lista." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-3xl">
        <DialogHeader>
          <DialogTitle>Nova Lista de Exercícios</DialogTitle>
          <DialogDescription className="text-slate-400">
            Crie uma lista para organizar seus exercícios e publicar para turmas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-list-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-1"
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
                      placeholder="Ex: Algoritmos de Ordenação"
                      className="h-11 bg-black/30 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-[#0dccf2]/50"
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
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Descreva o objetivo desta lista..."
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
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          >
            Cancelar
          </HeroButton>
          <HeroButton
            type="submit"
            form="create-list-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Criando..." : "Criar Lista"}
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── teacher view ─────────────────────────────────────────────────────────────

type TeacherFilter = "all" | "DRAFT" | "PUBLISHED";

function TeacherView({
  userId,
  classes,
}: {
  userId: string;
  classes: ClassOption[];
}) {
  const { showToast } = useToast();
  const [lists, setLists] = useState<ExerciseListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TeacherFilter>("all");
  const [showCreate, setShowCreate] = useState(false);

  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));

  const fetchLists = useCallback(async () => {
    try {
      const { data } = await api.get<ExerciseListDTO[]>("/exercise-lists", {
        headers: { "x-user-id": userId },
      });
      setLists(data);
    } catch {
      showToast({ type: "error", message: "Erro ao carregar listas." });
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const filtered =
    filter === "all" ? lists : lists.filter((l) => l.status === filter);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Title>
            <GradientText>Minhas Listas</GradientText>
          </Title>
          <Subtitle className="mt-1">
            Organize exercícios em listas e publique para suas turmas
          </Subtitle>
        </div>
        <HeroButton
          onClick={() => setShowCreate(true)}
          className="gap-2 px-5 py-2.5 shrink-0"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Nova Lista
        </HeroButton>
      </div>

      {/* filter chips */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { key: "all", label: "Todas" },
            { key: "DRAFT", label: "Rascunho" },
            { key: "PUBLISHED", label: "Publicadas" },
          ] as { key: TeacherFilter; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === key
                ? "bg-[#0dccf2]/15 border-[#0dccf2]/40 text-[#0dccf2]"
                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Carregando listas..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-10 h-10 text-slate-600" />}
          title="Nenhuma lista encontrada"
          description={
            filter !== "all"
              ? "Nenhuma lista com esse filtro."
              : "Crie sua primeira lista de exercícios para começar."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((list) => (
            <TeacherListCard
              key={list.id}
              list={list}
              classMap={classMap}
              onRefresh={fetchLists}
              userId={userId}
            />
          ))}
        </div>
      )}

      <CreateListModal
        open={showCreate}
        onOpenChange={setShowCreate}
        userId={userId}
        onCreated={fetchLists}
      />
    </>
  );
}

function TeacherListCard({
  list,
  classMap,
  userId,
  onRefresh,
}: {
  list: ExerciseListDTO;
  classMap: Record<string, string>;
  userId: string;
  onRefresh: () => void;
}) {
  const { showToast } = useToast();
  const isDraft = list.status === "DRAFT";

  const classNames = list.classes
    .map((c) => classMap[c.classId] ?? c.classId.slice(0, 6))
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div className="group relative bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/35 hover:shadow-[0_4px_24px_rgba(13,204,242,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
      {/* top accent on hover */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-slate-100 leading-snug line-clamp-2">
          {list.title}
        </h3>
        <span
          className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            isDraft
              ? "bg-slate-500/15 text-slate-400 border-slate-500/25"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
          }`}
        >
          {isDraft ? "Rascunho" : "Publicada"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#0dccf2]/60" />
          {list.items.length} exercício{list.items.length !== 1 ? "s" : ""}
        </span>
        {classNames.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#10b981]/60" />
            {classNames.join(", ")}
            {list.classes.length > 2 && ` +${list.classes.length - 2}`}
          </span>
        )}
        {list.classes[0]?.deadline && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {new Date(list.classes[0].deadline).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
        <Link
          href={`/exercise-lists/${list.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors"
        >
          Gerenciar
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        {isDraft && (
          <button
            title="Publicar lista"
            onClick={() =>
              showToast({ type: "info", message: "Abra a lista para publicar." })
            }
            className="p-2 rounded-lg bg-white/5 border border-white/8 text-slate-400 hover:text-[#10b981] hover:border-[#10b981]/30 hover:bg-[#10b981]/5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── student view ─────────────────────────────────────────────────────────────

function StudentView({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [entries, setEntries] = useState<ClassExerciseListEntry[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingLists, setLoadingLists] = useState(false);

  useEffect(() => {
    api
      .get<ClassOption[]>("/classes", {
        headers: { "x-user-id": userId, "x-org-id": organizationId },
      })
      .then(({ data }) => {
        setClasses(data);
        if (data[0]) setSelectedClassId(data[0].id);
      })
      .catch(() => showToast({ type: "error", message: "Erro ao carregar turmas." }))
      .finally(() => setLoadingClasses(false));
  }, [userId, organizationId, showToast]);

  useEffect(() => {
    if (!selectedClassId) return;
    setLoadingLists(true);
    api
      .get<ClassExerciseListEntry[]>(`/classes/${selectedClassId}/exercise-lists`, {
        headers: { "x-user-id": userId },
      })
      .then(({ data }) => setEntries(data))
      .catch(() => showToast({ type: "error", message: "Erro ao carregar listas." }))
      .finally(() => setLoadingLists(false));
  }, [selectedClassId, userId, showToast]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Title>
            <GradientText>Listas da Turma</GradientText>
          </Title>
          <Subtitle className="mt-1">
            Exercícios publicados pelo seu professor
          </Subtitle>
        </div>

        {/* class selector */}
        {classes.length > 1 && (
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#0dccf2]/50 cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#101f22]">
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loadingClasses || loadingLists ? (
        <LoadingSpinner label="Carregando listas..." />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-10 h-10 text-slate-600" />}
          title="Nenhuma lista publicada"
          description="Seu professor ainda não publicou listas de exercícios para esta turma."
        />
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          {entries.map((entry) => (
            <StudentListCard
              key={entry.exerciseListId}
              entry={entry}
              classId={selectedClassId}
            />
          ))}
        </div>
      )}
    </>
  );
}

function StudentListCard({
  entry,
  classId,
}: {
  entry: ClassExerciseListEntry;
  classId: string;
}) {
  const dl = deadlineInfo(entry.deadline);
  const status = studentListStatus(entry);
  const progress = listProgress(entry.completedCount, entry.totalCount);

  return (
    <div className="group bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/30 hover:shadow-[0_4px_24px_rgba(13,204,242,0.08)] transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-slate-100 leading-snug">
          {entry.exerciseList.title}
        </h3>
        <span
          className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${status.cls}`}
        >
          {status.text}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${dl.cls}`}
        >
          <Clock className="w-3 h-3" />
          {dl.text}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
          Mínimo: {entry.minRequired} exercício{entry.minRequired !== 1 ? "s" : ""}
        </span>
      </div>

      {/* progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>
            {entry.completedCount} de {entry.totalCount} concluídos
          </span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Link
        href={`/exercise-lists/${entry.exerciseListId}?classId=${classId}`}
        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-sm font-semibold hover:bg-[#0dccf2]/20 hover:shadow-[0_0_12px_rgba(13,204,242,0.2)] transition-all"
      >
        Abrir Lista
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ── shared ui ─────────────────────────────────────────────────────────────────

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl">
      <div className="w-20 h-20 mb-5 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <p className="text-slate-200 text-lg font-bold">{title}</p>
      <p className="text-slate-500 text-sm mt-2 max-w-xs text-center leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ExerciseListsPage() {
  const { userId, user, organizationId } = useAuth();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  if (!userId) return null;

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      <SpaceBackground />
      <Navbar
        links={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Listas", href: "/exercise-lists" },
        ]}
      />
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {isTeacher ? (
          <TeacherView userId={userId} classes={[]} />
        ) : (
          <StudentView
            userId={userId}
            organizationId={organizationId ?? ""}
          />
        )}
      </main>
    </div>
  );
}

ExerciseListsPage.requireAuth = true;
