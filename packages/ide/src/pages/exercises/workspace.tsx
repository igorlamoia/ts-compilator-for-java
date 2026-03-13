import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";
import { EditorContext, EditorProvider } from "@/contexts/editor/EditorContext";
import { KeywordProvider } from "@/contexts/KeywordContext";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";
import { IDE } from "@/views/ide";
import { TerminalProvider } from "@/contexts/TerminalContext";
import { TestCaseResults } from "@/components/test-case-results";
import type { TTestCaseResult } from "@/pages/api/submissions/validate";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useKeywords } from "@/contexts/KeywordContext";
import { useRouter } from "next/router";
import { CheckCircle2, Circle, ChevronRight, ListChecks } from "lucide-react";
import type { ExerciseListDTO } from "@/dtos/exercise-list.dto";

// ── list navigator sidebar ───────────────────────────────────────────────────

function ListNavigatorSidebar({
  list,
  currentExerciseId,
  classId,
}: {
  list: ExerciseListDTO;
  currentExerciseId: string;
  classId?: string;
}) {
  const sorted = list.items.slice().sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIdx = sorted.findIndex((i) => i.exerciseId === currentExerciseId);
  const completedCount = sorted.filter(
    (i) => i.exercise.status === "PUBLISHED",
  ).length;

  return (
    <div className="w-52 shrink-0 border-r border-white/5 bg-[#0b1719]/80 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <ListChecks className="w-3.5 h-3.5 text-[#0dccf2] shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0dccf2]">
            Lista
          </span>
        </div>
        <p className="text-xs text-slate-300 font-medium leading-tight line-clamp-2">
          {list.title}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {sorted.map((item, idx) => {
          const isActive = item.exerciseId === currentExerciseId;
          const href = `/exercises/${item.exerciseId}${classId ? `?listId=${list.id}&classId=${classId}` : `?listId=${list.id}`}`;
          return (
            <Link
              key={item.exerciseId}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all group ${
                isActive
                  ? "bg-[#0dccf2]/10 border-l-2 border-[#0dccf2] text-[#0dccf2]"
                  : "border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/3"
              }`}
            >
              <span className="shrink-0">
                {isActive ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <Circle className="w-3 h-3 opacity-40" />
                )}
              </span>
              <span className="font-mono text-[10px] opacity-50 shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="truncate leading-tight">{item.exercise.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="text-[10px] text-slate-500 mb-1.5">
          {currentIdx + 1}/{sorted.length}
        </div>
        <div className="h-1 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981] rounded-full"
            style={{
              width: `${sorted.length > 0 ? ((currentIdx + 1) / sorted.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── workspace content ─────────────────────────────────────────────────────────

function WorkspaceContent({
  exercise,
  userId,
  list,
  classId,
}: {
  exercise: any;
  userId: string;
  list?: ExerciseListDTO;
  classId?: string;
}) {
  const { showToast } = useToast();
  const { locale } = useRouter();
  const { getEditorCode } = useContext(EditorContext);
  const { buildLexerConfig } = useKeywords();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitWarnings, setSubmitWarnings] = useState<string[]>([]);
  const [showSubmitPanel, setShowSubmitPanel] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState<
    TTestCaseResult[] | null
  >(null);
  const [testCasesPassed, setTestCasesPassed] = useState(0);
  const [testCasesTotal, setTestCasesTotal] = useState(0);

  const lastSubmission = exercise?.submissions?.[0];
  const isAlreadySubmitted =
    lastSubmission?.status === "SUBMITTED" ||
    lastSubmission?.status === "GRADED";

  const handleSubmit = async () => {
    setError("");
    setSubmitErrors([]);
    setSubmitWarnings([]);
    setShowSubmitPanel(false);
    setTestCaseResults(null);
    setSubmitted(false);

    const code = getEditorCode();
    if (!code || code.trim().length < 5) {
      setError("Escreva algum código antes de submeter!");
      return;
    }

    setSubmitting(true);
    try {
      const lexerConfig = buildLexerConfig();
      const { data } = await api.post(
        "/submissions/validate",
        {
          exerciseId: exercise.id,
          sourceCode: code,
          keywordMap: lexerConfig.keywordMap,
          blockDelimiters: lexerConfig.blockDelimiters,
          indentationBlock: lexerConfig.indentationBlock,
          grammar: lexerConfig.grammar,
          locale,
        },
        { headers: { "x-user-id": userId } },
      );

      if (!data.valid) {
        setSubmitErrors(data.errors || []);
        setSubmitWarnings(data.warnings || []);
        setShowSubmitPanel(true);
        setSubmitting(false);
        return;
      }

      if (data.warnings?.length > 0) {
        setSubmitWarnings(data.warnings);
      }
      if (data.testCaseResults) {
        setTestCaseResults(data.testCaseResults);
        setTestCasesPassed(data.testCasesPassed ?? 0);
        setTestCasesTotal(data.testCasesTotal ?? 0);
        setShowSubmitPanel(true);
      } else if (data.warnings?.length > 0) {
        setShowSubmitPanel(true);
      }
      setSubmitted(true);
      showToast({ type: "success", message: "Submissão enviada com sucesso!" });
      setSubmitting(false);
    } catch {
      setError("Erro de conexão");
      showToast({ type: "error", message: "Erro de conexão ao submeter." });
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isOverdue = new Date(exercise.deadline) < new Date();

  return (
    <>
      <header className="relative z-10 flex justify-between items-center px-6 py-3 bg-[#101f22]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link
            href={list ? `/exercise-lists/${list.id}${classId ? `?classId=${classId}` : ""}` : "/dashboard"}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            {list ? `← ${list.title}` : "← Painel"}
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <h1 className="text-lg font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent">
              {exercise.title}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-slate-500">
                Turma: {exercise.class?.name}
              </span>
              <span
                className={`text-xs ${isOverdue ? "text-red-400" : "text-slate-500"}`}
              >
                Prazo: {formatDate(exercise.deadline)}
              </span>
              {isOverdue && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                  Atrasado
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          {(submitted || isAlreadySubmitted) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs text-emerald-300 font-medium">
                ✓ Enviado
              </span>
              {lastSubmission?.score != null && (
                <span className="text-xs font-bold text-[#0dccf2]">
                  Nota: {lastSubmission.score}
                </span>
              )}
            </div>
          )}
          {isOverdue ? (
            <div className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 bg-white/5 border border-white/10 cursor-not-allowed">
              Prazo encerrado
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-linear-to-r from-[#0dccf2] to-[#10b981] text-slate-800 shadow-[0_0_15px_rgba(13,204,242,0.3)] hover:shadow-[0_0_25px_rgba(13,204,242,0.5)] hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting
                ? "Submetendo..."
                : isAlreadySubmitted || submitted
                  ? "Resubmeter"
                  : "Submeter Resposta"}
            </button>
          )}
        </div>
      </header>

      {/* Submission Results Panel */}
      {showSubmitPanel && (
        <div className="relative z-10 border-b border-white/5">
          <div
            className={`px-6 py-3 ${submitErrors.length > 0 ? "bg-red-500/5" : "bg-emerald-500/5"} backdrop-blur-md`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3
                className={`text-sm font-bold ${submitErrors.length > 0 ? "text-red-400" : "text-emerald-400"}`}
              >
                {submitErrors.length > 0
                  ? `Submissão Falhou (${submitErrors.length} erro${submitErrors.length > 1 ? "s" : ""})`
                  : "Submissão Enviada"}
              </h3>
              <button
                onClick={() => setShowSubmitPanel(false)}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Fechar
              </button>
            </div>
            {submitErrors.length > 0 && (
              <div className="space-y-1 mb-2">
                {submitErrors.map((err, i) => (
                  <div
                    key={i}
                    className="text-xs text-red-300 font-mono bg-red-500/10 px-3 py-1.5 rounded"
                  >
                    {err}
                  </div>
                ))}
              </div>
            )}
            {submitWarnings.length > 0 && (
              <div className="space-y-1">
                {submitWarnings.map((warn, i) => (
                  <div
                    key={i}
                    className="text-xs text-yellow-300 font-mono bg-yellow-500/10 px-3 py-1.5 rounded"
                  >
                    {warn}
                  </div>
                ))}
              </div>
            )}
            {testCaseResults && testCaseResults.length > 0 && (
              <div className="mt-3">
                <TestCaseResults
                  results={testCaseResults}
                  passed={testCasesPassed}
                  total={testCasesTotal}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {/* List navigator (only when listId is provided) */}
        {list && (
          <ListNavigatorSidebar
            list={list}
            currentExerciseId={exercise.id}
            classId={classId}
          />
        )}

        {/* Left: Instructions */}
        <div className="w-90 shrink-0 border-r border-white/5 bg-[#0d1a1d]/60 backdrop-blur-md overflow-y-auto">
          <div className="p-6">
            <h2 className="text-sm font-semibold text-[#0dccf2] uppercase tracking-wider mb-4">
              Instruções
            </h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {exercise.description}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex justify-between text-xs text-slate-500 p-3 bg-white/5 rounded-lg">
                <span>Peso da Nota</span>
                <span className="text-white font-medium">
                  {exercise.gradeWeight}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 p-3 bg-white/5 rounded-lg">
                <span>Status</span>
                <span
                  className={`font-medium ${exercise.status === "PUBLISHED" ? "text-emerald-300" : "text-yellow-300"}`}
                >
                  {exercise.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                </span>
              </div>
              {lastSubmission && (
                <div className="flex justify-between text-xs text-slate-500 p-3 bg-white/5 rounded-lg">
                  <span>Última Submissão</span>
                  <span className="text-white font-medium">
                    {formatDate(lastSubmission.submittedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Monaco IDE */}
        <div className="flex-1 min-w-0 relative overflow-hidden">
          <IDETerminalInner />
        </div>
      </div>
    </>
  );
}

function IDETerminalInner() {
  return <IDE />;
}

export default function ExerciseWorkspace({
  exerciseId,
  listId,
  classId,
}: {
  exerciseId: string;
  listId?: string;
  classId?: string;
}) {
  const { userId } = useAuth();
  const { showToast } = useToast();
  const [exercise, setExercise] = useState<any>(null);
  const [list, setList] = useState<ExerciseListDTO | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId || !exerciseId) return;

    const requests: [Promise<any>, Promise<any>?] = [
      api.get(`/exercises/${exerciseId}`, { headers: { "x-user-id": userId } }),
      listId
        ? api.get<ExerciseListDTO>(`/exercise-lists/${listId}`, {
            headers: { "x-user-id": userId },
          })
        : undefined,
    ].filter(Boolean) as [Promise<any>, Promise<any>?];

    Promise.all(requests)
      .then(([exerciseRes, listRes]) => {
        setExercise(exerciseRes.data);
        if (listRes) setList(listRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Exercício não encontrado");
        showToast({ type: "error", message: "Exercício não encontrado." });
        setLoading(false);
      });
  }, [exerciseId, listId, showToast, userId]);

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
        <div className="text-red-400">{error || "Erro desconhecido"}</div>
        <Link
          href="/dashboard"
          className="text-sm text-[#0dccf2] hover:underline"
        >
          Voltar ao Painel
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#101f22] text-slate-100 flex flex-col overflow-hidden font-sans">
      <SpaceBackground />
      <EditorProvider>
        <KeywordProvider>
          <RuntimeErrorProvider>
            <TerminalProvider>
              <WorkspaceContent
                exercise={exercise}
                userId={userId!}
                list={list}
                classId={classId}
              />
            </TerminalProvider>
          </RuntimeErrorProvider>
        </KeywordProvider>
      </EditorProvider>
    </div>
  );
}
