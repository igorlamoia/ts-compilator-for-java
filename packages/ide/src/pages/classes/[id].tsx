import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { BookOpen, ChevronRight } from "lucide-react";

export default function ClassDetail() {
  const router = useRouter();
  const { userId } = useAuth();
  const { showToast } = useToast();
  const { id } = router.query;
  const [exercises, setExercises] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({});
  const [expandedEx, setExpandedEx] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [membersData, setMembersData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"members" | "lists">("members");
  const [exerciseLists, setExerciseLists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Load user info
  useEffect(() => {
    if (!userId) return;
    api
      .get("/auth/me", { headers: { "x-user-id": userId } })
      .then(({ data }) => setUser(data))
      .catch(() => {
        showToast({ type: "error", message: "Erro ao carregar usuário." });
      });
  }, [showToast, userId]);

  // Load exercises
  useEffect(() => {
    if (!id || !userId) return;
    api
      .get("/exercises", {
        params: { classId: id },
        headers: { "x-user-id": userId },
      })
      .then(({ data }) => data)
      .then((data) => {
        if (Array.isArray(data)) setExercises(data);
        setLoading(false);
      })
      .catch(() => {
        showToast({ type: "error", message: "Erro ao carregar exercícios." });
        setLoading(false);
      });
  }, [id, showToast, userId]);

  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  // Load members — both teacher and student can see members
  useEffect(() => {
    if (!id || !userId || !user) return;
    api
      .get(`/classes/${id}/members`, { headers: { "x-user-id": userId } })
      .then(({ data }) => setMembersData(data))
      .catch((err) => console.error("Erro ao carregar membros.", err));
  }, [id, userId, user]);

  // Load exercise lists for this class
  useEffect(() => {
    if (!id || !userId) return;
    setLoadingLists(true);
    api
      .get(`/classes/${id}/exercise-lists`, { headers: { "x-user-id": userId } })
      .then(({ data }) => { if (Array.isArray(data)) setExerciseLists(data); })
      .catch(() => showToast({ type: "error", message: "Erro ao carregar listas." }))
      .finally(() => setLoadingLists(false));
  }, [id, userId, showToast]);

  const loadSubmissions = async (exerciseId: string) => {
    if (expandedEx === exerciseId) {
      setExpandedEx(null);
      return;
    }
    setExpandedEx(exerciseId);
    if (submissions[exerciseId]) return;

    try {
      const { data } = await api.get("/submissions", {
        params: { exerciseId },
        headers: { "x-user-id": userId! },
      });
      if (Array.isArray(data)) {
        setSubmissions((prev) => ({ ...prev, [exerciseId]: data }));
      }
    } catch {
      showToast({ type: "error", message: "Erro ao carregar submissões." });
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMySubmission = (ex: any) => {
    if (ex.submissions && ex.submissions.length > 0) return ex.submissions[0];
    return null;
  };

  if (!user || loading) {
    return (
      <div className="relative min-h-screen bg-[#101f22] text-slate-100 flex items-center justify-center">
        <SpaceBackground />
        <div className="w-12 h-12 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
      </div>
    );
  }

  const teacher = membersData?.teacher;
  const members = membersData?.members || [];

  // Calculate average class score dynamically
  let classAveragePct = 0;
  if (members.length > 0 && members[0]?.progress?.total > 0) {
    let totalPct = 0;
    members.forEach((m: any) => (totalPct += m.progress.percentage));
    classAveragePct = totalPct / members.length;
  }

  // ─── Teacher Exercises Tab (with submissions) ───
  const renderTeacherExercisesTab = () => (
    <div className="space-y-6">
      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="w-24 h-24 mb-6 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10">
            <span className="text-5xl opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">📝</span>
          </div>
          <p className="text-slate-200 text-xl font-bold tracking-tight">
            Nenhum exercício nesta turma ainda.
          </p>
        </div>
      ) : (
        exercises.map((ex: any) => (
          <div key={ex.id} className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden hover:border-[#0dccf2]/30 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(13,204,242,0.1)]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-[#0dccf2] to-[#10b981] opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-white/5 transition-colors gap-6" onClick={() => loadSubmissions(ex.id)}>
              <div className="flex-1 pl-2">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#0dccf2] transition-colors">{ex.title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                  {ex.description?.substring(0, 150)}{ex.description?.length > 150 ? "..." : ""}
                </p>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:items-end justify-center shrink-0 pr-2 gap-4">
                <div className="text-xs font-semibold text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  Peso <span className="text-white ml-1 text-sm">{ex.gradeWeight}</span>
                </div>
                <Link href={`/exercises/${ex.id}`} onClick={(e) => e.stopPropagation()} className="px-5 py-2 rounded-xl bg-linear-to-r from-[#0dccf2]/10 to-[#10b981]/10 hover:from-[#0dccf2] hover:to-[#10b981] border border-[#0dccf2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50 text-[#0dccf2] hover:text-slate-800 font-bold transition-all duration-300 shadow-[0_0_15px_rgba(13,204,242,0.1)] hover:shadow-[0_0_20px_rgba(13,204,242,0.4)]">
                  Abrir no IDE
                </Link>
              </div>
            </div>
            {expandedEx === ex.id && (
              <div className="border-t border-white/10 bg-black/40 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 pl-2">
                  <h4 className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                    Submissões <span className="ml-2 bg-white/10 text-white px-2.5 py-1 rounded-full text-xs">{submissions[ex.id]?.length || 0}</span>
                  </h4>
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
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${sub.status === "GRADED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : sub.status === "SUBMITTED" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"}`}>
                            {sub.status === "GRADED" ? "✅ Corrigido" : sub.status === "SUBMITTED" ? "📩 Enviado" : "⏳ Pendente"}
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
            {expandedEx !== ex.id && (
              <div className="border-t border-white/5 px-8 py-3 bg-black/20 cursor-pointer hover:bg-black/40 transition-colors flex justify-center items-center gap-2 text-slate-500 hover:text-[#0dccf2]" onClick={() => loadSubmissions(ex.id)}>
                <span className="text-xs font-bold uppercase tracking-widest">Ver submissões</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // ─── Student Exercises Tab (with personal submission status) ───
  const renderStudentExercisesTab = () => (
    <div className="space-y-6">
      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <p className="text-slate-200 text-xl font-bold tracking-tight">
            Nenhum exercício nesta turma ainda.
          </p>
        </div>
      ) : (
        exercises.map((ex: any) => {
          const mySub = getMySubmission(ex);
          return (
            <div key={ex.id} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden hover:border-[#0dccf2]/30 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(13,204,242,0.1)] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex-1 pl-2">
                  <h3 className="text-2xl font-bold text-white mb-2">{ex.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                    {ex.description?.substring(0, 150)}{ex.description?.length > 150 ? "..." : ""}
                  </p>
                </div>
                <div className="w-full sm:w-auto flex flex-col sm:items-end justify-center shrink-0 gap-4">
                  <div className="text-xs font-semibold text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                    Peso <span className="text-white ml-1 text-sm">{ex.gradeWeight}</span>
                  </div>
                  <Link href={`/exercises/${ex.id}`} className="px-5 py-2 rounded-xl bg-linear-to-r from-[#0dccf2]/10 to-[#10b981]/10 hover:from-[#0dccf2] hover:to-[#10b981] border border-[#0dccf2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#0dccf2]/50 text-[#0dccf2] hover:text-slate-800 font-bold transition-all duration-300 shadow-[0_0_15px_rgba(13,204,242,0.1)] hover:shadow-[0_0_20px_rgba(13,204,242,0.4)]">
                    Abrir no IDE
                  </Link>
                </div>
              </div>
              {mySub && (
                <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${mySub.status === "GRADED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : mySub.status === "SUBMITTED" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                    {mySub.status === "GRADED" ? "✅ Corrigido" : mySub.status === "SUBMITTED" ? "📩 Enviado" : "⏳ Pendente"}
                  </span>
                  {mySub.score != null && (
                    <span className="text-sm font-bold text-slate-300">Nota: <span className="text-lg text-emerald-400">{mySub.score}</span>/10</span>
                  )}
                </div>
              )}
              {!mySub && (
                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-sm text-slate-400 font-medium italic">Você ainda não enviou uma solução para este exercício.</p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  // ─── Members Tab (shared for both teacher and student) ───
  const renderMembersTab = () => (
    <div className="grid grid-cols-12 gap-8">
      {/* Members List Section */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        {/* Teacher Card */}
        {teacher && (
          <section>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Professor</h3>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-[#0dccf2] border border-white/10 shadow-[0_8px_32px_rgba(13,204,242,0.1)]">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {teacher.avatarUrl ? (
                    <img src={teacher.avatarUrl} alt={teacher.name} className="w-16 h-16 rounded-2xl border-2 border-[#0dccf2]/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#0dccf2]/20 flex items-center justify-center text-[#0dccf2] text-xl font-bold border-2 border-[#0dccf2]/20">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-[#0dccf2] text-slate-900 text-[10px] font-black px-2 py-1 rounded-md shadow-lg">PRO</div>
                </div>
                <div>
                  <h4 className="text-white text-lg font-bold">{teacher.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[#0dccf2]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Verified
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {teacher.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Students Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Estudantes ({members.length})</h3>
          </div>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/2 rounded-2xl border border-white/5 backdrop-blur-xl">
              <p className="text-slate-400 text-sm font-medium">Nenhum estudante inscrito nesta turma ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member: any) => (
                <div key={member.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-[#0dccf2]/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-xl" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold border border-white/5">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-bold">{member.name}</p>
                      <p className="text-slate-500 text-xs truncate max-w-[120px]">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-1 bg-[#0dccf2]/10 text-[#0dccf2] rounded text-[10px] font-bold">
                      {member.progress?.completed || 0}/{member.progress?.total || 0} CONCLUÍDOS
                    </div>
                    <div className="w-20 h-1 bg-black/40 rounded-full mt-2 ml-auto overflow-hidden">
                      <div className="h-full bg-[#0dccf2]" style={{ width: `${member.progress?.percentage || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right Stats Sidebar */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0dccf2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Turma Stats
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">Total de Estudantes</span>
                <span className="text-white font-bold">{members.length}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">Total de Exercícios</span>
                <span className="text-white font-bold">{exercises.length}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">Média de Conclusões</span>
                <span className="text-white font-bold">{classAveragePct.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981]" style={{ width: `${classAveragePct}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Lists Tab ───────────────────────────────────────────────────────────────
  const renderListsTab = () => {
    if (loadingLists) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#0dccf2]/20 border-t-[#0dccf2] animate-spin" />
          <span className="text-sm font-medium">Carregando listas...</span>
        </div>
      );
    }

    if (exerciseLists.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 bg-white/2 rounded-3xl border border-white/5 backdrop-blur-xl">
          <div className="w-20 h-20 mb-5 rounded-full bg-linear-to-br from-[#0dccf2]/10 to-[#10b981]/10 flex items-center justify-center border border-white/10">
            <BookOpen className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-200 text-lg font-bold">Nenhuma lista publicada</p>
          <p className="text-slate-500 text-sm mt-2 max-w-xs text-center leading-relaxed">
            {isTeacher
              ? "Publique uma lista de exercícios para esta turma em 'Minhas Listas'."
              : "Seu professor ainda não publicou listas para esta turma."}
          </p>
        </div>
      );
    }

    if (isTeacher) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exerciseLists.map((entry: any) => (
            <div key={entry.exerciseListId} className="group relative bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/35 hover:shadow-[0_4px_24px_rgba(13,204,242,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-[#0dccf2] to-[#10b981] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
              <h3 className="font-bold text-slate-100 leading-snug line-clamp-2">{entry.exerciseList.title}</h3>
              {entry.exerciseList.description && (
                <p className="text-xs text-slate-400 line-clamp-2">{entry.exerciseList.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0dccf2]/60" />
                  {entry.totalCount} exercício{entry.totalCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  Mínimo: {entry.minRequired}
                </span>
              </div>
              <div className="mt-auto pt-3 border-t border-white/5">
                <Link
                  href={`/exercise-lists/${entry.exerciseListId}`}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-xs font-semibold hover:bg-[#0dccf2]/20 transition-colors"
                >
                  Gerenciar
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        {exerciseLists.map((entry: any) => {
          const progress = entry.totalCount > 0 ? Math.round((entry.completedCount / entry.totalCount) * 100) : 0;
          const statusCls =
            entry.completedCount >= entry.minRequired
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
              : entry.completedCount > 0
              ? "bg-blue-500/15 text-blue-300 border-blue-500/25"
              : "bg-slate-500/15 text-slate-400 border-slate-500/25";
          const statusText =
            entry.completedCount >= entry.minRequired ? "Concluída" : entry.completedCount > 0 ? "Em andamento" : "Não iniciada";

          return (
            <div key={entry.exerciseListId} className="group bg-white/3 backdrop-blur-xl border border-white/8 rounded-2xl p-5 hover:border-[#0dccf2]/30 hover:shadow-[0_4px_24px_rgba(13,204,242,0.08)] transition-all duration-300">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-bold text-slate-100 leading-snug">{entry.exerciseList.title}</h3>
                <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusCls}`}>
                  {statusText}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
                  Mínimo: {entry.minRequired} exercício{entry.minRequired !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>{entry.completedCount} de {entry.totalCount} concluídos</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-[#0dccf2] to-[#10b981] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <Link
                href={`/exercise-lists/${entry.exerciseListId}?classId=${id}`}
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0dccf2]/10 border border-[#0dccf2]/20 text-[#0dccf2] text-sm font-semibold hover:bg-[#0dccf2]/20 hover:shadow-[0_0_12px_rgba(13,204,242,0.2)] transition-all"
              >
                Abrir Lista
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-[#0A0A0F]">
      <SpaceBackground />
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          {/* Header bar */}
          <header className="relative z-20 w-full border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0dccf2]/40 transition-all duration-300 hover:shadow-[0_0_15px_rgba(13,204,242,0.2)]"
                >
                  <svg
                    className="w-5 h-5 text-[#0dccf2] group-hover:-translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Detalhes da Turma
                </h1>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-12 w-full">
            {/* Header Section with tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-2 text-[#0dccf2] mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                  <span className="text-xs font-bold uppercase tracking-wider">Dashboard da Turma</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Recursos & Estudantes</h1>
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'lists' ? 'bg-[#0dccf2]/20 text-[#0dccf2] shadow-lg shadow-[#0dccf2]/20' : 'text-slate-400 hover:text-slate-200'}`}
                  onClick={() => setActiveTab('lists')}
                >
                  Listas
                </button>
<button
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'members' ? 'bg-[#0dccf2]/20 text-[#0dccf2] shadow-lg shadow-[#0dccf2]/20' : 'text-slate-400 hover:text-slate-200'}`}
                  onClick={() => setActiveTab('members')}
                >
                  Todos da Turma
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="py-6">
              {activeTab === 'lists'
                ? renderListsTab()
                : renderMembersTab()
              }
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

ClassDetail.requireAuth = true;
