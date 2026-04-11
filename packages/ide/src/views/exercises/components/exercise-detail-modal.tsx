import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HeroButton } from "@/components/buttons/hero";
import type { Exercise } from "@/types/api";

export function ExerciseDetailModal({
  open,
  onOpenChange,
  exercise,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exercise: Exercise | null;
}) {
  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl backdrop-blur-3xl">
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
                        <span className="text-xs text-slate-400">
                          {tc.label}
                        </span>
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
