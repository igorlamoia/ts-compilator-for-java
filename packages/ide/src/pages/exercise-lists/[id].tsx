import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import type { ExerciseList } from "@/types/api";
import { TeacherDetailView } from "@/views/exercise-lists/components/teacher-detail-view";
import { StudentDetailView } from "@/views/exercise-lists/components/student-detail-view";
import type { ClassOption } from "@/views/exercise-lists/components/types";

export default function ExerciseListDetailPage() {
  const router = useRouter();
  const { id, classId } = router.query as { id?: string; classId?: string };
  const { userId, user } = useAuth();
  const { showToast } = useToast();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [list, setList] = useState<ExerciseList | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    if (!userId || !id) return;
    try {
      const [listRes, classesRes] = await Promise.all([
        api.get<ExerciseList>(`/exercise-lists/${id}`),
        isTeacher
          ? api.get<ClassOption[]>("/classes")
          : Promise.resolve({ data: [] }),
      ]);
      setList(listRes.data);
      setClasses(classesRes.data);
    } catch {
      showToast({ type: "error", message: "Lista não encontrada." });
      router.push("/exercise-lists");
    } finally {
      setLoading(false);
    }
  }, [userId, id, isTeacher, showToast, router]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  if (loading || !userId) {
    return (
      <div className="min-h-screen bg-[#101f22] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0dccf2]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-[#0A0A0F]">
      <SpaceBackground />
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <main className="max-w-4xl mx-auto px-6 py-10 w-full">
            {/* breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <Link href="/exercise-lists" className="hover:text-slate-300 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Listas
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-slate-300 font-medium">{list?.title ?? "..."}</span>
            </nav>

            {list &&
              (isTeacher ? (
                <TeacherDetailView
                  list={list}
                  classes={classes}
                  onRefresh={fetchList}
                />
              ) : (
                <StudentDetailView
                  list={list}
                  classId={classId ?? ""}
                />
              ))}
          </main>
        </div>
      </div>
    </div>
  );
}

ExerciseListDetailPage.requireAuth = true;
