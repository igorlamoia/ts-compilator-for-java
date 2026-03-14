import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { MembersTab } from "./components/members-tab";
import { ListsTab } from "./components/lists-tab";

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

  // Load members
  useEffect(() => {
    if (!id || !userId || !user) return;
    api
      .get(`/classes/${id}/members`, { headers: { "x-user-id": userId } })
      .then(({ data }) => setMembersData(data))
      .catch((err) => console.error("Erro ao carregar membros.", err));
  }, [id, userId, user?.id]);

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

  let classAveragePct = 0;
  if (members.length > 0 && members[0]?.progress?.total > 0) {
    let totalPct = 0;
    members.forEach((m: any) => (totalPct += m.progress.percentage));
    classAveragePct = totalPct / members.length;
  }

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-[#0A0A0F]">
      <SpaceBackground />
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <main className="max-w-7xl mx-auto px-6 py-12 w-full">
            {/* Header Section with tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#0dccf2] transition-colors mb-4 text-sm"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar ao Painel
                </Link>
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
              {activeTab === 'lists' ? (
                <ListsTab
                  exerciseLists={exerciseLists}
                  loadingLists={loadingLists}
                  isTeacher={isTeacher}
                  classId={id}
                />
              ) : (
                <MembersTab
                  teacher={teacher}
                  members={members}
                  exercises={exercises}
                  classAveragePct={classAveragePct}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

ClassDetail.requireAuth = true;
