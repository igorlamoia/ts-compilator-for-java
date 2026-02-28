import { useRouter } from 'next/router';
import ExerciseWorkspace from './workspace';

export default function ExercisePage() {
    const router = useRouter();
    const { id } = router.query;

    if (!id || typeof id !== 'string') return <div className="p-8 text-white">Carregando...</div>;

    return <ExerciseWorkspace exerciseId={id} />;
}
