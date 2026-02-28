import { useState, useEffect } from "react";
import { IDEFunction } from "@/views/ide-terminal-wrapper";
import { SpaceBackground } from "@/components/space-background";

export default function ExerciseWorkspace({ exerciseId }: { exerciseId: string }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [exercise, setExercise] = useState<any>(null);
    const [isOpenKeywordCustomizer, setIsOpenKeywordCustomizer] = useState(false);

    useEffect(() => {
        setUserId(localStorage.getItem('lms_user_id'));
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        // In a real scenario, fetch the specific exercise details here
        setExercise({
            title: "Sample Java-- Exercise",
            description: "Write a function that returns 'Hello World'.",
            deadline: new Date().toISOString()
        });
    }, [exerciseId]);

    if (!isLoaded || !userId) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden font-sans">
            <SpaceBackground />

            <header className="relative z-10 flex justify-between items-center p-4 bg-white/5 backdrop-blur-md border-b border-white/10">
                <div>
                    <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        {exercise?.title || "Exercise Workspace"}
                    </h1>
                    <p className="text-sm text-gray-400">Due: {exercise ? new Date(exercise.deadline).toLocaleDateString() : 'N/A'}</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2">
                    Submit Solution
                </button>
            </header>

            <div className="relative z-10 flex flex-1 h-[calc(100vh-80px)] overflow-hidden">
                {/* Left side: Instructions */}
                <div className="w-1/3 p-6 border-r border-white/10 bg-white/5 backdrop-blur-md overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 text-emerald-300">Instructions</h2>
                    <div className="prose prose-invert prose-sm">
                        <p>{exercise?.description}</p>
                    </div>
                </div>

                {/* Right side: The existing Monaco IDE */}
                <div className="flex-1 w-2/3 relative">
                    <IDEFunction
                        isOpenKeywordCustomizer={isOpenKeywordCustomizer}
                        setIsOpenKeywordCustomizer={setIsOpenKeywordCustomizer}
                    />
                </div>
            </div>
        </div>
    );
}
