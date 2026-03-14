import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { isAxiosError } from "axios";
import { SubmissionInfoBar } from "./components/submission-info-bar";
import { GradingPanel } from "./components/grading-panel";
import { SubmittedCodePanel } from "./components/submitted-code-panel";

export default function GradeSubmission() {
  const router = useRouter();
  const { userId } = useAuth();
  const { showToast } = useToast();
  const { id } = router.query;
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [compileResult, setCompileResult] = useState<any>(null);
  const [compiling, setCompiling] = useState(false);

  useEffect(() => {
    if (!id || !userId) return;
    api
      .get(`/submissions/${id}`, { headers: { "x-user-id": userId } })
      .then(({ data }) => {
        setSubmission(data);
        if (data.score != null) setScore(String(data.score));
        if (data.teacherFeedback) setFeedback(data.teacherFeedback);
        setLoading(false);
      })
      .catch(() => {
        setError("Submissão não encontrada");
        showToast({ type: "error", message: "Submissão não encontrada." });
        setLoading(false);
      });
  }, [id, showToast, userId]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await api.patch(
        `/submissions/${id}`,
        { score: Number(score), teacherFeedback: feedback },
        { headers: { "x-user-id": userId! } },
      );
      setSaved(true);
      setSaving(false);
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.error || "Erro ao salvar nota"
        : "Erro de conexão";
      setError(message);
      showToast({ type: "error", message });
      setSaving(false);
    }
  };

  const handleRecompile = async () => {
    if (!submission?.codeSnapshot) return;
    setCompiling(true);
    setCompileResult(null);
    try {
      const { data } = await api.post(
        "/submissions/validate",
        { exerciseId: submission.exerciseId, sourceCode: submission.codeSnapshot },
        { params: { dryRun: "true" }, headers: { "x-user-id": userId! } },
      );
      setCompileResult(data);
    } catch {
      setCompileResult({ valid: false, errors: ["Erro de conexão"], warnings: [] });
      showToast({ type: "error", message: "Erro ao recompilar submissão." });
    } finally {
      setCompiling(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
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
        <Link href="/dashboard" className="text-sm text-[#0dccf2] hover:underline">
          Voltar ao Painel
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans overflow-hidden">
      <SpaceBackground />

      <header className="relative z-20 w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Painel
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-lg font-bold text-white">Correção de Exercício</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <SubmissionInfoBar submission={submission} formatDate={formatDate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SubmittedCodePanel
            codeSnapshot={submission?.codeSnapshot}
            exerciseDescription={submission?.exercise?.description}
            compileResult={compileResult}
            compiling={compiling}
            onRecompile={handleRecompile}
          />

          <GradingPanel
            score={score}
            setScore={setScore}
            feedback={feedback}
            setFeedback={setFeedback}
            saving={saving}
            saved={saved}
            error={error}
            onSubmit={handleGrade}
            submissionStatus={submission?.status}
          />
        </div>
      </main>
    </div>
  );
}

GradeSubmission.requireAuth = true;
