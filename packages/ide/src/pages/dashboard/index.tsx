import { useEffect, useState } from "react";
import { SpaceBackground } from "@/components/space-background";
import { ClipboardList, ListChecks, LogIn, Plus, Users } from "lucide-react";
import { HeroButton, HeroLink } from "@/components/buttons/hero";
import { GradientText } from "@/components/text/gradient";
import { Title } from "@/components/text/title";
import { Subtitle } from "@/components/text/subtitle";
import { CreateClassModal } from "./components/create-class-modal";
import { JoinClassModal } from "./components/join-class-modal";
import { CreateExerciseModal } from "./components/create-exercise-modal";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
};

export default function Dashboard() {
  const { userId, organizationId } = useAuth();
  const { showToast } = useToast();
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

  const onMount = async () => {
    const { data } = await api.get("/auth/me", {
      headers: { "x-user-id": userId },
    });
    setUser(data);
    fetchClasses();
  };

  const fetchClasses = async () => {
    try {
      const { data: classesData } = await api.get("/classes", {
        headers: { "x-user-id": userId!, "x-org-id": organizationId || "" },
      });
      setClasses(classesData);
      setLoading(false);
    } catch (error) {
      showToast({
        type: "error",
        message: error?.response?.data?.error || "Erro ao carregar turmas.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    onMount();
  }, [userId]);

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

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      <SpaceBackground />

      {/* Top Nav */}
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Alerts */}
        {error && (
          <Alert variant="error" onClose={() => setError("")} className="mb-8">
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            variant="success"
            onClose={() => setSuccess("")}
            className="mb-8"
          >
            {success}
          </Alert>
        )}

        {/* Header Section */}
        {!isTeacher ? (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Minhas Turmas</h1>
              <p className="text-slate-400 text-sm">Gerencie seu progresso acadêmico.</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button className="px-6 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
                Semestre Atual
              </button>
              <button className="px-6 py-2 rounded-lg text-slate-400 text-sm font-semibold hover:text-slate-200 transition-colors">
                Arquivadas
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <Header isTeacher={isTeacher} />
            <div className="flex gap-3">
              <HeroLink
                variant="outline"
                href="/exercise-lists"
                className="gap-2 px-5 py-2.5 text-sm"
              >
                <ListChecks className="w-4 h-4" />
                Minhas Listas
              </HeroLink>
              <HeroButton
                onClick={() => setShowCreateClass(true)}
                className="group gap-2 px-6 py-3"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                Nova Turma
              </HeroButton>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
            <span className="font-medium tracking-wide">
              Carregando turmas...
            </span>
          </div>
        ) : !isTeacher ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls: any) => (
              <div key={cls.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col group hover:border-blue-500/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
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
            ))}
            
            <button onClick={() => setShowJoinClass(true)} className="rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all p-6 flex flex-col items-center justify-center group h-full min-h-[300px]">
              <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-all mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-1 hidden sm:block">Entrar em nova turma</h3>
              <p className="text-slate-500 text-sm hidden sm:block text-center px-4">Insira o código fornecido pelo seu professor para participar.</p>
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="w-24 h-24 mb-6 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10 dark:shadow-[inner_0_0_20px_rgba(13,204,242,0.1)]">
              <span className="text-5xl opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                📚
              </span>
            </div>
            <p className="text-slate-200 text-xl font-bold tracking-tight">
              Nenhuma turma encontrada
            </p>
            <p className="text-slate-500 text-sm mt-3 max-w-sm text-center leading-relaxed">
              Você ainda não criou nenhuma turma. Clique no botão acima para começar a gerenciar seus alunos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {classes.map((cls: any) => (
              <div
                key={cls.id}
                className="group shadow-[0_1px_10px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden relative bg-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 hover:border-[#0dccf2]/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(13,204,242,0.15)] hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl shadow-[0_0_10px_rgba(13,204,242,0.5)]" />

                <div className="flex justify-between items-start mb-4">
                  <h3 className="capitalize text-xl font-bold  group-hover:text-[#0dccf2] transition-colors leading-tight pr-4">
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
                  <div className="mb-6 p-4 bg-gray-400/20 rounded-2xl border border-white/5 backdrop-blur-md flex items-center justify-between group/code cursor-copy">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider">
                      CÓDIGO:
                    </span>
                    <span className="text-base font-mono font-bold text-[#0dccf2] tracking-widest drop-shadow-[0_0_8px_rgba(13,204,242,0.4)] group-hover/code:text-accent-foreground transition-colors">
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
        orgId={organizationId || ""}
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

Dashboard.requireAuth = true;

function Header({ isTeacher }: { isTeacher: boolean }) {
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
