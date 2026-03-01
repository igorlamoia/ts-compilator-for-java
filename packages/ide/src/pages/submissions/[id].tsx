import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";

export default function GradeSubmission() {
    const router = useRouter();
    const { id } = router.query;
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Compiler validation state
    const [compileResult, setCompileResult] = useState<any>(null);
    const [compiling, setCompiling] = useState(false);

    const userId = typeof window !== 'undefined' ? localStorage.getItem('lms_user_id') : null;

    useEffect(() => {
        if (!id || !userId) return;
        fetch(`/api/submissions/${id}`, {
            headers: { 'x-user-id': userId }
        })
            .then(r => r.json())
            .then(data => {
                setSubmission(data);
                if (data.score != null) setScore(String(data.score));
                if (data.teacherFeedback) setFeedback(data.teacherFeedback);
                setLoading(false);
            })
            .catch(() => { setError('Submissão não encontrada'); setLoading(false); });
    }, [id, userId]);

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSaving(true); setSaved(false);

        try {
            const res = await fetch(`/api/submissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId! },
                body: JSON.stringify({ score: Number(score), teacherFeedback: feedback })
            });
            if (!res.ok) { setError('Erro ao salvar nota'); setSaving(false); return; }
            setSaved(true); setSaving(false);
        } catch {
            setError('Erro de conexão'); setSaving(false);
        }
    };

    const handleRecompile = async () => {
        if (!submission?.codeSnapshot) return;
        setCompiling(true); setCompileResult(null);

        try {
            const res = await fetch('/api/submissions/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId! },
                body: JSON.stringify({
                    exerciseId: submission.exerciseId,
                    sourceCode: submission.codeSnapshot
                })
            });
            const data = await res.json();
            setCompileResult(data);
            setCompiling(false);
        } catch {
            setCompileResult({ valid: false, errors: ['Erro de conexão'], warnings: [] });
            setCompiling(false);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#101f22] flex items-center justify-center">
                <div className="text-slate-500">Carregando submissão...</div>
            </div>
        );
    }

    if (error && !submission) {
        return (
            <div className="min-h-screen bg-[#101f22] flex items-center justify-center flex-col gap-4">
                <div className="text-red-400">{error}</div>
                <Link href="/dashboard" className="text-sm text-[#0dccf2] hover:underline">Voltar ao Painel</Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans overflow-hidden">
            <SpaceBackground />

            {/* Header */}
            <header className="relative z-20 w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">← Painel</Link>
                    <div className="h-4 w-px bg-white/10" />
                    <h1 className="text-lg font-bold text-white">Correção de Exercício</h1>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
                {/* Info bar */}
                <div className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold">
                                <span className="bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent">
                                    {submission?.exercise?.title}
                                </span>
                            </h2>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                                <span>👤 {submission?.student?.name || submission?.student?.email || 'Aluno'}</span>
                                <span>📅 {submission ? formatDate(submission.submittedAt) : ''}</span>
                                <span>⚖️ Peso: {submission?.exercise?.gradeWeight}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${submission?.status === 'GRADED' ? 'bg-emerald-500/20 text-emerald-300' :
                                    submission?.status === 'SUBMITTED' ? 'bg-blue-500/20 text-blue-300' :
                                        'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                {submission?.status === 'GRADED' ? '✅ Corrigido' : submission?.status === 'SUBMITTED' ? '📩 Enviado' : '⏳ Pendente'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Code Viewer */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Code */}
                        <div className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                            <div className="flex justify-between items-center px-6 py-3 border-b border-white/5">
                                <h3 className="text-sm font-semibold text-slate-300">Código Submetido</h3>
                                <button
                                    onClick={handleRecompile}
                                    disabled={compiling}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0dccf2]/10 hover:bg-[#0dccf2]/20 text-[#0dccf2] transition-all disabled:opacity-50"
                                >
                                    {compiling ? 'Compilando...' : '▶ Recompilar'}
                                </button>
                            </div>
                            <pre className="p-6 text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto bg-black/20">
                                <code>{submission?.codeSnapshot || 'Nenhum código enviado'}</code>
                            </pre>
                        </div>

                        {/* Compilation Result */}
                        {compileResult && (
                            <div className={`border rounded-2xl p-5 ${compileResult.valid ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                                }`}>
                                <h4 className={`text-sm font-bold mb-3 ${compileResult.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {compileResult.valid ? '✅ Compilação bem-sucedida' : `❌ Compilação falhou (${compileResult.errors?.length} erro${compileResult.errors?.length > 1 ? 's' : ''})`}
                                </h4>
                                {compileResult.errors?.length > 0 && (
                                    <div className="space-y-1.5 mb-3">
                                        {compileResult.errors.map((err: string, i: number) => (
                                            <div key={i} className="text-xs text-red-300 font-mono bg-red-500/10 px-3 py-2 rounded">{err}</div>
                                        ))}
                                    </div>
                                )}
                                {compileResult.warnings?.length > 0 && (
                                    <div className="space-y-1.5">
                                        {compileResult.warnings.map((w: string, i: number) => (
                                            <div key={i} className="text-xs text-yellow-300 font-mono bg-yellow-500/10 px-3 py-2 rounded">{w}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Exercise Description */}
                        <div className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-[#0dccf2] uppercase tracking-wider mb-3">Enunciado do Exercício</h3>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{submission?.exercise?.description}</p>
                        </div>
                    </div>

                    {/* Right: Grading Panel */}
                    <div className="space-y-4">
                        <div className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-lg font-bold mb-6">
                                <span className="bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent">Avaliação</span>
                            </h3>

                            {error && <div className="text-xs text-red-400 mb-3 p-2 bg-red-500/10 rounded-lg">{error}</div>}
                            {saved && <div className="text-xs text-emerald-400 mb-3 p-2 bg-emerald-500/10 rounded-lg">✅ Nota salva com sucesso!</div>}

                            <form onSubmit={handleGrade} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Nota</label>
                                    <input
                                        type="number" min="0" max="10" step="0.1"
                                        value={score} onChange={e => setScore(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 text-2xl font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all"
                                        placeholder="0.0"
                                    />
                                    <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                                        <span>Mínimo: 0</span>
                                        <span>Máximo: 10</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Feedback para o Aluno</label>
                                    <textarea
                                        value={feedback} onChange={e => setFeedback(e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all text-sm resize-none"
                                        placeholder="Escreva seu feedback sobre o código do aluno..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3 rounded-xl text-sm font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] shadow-[0_0_15px_rgba(13,204,242,0.3)] hover:shadow-[0_0_25px_rgba(13,204,242,0.5)] hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Salvando...' : submission?.status === 'GRADED' ? 'Atualizar Nota' : 'Atribuir Nota'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
