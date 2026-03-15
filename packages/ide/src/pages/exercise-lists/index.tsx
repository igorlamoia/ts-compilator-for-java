import { SpaceBackground } from "@/components/space-background";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherView } from "@/views/exercise-lists/components/teacher-view";
import { StudentView } from "@/views/exercise-lists/components/student-view";

export default function ExerciseListsPage() {
  const { userId, user } = useAuth();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  if (!userId) return null;

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-[#0A0A0F]">
      <SpaceBackground />
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <main className="max-w-7xl mx-auto px-6 py-12 w-full">
            {isTeacher ? (
              <TeacherView classes={[]} />
            ) : (
              <StudentView />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

ExerciseListsPage.requireAuth = true;
