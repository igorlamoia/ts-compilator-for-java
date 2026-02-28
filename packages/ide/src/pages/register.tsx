import { SpaceBackground } from "@/components/space-background";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Falha ao cadastrar');
                return;
            }

            localStorage.setItem('lms_user_id', data.user.id);
            localStorage.setItem('lms_org_id', data.user.organizationId);

            router.push('/dashboard');
        } catch (err) {
            setError('Erro de conexão');
        }
    };

    return (
        <div className="relative min-h-screen text-slate-100 font-sans flex flex-col overflow-hidden">
            <SpaceBackground />

            {/* Navbar */}
            <header className="w-full border-b border-white/5 bg-[#101f22]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0dccf2] to-emerald-400 flex items-center justify-center text-[#101f22]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Java<span className="text-[#0dccf2]">--</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Entrar
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="relative bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
                        <BorderBeam
                            colorFrom="#0dccf2"
                            colorTo="#34d399"
                            duration={8}
                            size={80}
                        />

                        <div className="mb-8 text-center mt-2">
                            <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent inline-block">
                                Crie sua Conta
                            </h2>
                            <p className="text-slate-400 text-sm">Entre para o futuro da educação em programação com Java--.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleRegister}>
                            {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                            {/* Role Selector */}
                            <div className="flex p-1 bg-black/20 rounded-lg border border-white/5">
                                <label className="flex-1 relative cursor-pointer">
                                    <input
                                        className="peer sr-only"
                                        name="role"
                                        type="radio"
                                        value="teacher"
                                        checked={role === "teacher"}
                                        onChange={() => setRole("teacher")}
                                    />
                                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium text-slate-400 transition-all peer-checked:bg-white/10 peer-checked:text-[#0dccf2] peer-checked:shadow-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        </svg>
                                        <span>Professor</span>
                                    </div>
                                </label>
                                <label className="flex-1 relative cursor-pointer">
                                    <input
                                        className="peer sr-only"
                                        name="role"
                                        type="radio"
                                        value="student"
                                        checked={role === "student"}
                                        onChange={() => setRole("student")}
                                    />
                                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium text-slate-400 transition-all peer-checked:bg-white/10 peer-checked:text-[#0dccf2] peer-checked:shadow-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Aluno</span>
                                    </div>
                                </label>
                            </div>

                            {/* Input: Full Name */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1" htmlFor="name">Nome Completo</label>
                                <input
                                    className="block w-full px-4 py-3 bg-[#101f22]/80 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2] focus:border-[#0dccf2] transition-all sm:text-sm"
                                    id="name"
                                    placeholder="Digite seu nome completo"
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Input: Email */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1" htmlFor="email">Endereço de E-mail</label>
                                <input
                                    className="block w-full px-4 py-3 bg-[#101f22]/80 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2] focus:border-[#0dccf2] transition-all sm:text-sm"
                                    id="email"
                                    placeholder="voce@exemplo.com"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Input: Password */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1" htmlFor="password">Senha</label>
                                <input
                                    className="block w-full px-4 py-3 bg-[#101f22]/80 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2] focus:border-[#0dccf2] transition-all sm:text-sm"
                                    id="password"
                                    placeholder="Crie uma senha forte"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <ShimmerButton
                                type="submit"
                                className="w-full h-12 font-bold mt-2 rounded-xl"
                                shimmerColor="#0dccf2"
                                shimmerDuration="2.5s"
                                borderRadius="0.75rem"
                                background="rgba(13, 40, 45, 0.95)"
                            >
                                <span className="text-[#0dccf2] font-bold">Cadastrar</span>
                            </ShimmerButton>
                        </form>

                        <div className="mt-6 flex flex-col items-center gap-4">
                            <div className="relative w-full flex items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OU CONTINUE COM</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>
                            <div className="flex gap-4 w-full">
                                <button className="flex-1 flex justify-center items-center py-2.5 px-4 border border-white/10 hover:border-[#0dccf2]/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-300 hover:text-white text-sm font-medium" type="button">
                                    GitHub
                                </button>
                                <button className="flex-1 flex justify-center items-center py-2.5 px-4 border border-white/10 hover:border-[#0dccf2]/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-300 hover:text-white text-sm font-medium" type="button">
                                    Google
                                </button>
                            </div>

                            <p className="mt-4 text-center text-sm text-slate-400">
                                Já tem uma conta?{' '}
                                <Link href="/login" className="font-semibold text-[#0dccf2] hover:text-emerald-400 transition-colors">Entrar</Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-slate-600">
                        © 2024 Java--. Todos os direitos reservados.
                    </p>
                </div>
            </main>
        </div>
    );
}
