import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";

export default function ClassDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [exercises, setExercises] = useState<any[]>([]);
    const [classInfo, setClassInfo] = useState<any>(null);
    const [submissions, setSubmissions] = useState<Record<string, any[]>>({});
    const [expandedEx, setExpandedEx] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const userId = typeof window !== 'undefined' ? localStorage.getItem('lms_user_id') : null;

    // Load user info
    useEffect(() => {
        if (!userId) return;
        fetch('/api/auth/me', { headers: { 'x-user-id': userId } })
            .then(r => r.json())
            .then(setUser)
            .catch(() => { });
    }, [userId]);

    // Load exercises
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

    const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

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

    const isOverdue = (d: string) => new Date(d) < new Date();

    // Get student's submission for an exercise (from the exercise response)
    const getMySubmission = (ex: any) => {
        if (ex.submissions && ex.submissions.length > 0) return ex.submissions[0];
        return null;
    };

    return (
        <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans overflow-hidden">
            <SpaceBackground />

            <header className="relative z-20 w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0dccf2]/40 transition-all duration-300 hover:shadow-[0_0_15px_rgba(13,204,242,0.2)]">
                            <svg className="w-5 h-5 text-[#0dccf2] group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            Detalhes da Turma
                        </h1>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-8">
                    <div>
                        <h2 className="text-4xl font-black">
                            <span className="bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(13,204,242,0.4)]">
                                Exercícios
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm mt-3 font-medium">Gerencie e acompanhe as atividades da turma.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
                        <span className="font-medium tracking-wide">Carregando exercícios...</span>
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                        <div className="w-24 h-24 mb-6 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10 shadow-[inner_0_0_20px_rgba(13,204,242,0.1)]">
                            <span className="text-5xl opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">📝</span>
                        </div>
                        <p className="text-slate-200 text-xl font-bold tracking-tight">Nenhum exercício nesta turma ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {exercises.map((ex: any) => {
                            const mySub = getMySubmission(ex);
                            return (
                                <div key={ex.id} className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden hover:border-[#0dccf2]/30 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(13,204,242,0.1)]">
                                    {/* Left Accent Bar */}
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-[#0dccf2] to-[#10b981] opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Exercise Header */}
                                    <div
                                        className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-white/5 transition-colors gap-6"
                                        onClick={() => isTeacher ? loadSubmissions(ex.id) : null}
                                    >
                                        <div className="flex-1 pl-2">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-white group-hover:text-[#0dccf2] transition-colors">{ex.title}</h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${ex.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]'}`}>
                                                    {ex.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">{ex.description?.substring(0, 150)}{ex.description?.length > 150 ? '...' : ''}</p>
                                        </div>
                                        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 pr-2">
                                            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border ${isOverdue(ex.deadline) ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-slate-300 border-white/10'}`}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Prazo: {formatDate(ex.deadline)}
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="text-xs font-semibold text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                                    Peso <span className="text-white ml-1 text-sm">{ex.gradeWeight}</span>
                                                </div>
                                                <Link href={`/exercises/${ex.id}`} onClick={e => e.stopPropagation()} className="px-5 py-2 rounded-xl bg-linear-to-r from-[#0dccf2]/10 to-[#10b981]/10 hover:from-[#0dccf2] hover:to-[#10b981] border border-[#0dccf2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50 text-[#0dccf2] hover:text-[#101f22] font-bold transition-all duration-300 shadow-[0_0_15px_rgba(13,204,242,0.1)] hover:shadow-[0_0_20px_rgba(13,204,242,0.4)]">
                                                    Abrir no IDE
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student: Show my grade/feedback */}
                                    {!isTeacher && mySub && (
                                        <div className="border-t border-white/10 bg-black/40 p-6 sm:p-8">
                                            <h4 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4 pl-2">Minha Submissão</h4>

                                            <div className="bg-[#182f34] border border-white/5 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0dccf2]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${mySub.status === 'GRADED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                                                mySub.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                                }`}>
                                                                {mySub.status === 'GRADED' ? '✅ Corrigido' : mySub.status === 'SUBMITTED' ? '📩 Enviado' : '⏳ Pendente'}
                                                            </span>
                                                            <span className="text-xs font-medium text-slate-400">Enviado em {formatDate(mySub.submittedAt)}</span>
                                                        </div>
                                                        {mySub.status !== 'GRADED' && (
                                                            <p className="text-sm text-slate-500 italic mt-2 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                                Aguardando correção do professor...
                                                            </p>
                                                        )}
                                                    </div>

                                                    {mySub.score != null && (
                                                        <div className="bg-black/40 border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-end justify-center min-w-[120px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                                            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Nota</span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-br from-[#0dccf2] to-[#10b981] drop-shadow-[0_0_8px_rgba(13,204,242,0.5)]">{mySub.score}</span>
                                                                <span className="text-sm font-bold text-slate-600">/ 10</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {mySub.status === 'GRADED' && mySub.teacherFeedback && (
                                                    <div className="mt-6 pt-5 border-t border-white/5 relative z-10">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <svg className="w-4 h-4 text-[#0dccf2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                                            <span className="text-xs font-bold text-[#0dccf2] uppercase tracking-wider">Feedback do Professor</span>
                                                        </div>
                                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-[#0dccf2]/30">{mySub.teacherFeedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Student: No submission yet */}
                                    {!isTeacher && !mySub && (
                                        <div className="border-t border-white/5 bg-black/20 p-6 flex items-center gap-3 pl-8">
                                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <p className="text-sm text-slate-400 font-medium">Você ainda não enviou uma solução para este exercício.</p>
                                        </div>
                                    )}

                                    {/* Teacher: Expandable submissions list */}
                                    {isTeacher && expandedEx === ex.id && (
                                        <div className="border-t border-white/10 bg-black/40 p-6 sm:p-8">
                                            <div className="flex items-center justify-between mb-6 pl-2">
                                                <h4 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Submissões <span className="ml-2 bg-white/10 text-white px-2.5 py-1 rounded-full text-xs">{submissions[ex.id]?.length || 0}</span></h4>
                                            </div>

                                            {!submissions[ex.id] || submissions[ex.id].length === 0 ? (
                                                <div className="text-center py-10 bg-white/2 rounded-2xl border border-white/5">
                                                    <p className="text-sm text-slate-500 font-medium">Nenhuma submissão recebida até o momento.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {submissions[ex.id].map((sub: any) => (
                                                        <Link href={`/submissions/${sub.id}`} key={sub.id} className="group/sub flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-[#0dccf2]/40 transition-all duration-300 cursor-pointer gap-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#0dccf2]/20 to-[#10b981]/20 flex items-center justify-center border border-[#0dccf2]/20 text-[#0dccf2] font-bold">
                                                                    {(sub.student?.name || sub.studentId)[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="text-base font-bold text-white group-hover/sub:text-[#0dccf2] transition-colors">{sub.student?.name || sub.studentId}</div>
                                                                    <div className="text-xs font-medium text-slate-500 mt-0.5">{formatDate(sub.submittedAt)}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-5 sm:ml-auto">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${sub.status === 'GRADED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : sub.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                                                    {sub.status === 'GRADED' ? '✅ Corrigido' : sub.status === 'SUBMITTED' ? '📩 Enviado' : '⏳ Pendente'}
                                                                </span>
                                                                {sub.score != null && <span className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-[#0dccf2] to-[#10b981] w-12 text-right">{sub.score}</span>}
                                                                <span className="text-sm font-semibold text-slate-500 group-hover/sub:text-[#0dccf2] transition-colors flex items-center gap-1 group-hover/sub:translate-x-1 duration-300">
                                                                    Corrigir <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Teacher: Click hint */}
                                    {isTeacher && expandedEx !== ex.id && (
                                        <div className="border-t border-white/5 px-8 py-3 bg-black/20 cursor-pointer hover:bg-black/40 transition-colors flex justify-center items-center gap-2 text-slate-500 hover:text-[#0dccf2]" onClick={() => loadSubmissions(ex.id)}>
                                            <span className="text-xs font-bold uppercase tracking-widest">Ver submissões</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
