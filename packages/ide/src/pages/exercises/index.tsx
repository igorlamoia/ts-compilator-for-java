import { useState, useEffect, useCallback } from "react";
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
import { Plus, Search } from "lucide-react";
import type { ExerciseDTO } from "@/dtos/exercise.dto";
import { CreateExerciseModal } from "@/views/exercises/components/create-exercise-modal";
import { ExerciseCard } from "@/views/exercises/components/exercise-card";
import { ExerciseDetailModal } from "@/views/exercises/components/exercise-detail-modal";
import { DeleteConfirmModal } from "@/views/exercises/components/delete-confirm-modal";
import { StatsBar } from "@/views/exercises/components/stats-bar";
import { LoadingSpinner, EmptyState } from "@/views/exercises/components/shared";

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
      const { data } = await api.get<ExerciseDTO[]>("/exercises");
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
      await api.delete(`/exercises/${deleteTarget.id}`);
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
