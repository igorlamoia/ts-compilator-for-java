import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";

export default function ClassDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [exercises, setExercises] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<Record<string, any[]>>({});
    const [expandedEx, setExpandedEx] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const userId = typeof window !== 'undefined' ? localStorage.getItem('lms_user_id') : null;

    useEffect(() => {
        if (!id || !userId) return;
        fetch(`/api/exercises?classId=${id}`, {
            headers: { 'x-user-id': userId }
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setExercises(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id, userId]);

    const loadSubmissions = async (exerciseId: string) => {
        if (expandedEx === exerciseId) { setExpandedEx(null); return; }
        setExpandedEx(exerciseId);
        if (submissions[exerciseId]) return;

        const res = await fetch(`/api/submissions?exerciseId=${exerciseId}`, {
            headers: { 'x-user-id': userId! }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
            setSubmissions(prev => ({ ...prev, [exerciseId]: data }));
        }
    };

    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans overflow-hidden">
            <SpaceBackground />

            {/* Top Nav */}
            <header className="relative z-20 w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">← Voltar ao Painel</Link>
                    <div className="h-4 w-px bg-white/10" />
                    <h1 className="text-lg font-bold text-white">Detalhes da Turma</h1>
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-bold mb-8">
                    <span className="bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent">Exercícios</span>
                </h2>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">Carregando...</div>
                ) : exercises.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <p className="text-slate-400">Nenhum exercício nesta turma ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {exercises.map((ex: any) => (
                            <div key={ex.id} className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => loadSubmissions(ex.id)}>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white">{ex.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{ex.description?.substring(0, 120)}{ex.description?.length > 120 ? '...' : ''}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end gap-2">
                                        <div className="text-xs text-slate-500">Prazo: {formatDate(ex.deadline)}</div>
                                        <div className="text-xs text-slate-500">Peso: {ex.gradeWeight}</div>
                                        <span className={`inline-block text-xs px-2 py-1 rounded ${ex.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                            {ex.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                                        </span>
                                        <Link href={`/exercises/${ex.id}`} onClick={e => e.stopPropagation()} className="mt-1 px-3 py-1.5 rounded-lg bg-[#0dccf2]/10 hover:bg-[#0dccf2]/20 text-xs text-[#0dccf2] font-medium transition-all">
                                            Abrir no IDE →
                                        </Link>
                                    </div>
                                </div>

                                {expandedEx === ex.id && (
                                    <div className="border-t border-white/5 p-6 bg-black/10">
                                        <h4 className="text-sm font-semibold text-slate-300 mb-4">Submissões ({submissions[ex.id]?.length || 0})</h4>
                                        {!submissions[ex.id] || submissions[ex.id].length === 0 ? (
                                            <p className="text-sm text-slate-500">Nenhuma submissão ainda.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {submissions[ex.id].map((sub: any) => (
                                                    <Link href={`/submissions/${sub.id}`} key={sub.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-[#0dccf2]/30 transition-all cursor-pointer">
                                                        <div>
                                                            <span className="text-sm font-medium text-white">{sub.student?.name || sub.studentId}</span>
                                                            <span className="text-xs text-slate-500 ml-3">{formatDate(sub.submittedAt)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-xs px-2 py-1 rounded ${sub.status === 'GRADED' ? 'bg-emerald-500/20 text-emerald-300' : sub.status === 'SUBMITTED' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                                {sub.status === 'GRADED' ? 'Corrigido' : sub.status === 'SUBMITTED' ? 'Enviado' : 'Pendente'}
                                                            </span>
                                                            {sub.score != null && <span className="text-sm font-bold text-[#0dccf2]">{sub.score}</span>}
                                                            <span className="text-xs text-slate-500">Corrigir →</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
