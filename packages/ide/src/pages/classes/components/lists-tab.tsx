import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

export function ListsTab({
  exerciseLists,
  loadingLists,
  isTeacher,
  classId,
}: {
  exerciseLists: any[];
  loadingLists: boolean;
  isTeacher: boolean;
  classId: string | string[] | undefined;
}) {
  if (loadingLists) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
        <span className="text-sm font-medium">Carregando listas...</span>
      </div>
    );
  }

  if (exerciseLists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div className="w-20 h-20 mb-5 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10">
          <BookOpen className="w-10 h-10 text-slate-600" />
        </div>
        <p className="text-slate-200 text-lg font-bold">Nenhuma lista publicada</p>
        <p className="text-slate-500 text-sm mt-2 max-w-xs text-center leading-relaxed">
          {isTeacher
            ? "Publique uma lista de exercícios para esta turma em 'Minhas Listas'."
            : "Seu professor ainda não publicou listas para esta turma."}
        </p>
      </div>
    );
  }

  if (isTeacher) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exerciseLists.map((entry: any) => (
          <div key={entry.exerciseListId} className="group relative bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/35 hover:shadow-[0_4px_24px_rgba(13,204,242,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
            <h3 className="font-bold text-slate-100 leading-snug line-clamp-2">{entry.exerciseList.title}</h3>
            {entry.exerciseList.description && (
              <p className="text-xs text-slate-400 line-clamp-2">{entry.exerciseList.description}</p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0dccf2]/60" />
                {entry.totalCount} exercício{entry.totalCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                Mínimo: {entry.minRequired}
              </span>
            </div>
            <div className="mt-auto pt-3 border-t border-white/5">
              <Link
                href={`/exercise-lists/${entry.exerciseListId}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors"
              >
                Gerenciar
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {exerciseLists.map((entry: any) => {
        const progress = entry.totalCount > 0 ? Math.round((entry.completedCount / entry.totalCount) * 100) : 0;
        const statusCls =
          entry.completedCount >= entry.minRequired
            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
            : entry.completedCount > 0
            ? "bg-blue-500/15 text-blue-300 border-blue-500/25"
            : "bg-slate-500/15 text-slate-400 border-slate-500/25";
        const statusText =
          entry.completedCount >= entry.minRequired ? "Concluída" : entry.completedCount > 0 ? "Em andamento" : "Não iniciada";

        return (
          <div key={entry.exerciseListId} className="group bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/30 hover:shadow-[0_4px_24px_rgba(13,204,242,0.08)] transition-all duration-300">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-bold text-slate-100 leading-snug">{entry.exerciseList.title}</h3>
              <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusCls}`}>
                {statusText}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
                Mínimo: {entry.minRequired} exercício{entry.minRequired !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{entry.completedCount} de {entry.totalCount} concluídos</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
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
      })}
    </div>
  );
}
