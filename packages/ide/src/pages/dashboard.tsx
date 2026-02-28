import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SpaceBackground } from "@/components/space-background";

type UserData = { id: string; name: string; email: string; role: string; organizationId: string };

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showCreateClass, setShowCreateClass] = useState(false);
    const [showJoinClass, setShowJoinClass] = useState(false);
    const [showCreateExercise, setShowCreateExercise] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    // Create class form
    const [className, setClassName] = useState('');
    const [classDesc, setClassDesc] = useState('');

    // Join class form
    const [joinCode, setJoinCode] = useState('');

    // Create exercise form 
    const [exTitle, setExTitle] = useState('');
    const [exDesc, setExDesc] = useState('');
    const [exDeadline, setExDeadline] = useState('');
    const [exWeight, setExWeight] = useState('1');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const userId = typeof window !== 'undefined' ? localStorage.getItem('lms_user_id') : null;
    const orgId = typeof window !== 'undefined' ? localStorage.getItem('lms_org_id') : null;

    // Load user info
    useEffect(() => {
        if (!userId) { router.push('/login'); return; }
        fetch(`/api/auth/me`, { headers: { 'x-user-id': userId } })
            .then(r => r.json())
            .then(setUser)
            .catch(() => {
                // fallback: build from localStorage
                setUser({ id: userId, name: '', email: '', role: 'STUDENT', organizationId: orgId || '' });
            });
    }, []);

    // Load classes
    useEffect(() => {
        if (!userId) return;
        fetchClasses();
    }, [userId]);

    const fetchClasses = () => {
        setLoading(true);
        fetch('/api/classes', {
            headers: { 'x-user-id': userId!, 'x-org-id': orgId || '' }
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setClasses(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess('');
        const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId!, 'x-org-id': orgId || '' },
                body: JSON.stringify({ name: className, description: classDesc, accessCode })
            });
            if (!res.ok) { setError('Erro ao criar turma'); return; }
            setSuccess(`Turma criada! Código de acesso: ${accessCode}`);
            setClassName(''); setClassDesc('');
            setShowCreateClass(false);
            fetchClasses();
        } catch { setError('Erro de conexão'); }
    };

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const res = await fetch('/api/classes/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId! },
                body: JSON.stringify({ accessCode: joinCode })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Código inválido'); return; }
            setSuccess('Você entrou na turma!');
            setJoinCode('');
            setShowJoinClass(false);
            fetchClasses();
        } catch { setError('Erro de conexão'); }
    };

    const handleCreateExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const res = await fetch('/api/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId! },
                body: JSON.stringify({
                    classId: selectedClassId,
                    title: exTitle,
                    description: exDesc,
                    deadline: exDeadline,
                    gradeWeight: exWeight
                })
            });
            if (!res.ok) { setError('Erro ao criar exercício'); return; }
            setSuccess('Exercício criado com sucesso!');
            setExTitle(''); setExDesc(''); setExDeadline(''); setExWeight('1');
            setShowCreateExercise(false);
            fetchClasses();
        } catch { setError('Erro de conexão'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('lms_user_id');
        localStorage.removeItem('lms_org_id');
        router.push('/login');
    };

    return (
        <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans overflow-hidden">
            <SpaceBackground />

            {/* Top Nav */}
            <header className="relative z-20 w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0dccf2] to-[#10b981] flex items-center justify-center text-[#101f22] shadow-[0_0_15px_rgba(13,204,242,0.4)] group-hover:shadow-[0_0_25px_rgba(13,204,242,0.6)] transition-all duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Java<span className="text-[#0dccf2] drop-shadow-[0_0_8px_rgba(13,204,242,0.8)]">--</span></h1>
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#0dccf2] to-[#10b981] p-[1px]">
                                <div className="w-full h-full rounded-full bg-[#101f22] flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-[#0dccf2]">{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-slate-300">
                                {user?.name || user?.email} <span className="mx-2 text-slate-600">|</span> <span className="text-[#0dccf2] font-semibold tracking-wide uppercase text-xs">{isTeacher ? 'Professor' : 'Aluno'}</span>
                            </span>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2">
                            Sair
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Alerts */}
                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex justify-between items-center backdrop-blur-md animate-fade-in shadow-[0_4px_20px_rgba(239,68,68,0.1)]">
                        <div className="flex items-center gap-3"><svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-200 p-1">✕</button>
                    </div>
                )}
                {success && (
                    <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex justify-between items-center backdrop-blur-md animate-fade-in shadow-[0_4px_20px_rgba(16,185,129,0.1)]">
                        <div className="flex items-center gap-3"><svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{success}</div>
                        <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-200 p-1">✕</button>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight">
                            <span className="bg-gradient-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(13,204,242,0.3)]">
                                {isTeacher ? 'Painel do Professor' : 'Meu Aprendizado'}
                            </span>
                        </h2>
                        <p className="text-slate-400 text-base mt-2">{isTeacher ? 'Gerencie suas turmas, crie exercícios e acompanhe alunos' : 'Suas turmas e exercícios pendentes em um só lugar'}</p>
                    </div>
                    <div className="flex gap-4">
                        {isTeacher ? (
                            <button onClick={() => setShowCreateClass(true)} className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] shadow-[0_0_20px_rgba(13,204,242,0.3)] hover:shadow-[0_0_30px_rgba(13,204,242,0.5)] hover:scale-[1.02] transition-all duration-300">
                                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Nova Turma
                            </button>
                        ) : (
                            <button onClick={() => setShowJoinClass(true)} className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] shadow-[0_0_20px_rgba(13,204,242,0.3)] hover:shadow-[0_0_30px_rgba(13,204,242,0.5)] hover:scale-[1.02] transition-all duration-300">
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                Entrar em Turma
                            </button>
                        )}
                    </div>
                </div>

                {/* Classes Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
                        <span className="font-medium tracking-wide">Carregando turmas...</span>
                    </div>
                ) : classes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] rounded-3xl border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10 shadow-[inner_0_0_20px_rgba(13,204,242,0.1)]">
                            <span className="text-5xl opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">📚</span>
                        </div>
                        <p className="text-slate-200 text-xl font-bold tracking-tight">Nenhuma turma encontrada</p>
                        <p className="text-slate-500 text-sm mt-3 max-w-sm text-center leading-relaxed">
                            {isTeacher ? 'Você ainda não criou nenhuma turma. Clique no botão acima para começar a gerenciar seus alunos.' : 'Você não está matriculado em nenhuma turma. Use o código de acesso fornecido pelo seu professor para entrar.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls: any) => (
                            <div key={cls.id} className="group relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-[#0dccf2]/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(13,204,242,0.15)] hover:-translate-y-1 flex flex-col h-full">
                                {/* Top gradient accent */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl shadow-[0_0_10px_rgba(13,204,242,0.5)]" />

                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#0dccf2] transition-colors leading-tight pr-4">{cls.name}</h3>
                                    {cls._count && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner shrink-0">
                                            <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            <span className="text-xs font-bold text-slate-200">
                                                {cls._count.members || 0}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed flex-1">{cls.description}</p>

                                {isTeacher && (
                                    <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md flex items-center justify-between group/code cursor-copy">
                                        <span className="text-xs text-slate-400 font-semibold tracking-wider">CÓDIGO:</span>
                                        <span className="text-base font-mono font-bold text-[#0dccf2] tracking-widest drop-shadow-[0_0_8px_rgba(13,204,242,0.4)] group-hover/code:text-white transition-colors">{cls.accessCode}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm text-slate-400 font-medium mb-6 px-1">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#0dccf2]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                        <span>{cls._count?.exercises || 0} exercícios</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0dccf2] to-[#10b981] flex items-center justify-center text-[10px] font-bold text-[#101f22]">
                                            {(cls.teacher?.name || 'P')[0].toUpperCase()}
                                        </div>
                                        <span>{cls.teacher?.name || 'Professor'}</span>
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-white/10 flex gap-3 mt-auto">
                                    <Link href={`/classes/${cls.id}`} className="flex-1 flex justify-center items-center py-3 rounded-xl border border-white/10 hover:border-[#0dccf2]/50 hover:bg-[#0dccf2]/5 text-sm font-bold text-slate-300 hover:text-[#0dccf2] transition-all duration-300">
                                        Ver Detalhes
                                    </Link>
                                    {isTeacher && (
                                        <button
                                            onClick={() => { setSelectedClassId(cls.id); setShowCreateExercise(true); }}
                                            className="flex flex-1 justify-center items-center py-3 rounded-xl bg-gradient-to-r from-[#0dccf2] to-[#10b981] hover:opacity-90 text-[#101f22] text-sm font-bold shadow-[0_0_15px_rgba(13,204,242,0.2)] hover:shadow-[0_0_20px_rgba(13,204,242,0.4)] transition-all duration-300 gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                            Exercício
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ======= MODALS ======= */}

            {/* Create Class Modal */}
            {showCreateClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#182f34] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Criar Nova Turma</h3>
                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Nome da Turma</label>
                                <input value={className} onChange={e => setClassName(e.target.value)} required
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm"
                                    placeholder="Ex: Programação Java-- 2024" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Descrição</label>
                                <textarea value={classDesc} onChange={e => setClassDesc(e.target.value)} required rows={3}
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm resize-none"
                                    placeholder="Descreva a turma..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateClass(false)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] text-sm font-bold hover:opacity-90 transition-all">Criar Turma</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Class Modal */}
            {showJoinClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#182f34] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Entrar em Turma</h3>
                        <form onSubmit={handleJoinClass} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Código de Acesso</label>
                                <input value={joinCode} onChange={e => setJoinCode(e.target.value)} required
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm font-mono text-center text-lg tracking-widest uppercase"
                                    placeholder="EX: A3F9K2" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowJoinClass(false)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] text-sm font-bold hover:opacity-90 transition-all">Entrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Exercise Modal */}
            {showCreateExercise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#182f34] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Criar Exercício</h3>
                        <form onSubmit={handleCreateExercise} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Título</label>
                                <input value={exTitle} onChange={e => setExTitle(e.target.value)} required
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm"
                                    placeholder="Ex: Hello World em Java--" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Descrição / Instruções</label>
                                <textarea value={exDesc} onChange={e => setExDesc(e.target.value)} required rows={4}
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm resize-none"
                                    placeholder="Descreva o exercício em detalhes..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Prazo de Entrega</label>
                                    <input type="datetime-local" value={exDeadline} onChange={e => setExDeadline(e.target.value)} required
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Peso da Nota</label>
                                    <input type="number" min="0" step="0.1" value={exWeight} onChange={e => setExWeight(e.target.value)} required
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateExercise(false)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] text-sm font-bold hover:opacity-90 transition-all">Criar Exercício</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
