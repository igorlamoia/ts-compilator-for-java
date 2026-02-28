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
            <header className="relative z-20 w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0dccf2] to-[#10b981] flex items-center justify-center text-[#101f22]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        </div>
                        <h1 className="text-xl font-bold text-white">Java<span className="text-[#0dccf2]">--</span></h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 hidden sm:block">
                            {user?.name || user?.email} • <span className="text-[#0dccf2]">{isTeacher ? 'Professor' : 'Aluno'}</span>
                        </span>
                        <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-400 transition-colors">Sair</button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex justify-between items-center">
                        {error}
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-200 ml-4">✕</button>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex justify-between items-center">
                        {success}
                        <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-200 ml-4">✕</button>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold">
                            <span className="bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent">
                                {isTeacher ? 'Painel do Professor' : 'Painel do Aluno'}
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">{isTeacher ? 'Gerencie suas turmas e exercícios' : 'Suas turmas e exercícios pendentes'}</p>
                    </div>
                    <div className="flex gap-3">
                        {isTeacher ? (
                            <button onClick={() => setShowCreateClass(true)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] shadow-[0_0_15px_rgba(13,204,242,0.3)] hover:shadow-[0_0_25px_rgba(13,204,242,0.5)] hover:opacity-90 transition-all">
                                + Nova Turma
                            </button>
                        ) : (
                            <button onClick={() => setShowJoinClass(true)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] shadow-[0_0_15px_rgba(13,204,242,0.3)] hover:shadow-[0_0_25px_rgba(13,204,242,0.5)] hover:opacity-90 transition-all">
                                Entrar em Turma
                            </button>
                        )}
                    </div>
                </div>

                {/* Classes Grid */}
                {loading ? (
                    <div className="text-center py-20 text-slate-500">Carregando...</div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="text-5xl mb-4">📚</div>
                        <p className="text-slate-400 text-lg">Nenhuma turma encontrada</p>
                        <p className="text-slate-500 text-sm mt-2">
                            {isTeacher ? 'Crie uma turma para começar.' : 'Entre em uma turma usando o código de acesso.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls: any) => (
                            <div key={cls.id} className="group relative bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#0dccf2]/40 transition-all shadow-lg">
                                {/* Top gradient */}
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-80 transition-opacity rounded-t-2xl" />

                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-[#0dccf2] transition-colors">{cls.name}</h3>
                                    {cls._count && (
                                        <span className="text-xs bg-white/10 text-slate-300 px-2 py-1 rounded-lg">
                                            {cls._count.members || 0} alunos
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{cls.description}</p>

                                {isTeacher && (
                                    <div className="mb-4 p-2 bg-black/20 rounded-lg border border-white/5">
                                        <span className="text-xs text-slate-500">Código de acesso:</span>
                                        <span className="text-sm font-mono text-[#0dccf2] ml-2">{cls.accessCode}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>{cls._count?.exercises || 0} exercícios</span>
                                    <span>{cls.teacher?.name || 'Professor'}</span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                    <Link href={`/classes/${cls.id}`} className="flex-1 text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-all">
                                        Ver Detalhes
                                    </Link>
                                    {isTeacher && (
                                        <button
                                            onClick={() => { setSelectedClassId(cls.id); setShowCreateExercise(true); }}
                                            className="flex-1 text-center py-2 rounded-lg bg-[#0dccf2]/10 hover:bg-[#0dccf2]/20 text-sm text-[#0dccf2] transition-all"
                                        >
                                            + Exercício
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
