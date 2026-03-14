import Link from "next/link";
import { ListChecks, LogIn, Plus, Users } from "lucide-react";

export function StudentClassCard({
  cls,
  onJoinClick,
}: {
  cls: any;
  onJoinClick: () => void;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col group hover:border-blue-500/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
          <ListChecks className="w-6 h-6" />
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
          Em andamento
        </span>
      </div>
      <h3 className="text-xl font-bold mb-1 leading-tight group-hover:text-blue-500 transition-colors">{cls.name}</h3>
      <p className="text-slate-500 text-sm mb-6 flex items-center gap-1">
        <Users className="w-4 h-4" />
        {cls.teacher?.name || "Professor"}
      </p>

      <div className="mb-8 flex items-center gap-6">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle className="stroke-slate-800" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
            <circle className="stroke-blue-500" cx="18" cy="18" fill="none" r="16" strokeDasharray="100" strokeDashoffset="35" strokeLinecap="round" strokeWidth="3"></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold">65%</div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Próximo Prazo</span>
          <span className="text-sm font-semibold text-slate-200">Em breve</span>
        </div>
      </div>

      <Link href={`/classes/${cls.id}`} className="mt-auto w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
        Entrar na Turma
        <LogIn className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function JoinClassCard({ onJoinClick }: { onJoinClick: () => void }) {
  return (
    <button onClick={onJoinClick} className="rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all p-6 flex flex-col items-center justify-center group h-full min-h-[300px]">
      <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-all mb-4">
        <Plus className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-lg mb-1 hidden sm:block">Entrar em nova turma</h3>
      <p className="text-slate-500 text-sm hidden sm:block text-center px-4">Insira o código fornecido pelo seu professor para participar.</p>
    </button>
  );
}
