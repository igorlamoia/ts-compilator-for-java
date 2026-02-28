import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";
import { EditorContext, EditorProvider } from "@/contexts/EditorContext";
import { KeywordProvider } from "@/contexts/KeywordContext";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";
import { IDEView } from "@/views/ide";
import { useIntermediatorCode } from "@/views/ide/useIntermediatorCode";

function WorkspaceContent({ exercise, userId }: { exercise: any; userId: string }) {
    const { getEditorCode } = useContext(EditorContext);
    const [isOpenKeywordCustomizer, setIsOpenKeywordCustomizer] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [compileErrors, setCompileErrors] = useState<string[]>([]);
    const [compileWarnings, setCompileWarnings] = useState<string[]>([]);
    const [showCompilePanel, setShowCompilePanel] = useState(false);

    const lastSubmission = exercise?.submissions?.[0];
    const isAlreadySubmitted = lastSubmission?.status === 'SUBMITTED' || lastSubmission?.status === 'GRADED';

    const handleSubmit = async () => {
        setError('');
        setCompileErrors([]);
        setCompileWarnings([]);
        setShowCompilePanel(false);

        const code = getEditorCode();
        if (!code || code.trim().length < 5) {
            setError('Escreva algum código antes de enviar!');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/submissions/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify({
                    exerciseId: exercise.id,
                    sourceCode: code
                })
            });
            const data = await res.json();

            if (!data.valid) {
                // Compilation failed
                setCompileErrors(data.errors || []);
                setCompileWarnings(data.warnings || []);
                setShowCompilePanel(true);
                setSubmitting(false);
                return;
            }

            // Compilation succeeded, submission created
            if (data.warnings?.length > 0) {
                setCompileWarnings(data.warnings);
                setShowCompilePanel(true);
            }
            setSubmitted(true);
            setSubmitting(false);
        } catch {
            setError('Erro de conexão');
            setSubmitting(false);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const isOverdue = new Date(exercise.deadline) < new Date();

    return (
        <>
            <header className="relative z-10 flex justify-between items-center px-6 py-3 bg-[#101f22]/90 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-xs text-slate-500 hover:text-white transition-colors">← Painel</Link>
                    <div className="h-4 w-px bg-white/10" />
                    <div>
                        <h1 className="text-lg font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent">
                            {exercise.title}
                        </h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-500">Turma: {exercise.class?.name}</span>
                            <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                                Prazo: {formatDate(exercise.deadline)}
                            </span>
                            {isOverdue && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">Atrasado</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {error && <span className="text-xs text-red-400">{error}</span>}
                    {submitted || isAlreadySubmitted ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                            <span className="text-sm text-emerald-300 font-medium">✓ Enviado</span>
                            {lastSubmission?.score != null && (
                                <span className="text-sm font-bold text-[#0dccf2]">Nota: {lastSubmission.score}</span>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-5 py-2 rounded-xl text-sm font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] text-[#101f22] shadow-[0_0_15px_rgba(13,204,242,0.3)] hover:shadow-[0_0_25px_rgba(13,204,242,0.5)] hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Compilando...' : 'Compilar & Submeter'}
                        </button>
                    )}
                </div>
            </header>

            {/* Compilation Results Panel */}
            {showCompilePanel && (
                <div className="relative z-10 border-b border-white/5">
                    <div className={`px-6 py-3 ${compileErrors.length > 0 ? 'bg-red-500/5' : 'bg-emerald-500/5'} backdrop-blur-md`}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className={`text-sm font-bold ${compileErrors.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {compileErrors.length > 0 ? `❌ Compilação Falhou (${compileErrors.length} erro${compileErrors.length > 1 ? 's' : ''})` : '✅ Compilado com Sucesso'}
                            </h3>
                            <button onClick={() => setShowCompilePanel(false)} className="text-xs text-slate-500 hover:text-white transition-colors">Fechar</button>
                        </div>
                        {compileErrors.length > 0 && (
                            <div className="space-y-1 mb-2">
                                {compileErrors.map((err, i) => (
                                    <div key={i} className="text-xs text-red-300 font-mono bg-red-500/10 px-3 py-1.5 rounded">{err}</div>
                                ))}
                            </div>
                        )}
                        {compileWarnings.length > 0 && (
                            <div className="space-y-1">
                                {compileWarnings.map((warn, i) => (
                                    <div key={i} className="text-xs text-yellow-300 font-mono bg-yellow-500/10 px-3 py-1.5 rounded">{warn}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="relative z-10 flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
                {/* Left: Instructions */}
                <div className="w-[360px] flex-shrink-0 border-r border-white/5 bg-[#0d1a1d]/60 backdrop-blur-md overflow-y-auto">
                    <div className="p-6">
                        <h2 className="text-sm font-semibold text-[#0dccf2] uppercase tracking-wider mb-4">Instruções</h2>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{exercise.description}</p>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex justify-between text-xs text-slate-500 p-3 bg-white/5 rounded-lg">
                                <span>Peso da Nota</span>
                                <span className="text-white font-medium">{exercise.gradeWeight}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 p-3 bg-white/5 rounded-lg">
                                <span>Status</span>
                                <span className={`font-medium ${exercise.status === 'PUBLISHED' ? 'text-emerald-300' : 'text-yellow-300'}`}>
                                    {exercise.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                                </span>
                            </div>
                            {lastSubmission && (
                                <div className="flex justify-between text-xs text-slate-500 p-3 bg-white/5 rounded-lg">
                                    <span>Última Submissão</span>
                                    <span className="text-white font-medium">{formatDate(lastSubmission.submittedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Monaco IDE */}
                <div className="flex-1 relative">
                    <IDETerminalInner />
                </div>
            </div>
        </>
    );
}

function IDETerminalInner() {
    const { handleIntermediateCodeGeneration, intermediateCode } = useIntermediatorCode();
    return (
        <IDEView
            handleIntermediateCodeGeneration={handleIntermediateCodeGeneration}
            intermediateCode={intermediateCode}
        />
    );
}

export default function ExerciseWorkspace({ exerciseId }: { exerciseId: string }) {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [exercise, setExercise] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const id = localStorage.getItem('lms_user_id');
        if (!id) { router.push('/login'); return; }
        setUserId(id);
    }, []);

    useEffect(() => {
        if (!userId || !exerciseId) return;
        fetch(`/api/exercises/${exerciseId}`, {
            headers: { 'x-user-id': userId }
        })
            .then(r => {
                if (!r.ok) throw new Error('Not found');
                return r.json();
            })
            .then(data => { setExercise(data); setLoading(false); })
            .catch(() => { setError('Exercício não encontrado'); setLoading(false); });
    }, [userId, exerciseId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#101f22] flex items-center justify-center">
                <div className="text-slate-500">Carregando exercício...</div>
            </div>
        );
    }

    if (error || !exercise) {
        return (
            <div className="min-h-screen bg-[#101f22] flex items-center justify-center flex-col gap-4">
                <div className="text-red-400">{error || 'Erro desconhecido'}</div>
                <Link href="/dashboard" className="text-sm text-[#0dccf2] hover:underline">Voltar ao Painel</Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#101f22] text-slate-100 flex flex-col overflow-hidden font-sans">
            <SpaceBackground />
            <EditorProvider>
                <KeywordProvider>
                    <RuntimeErrorProvider>
                        <WorkspaceContent exercise={exercise} userId={userId!} />
                    </RuntimeErrorProvider>
                </KeywordProvider>
            </EditorProvider>
        </div>
    );
}
