import { useState, useEffect } from "react";
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
import { HeroButton } from "@/components/buttons/hero";
import { Loader2 } from "lucide-react";
import type { ExerciseDTO } from "@/dtos/exercise.dto";

export function AddExerciseModal({
  open,
  onOpenChange,
  listId,
  existingIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string;
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
      .get<ExerciseDTO[]>("/exercises")
      .then(({ data }) => setExercises(data))
      .catch(() => showToast({ type: "error", message: "Erro ao carregar exercícios." }))
      .finally(() => setLoading(false));
  }, [open, showToast]);

  const handleAdd = async (exerciseId: string) => {
    setAdding(exerciseId);
    try {
      await api.post(
        `/exercise-lists/${listId}/exercises`,
        { exerciseId, gradeWeight: 1 },
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
