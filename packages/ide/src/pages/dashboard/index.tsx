import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SpaceBackground } from "@/components/space-background";
import { ClipboardList, LogIn, LogOut, Plus, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { HeroButton, HeroLink } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { Subtitle } from "@/components/text/subtitle";
import { CreateClassModal } from "./components/create-class-modal";
import { JoinClassModal } from "./components/join-class-modal";
import { CreateExerciseModal } from "./components/create-exercise-modal";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
};

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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("lms_user_id") : null;
  const orgId =
    typeof window !== "undefined" ? localStorage.getItem("lms_org_id") : null;

  // Load user info
  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }
    fetch(`/api/auth/me`, { headers: { "x-user-id": userId } })
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {
        // fallback: build from localStorage
        setUser({
          id: userId,
          name: "",
          email: "",
          role: "STUDENT",
          organizationId: orgId || "",
        });
      });
  }, []);

  // Load classes
  useEffect(() => {
    if (!userId) return;
    fetchClasses();
  }, [userId]);

  const fetchClasses = () => {
    setLoading(true);
    fetch("/api/classes", {
      headers: { "x-user-id": userId!, "x-org-id": orgId || "" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClasses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  const handleClassCreated = (message: string, accessCode: string) => {
    setSuccess(message);
    fetchClasses();
  };

  const handleClassJoined = (message: string) => {
    setSuccess(message);
    fetchClasses();
  };

  const handleExerciseCreated = (message: string) => {
    setSuccess(message);
    fetchClasses();
  };

  const handleLogout = () => {
    localStorage.removeItem("lms_user_id");
    localStorage.removeItem("lms_org_id");
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans overflow-hidden">
      <SpaceBackground />

      {/* Top Nav */}
      <header className="relative z-20 w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-6 h-6 rounded-full bg-linear-to-r from-[#0dccf2] to-[#10b981] p-px">
                <div className="w-full h-full rounded-full bg-[#101f22] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#0dccf2]">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-300">
                {user?.name || user?.email}{" "}
                <span className="mx-2 text-slate-600">|</span>{" "}
                <span className="text-[#0dccf2] font-semibold tracking-wide uppercase text-xs">
                  {isTeacher ? "Professor" : "Aluno"}
                </span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2"
            >
              Sair
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Alerts */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex justify-between items-center backdrop-blur-md animate-fade-in shadow-[0_4px_20px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-200 p-1"
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex justify-between items-center backdrop-blur-md animate-fade-in shadow-[0_4px_20px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </div>
            <button
              onClick={() => setSuccess("")}
              className="text-emerald-400 hover:text-emerald-200 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <Header isTeacher={isTeacher} />
          <div className="flex gap-4">
            {isTeacher ? (
              <HeroButton
                onClick={() => setShowCreateClass(true)}
                className="group gap-2 px-6 py-3"
              >
                <Plus className="w-4.5 h-4.5 transition-transform group-hover:rotate-90" />
                Nova Turma
              </HeroButton>
            ) : (
              <HeroButton
                onClick={() => setShowJoinClass(true)}
                className="gap-2 px-6 py-3"
              >
                <LogIn className="w-4 h-4" />
                Entrar em Turma
              </HeroButton>
            )}
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
            <span className="font-medium tracking-wide">
              Carregando turmas...
            </span>
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="w-24 h-24 mb-6 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10 shadow-[inner_0_0_20px_rgba(13,204,242,0.1)]">
              <span className="text-5xl opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                📚
              </span>
            </div>
            <p className="text-slate-200 text-xl font-bold tracking-tight">
              Nenhuma turma encontrada
            </p>
            <p className="text-slate-500 text-sm mt-3 max-w-sm text-center leading-relaxed">
              {isTeacher
                ? "Você ainda não criou nenhuma turma. Clique no botão acima para começar a gerenciar seus alunos."
                : "Você não está matriculado em nenhuma turma. Use o código de acesso fornecido pelo seu professor para entrar."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls: any) => (
              <div
                key={cls.id}
                className="group overflow-hidden relative bg-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-[#0dccf2]/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(13,204,242,0.15)] hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl shadow-[0_0_10px_rgba(13,204,242,0.5)]" />

                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#0dccf2] transition-colors leading-tight pr-4">
                    {cls.name}
                  </h3>
                  {cls._count && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner shrink-0">
                      <Users className="w-4 h-4 text-[#10b981]" />{" "}
                      <span className="text-xs font-bold text-slate-200">
                        {cls._count.members || 0}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed flex-1">
                  {cls.description}
                </p>

                {isTeacher && (
                  <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md flex items-center justify-between group/code cursor-copy">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider">
                      CÓDIGO:
                    </span>
                    <span className="text-base font-mono font-bold text-[#0dccf2] tracking-widest drop-shadow-[0_0_8px_rgba(13,204,242,0.4)] group-hover/code:text-white transition-colors">
                      {cls.accessCode}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-slate-400 font-medium mb-6 px-1">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#0dccf2]/70" />
                    <span>{cls._count?.exercises || 0} exercícios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-linear-to-br from-[#0dccf2] to-[#10b981] flex items-center justify-center text-[10px] font-bold text-slate-800">
                      {(cls.teacher?.name || "P")[0].toUpperCase()}
                    </div>
                    <span>{cls.teacher?.name || "Professor"}</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-white/10 flex gap-3 mt-auto">
                  <HeroLink
                    variant="outline"
                    href={`/classes/${cls.id}`}
                    className="py-3"
                  >
                    Ver Detalhes
                  </HeroLink>
                  {isTeacher && (
                    <HeroButton
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setShowCreateExercise(true);
                      }}
                      className="flex flex-1 gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Exercício
                    </HeroButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ======= MODALS ======= */}
      <CreateClassModal
        open={showCreateClass}
        onOpenChange={setShowCreateClass}
        userId={userId!}
        orgId={orgId || ""}
        onSuccess={handleClassCreated}
        onError={setError}
      />

      <JoinClassModal
        open={showJoinClass}
        onOpenChange={setShowJoinClass}
        userId={userId!}
        onSuccess={handleClassJoined}
        onError={setError}
      />

      <CreateExerciseModal
        open={showCreateExercise}
        onOpenChange={setShowCreateExercise}
        classId={selectedClassId}
        userId={userId!}
        onSuccess={handleExerciseCreated}
        onError={setError}
      />
    </div>
  );
}

export function Header({ isTeacher }: { isTeacher: boolean }) {
  return (
    <div>
      <Title>
        <GradientText>
          {isTeacher ? "Painel do Professor" : "Meu Aprendizado"}
        </GradientText>
      </Title>
      <Subtitle className="mt-1">
        {isTeacher
          ? "Gerencie suas turmas, crie exercícios e acompanhe alunos"
          : "Suas turmas e exercícios pendentes em um só lugar"}
      </Subtitle>
    </div>
  );
}
