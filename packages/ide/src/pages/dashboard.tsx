import { useEffect, useState } from "react";
import Link from 'next/link';
import { SpaceBackground } from "@/components/space-background";

export default function Dashboard() {
    const [classes, setClasses] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('lms_user_id');
        const storedOrgId = localStorage.getItem('lms_org_id');
        setUserId(storedUserId);
        setOrgId(storedOrgId);
    }, []);

    useEffect(() => {
        if (!userId) return;

        fetch('/api/classes', {
            headers: {
                'x-user-id': userId,
                'x-org-id': orgId || ''
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setClasses(data);
                // Simple role heuristic based on actual data
                if (data.length > 0 && orgId) {
                    setRole('teacher');
                }
            })
            .catch(console.error);
    }, [userId, orgId]);

    const isTeacher = !!orgId;

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden p-8 font-sans">
            <SpaceBackground />
            <div className="relative z-10 max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-12 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                    <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        LMS Dashboard
                    </h1>
                    <div className="flex gap-4 items-center text-sm font-mono text-gray-400">
                        Current User: {userId}
                    </div>
                </header>

                <section className="bg-white/5 p-8 rounded-2xl backdrop-blur-md border border-white/10">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-semibold tracking-tight">{isTeacher ? "Your Classes" : "Enrolled Classes"}</h2>
                        {isTeacher ? (
                            <button className="bg-blue-600/80 hover:bg-blue-500 px-5 py-2.5 rounded-xl transition-all shadow-lg font-medium">
                                + Create Class
                            </button>
                        ) : (
                            <button className="bg-emerald-600/80 hover:bg-emerald-500 px-5 py-2.5 rounded-xl transition-all shadow-lg font-medium">
                                Join Class
                            </button>
                        )}
                    </div>

                    {classes.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-white/5 rounded-xl border border-white/5">
                            <p>No classes found.</p>
                            <p className="text-sm mt-2">{isTeacher ? "Create one to get started." : "Join a class using an access code."}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((cls: any) => (
                                <Link href={`/classes/${cls.id}`} key={cls.id}>
                                    <div className="group bg-white/5 p-6 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg">
                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-300 transition-colors">{cls.name}</h3>
                                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{cls.description}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            {isTeacher && <span className="text-xs font-mono bg-blue-900/50 text-blue-300 px-2 py-1 rounded">Code: {cls.accessCode}</span>}
                                            <span className="text-xs text-gray-400 ml-auto">View Details &rarr;</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
