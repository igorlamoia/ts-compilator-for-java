import { useEffect, useState } from "react";
import { SpaceBackground } from "@/components/space-background";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useToast } from "@/contexts/ToastContext";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { ClassesGrid } from "@/views/dashboard/components/classes-grid";
import { CreateClassModal } from "@/views/dashboard/components/create-class-modal";
import { DashboardHeader } from "@/views/dashboard/components/dashboard-header";
import { JoinClassModal } from "@/views/dashboard/components/join-class-modal";

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchClasses = async () => {
    try {
      const { data: classesData } = await api.get("/classes", {
        headers: { "x-user-id": userId!, "x-org-id": organizationId || "" },
      });
      setClasses(classesData);
      setLoading(false);
    } catch (error: any) {
      showToast({
        type: "error",
        message: getApiErrorMessage(error, "Erro ao carregar turmas."),
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    api.get("/auth/me", { headers: { "x-user-id": userId } })
      .then(({ data }) => { setUser(data); fetchClasses(); });
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

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-[#0A0A0F]">
      <SpaceBackground />
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <main className="max-w-7xl mx-auto px-6 py-12 w-full">
            {/* Alerts */}
            {error && (
              <Alert variant="error" onClose={() => setError("")} className="mb-8">
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" onClose={() => setSuccess("")} className="mb-8">
                {success}
              </Alert>
            )}

            <DashboardHeader
              isTeacher={isTeacher}
              onCreateClass={() => setShowCreateClass(true)}
            />

            <ClassesGrid
              classes={classes}
              isTeacher={isTeacher}
              loading={loading}
              onJoinClass={() => setShowJoinClass(true)}
            />
          </main>

          {/* Modals */}
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

        </div>
      </div>
    </div>
  );
}

Dashboard.requireAuth = true;
