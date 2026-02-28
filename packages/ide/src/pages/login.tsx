import { SpaceBackground } from "@/components/space-background";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Falha ao entrar');
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
                        <Link href="/register" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Cadastre-se
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center relative z-10 p-6">
                {/* Login Card */}
                <div className="relative z-10 w-full max-w-[480px]">
                    <div className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
                        <BorderBeam
                            colorFrom="#0dccf2"
                            colorTo="#34d399"
                            duration={8}
                            size={80}
                        />

                        {/* Header */}
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent inline-block">
                                Bem-vindo de Volta
                            </h2>
                            <p className="text-slate-400 text-sm">Insira suas credenciais para acessar o LMS Java--</p>
                        </div>

                        {/* Form */}
                        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
                            {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                            {/* Email Field */}
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Endereço de E-mail</label>
                                <input
                                    className="w-full bg-[#101f22]/80 border border-white/10 rounded-xl h-12 pl-4 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#0dccf2] focus:ring-1 focus:ring-[#0dccf2] transition-all duration-300"
                                    placeholder="nome@empresa.com"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2 text-left">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Senha</label>
                                    <Link href="#" className="text-xs text-[#0dccf2] hover:text-emerald-400 transition-colors">Esqueceu a senha?</Link>
                                </div>
                                <input
                                    className="w-full bg-[#101f22]/80 border border-white/10 rounded-xl h-12 pl-4 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#0dccf2] focus:ring-1 focus:ring-[#0dccf2] transition-all duration-300"
                                    placeholder="••••••••"
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
                                <span className="relative z-10 flex items-center justify-center gap-2 text-[#0dccf2]">
                                    Entrar no Painel
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </ShimmerButton>
                        </form>

                        {/* Divider */}
                        <div className="relative flex py-4 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-xs text-slate-500 uppercase">Ou continue com</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className="flex items-center justify-center gap-2 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0dccf2]/30 rounded-xl transition-all text-slate-300 hover:text-white text-sm font-medium"
                                type="button"
                            >
                                Google
                            </button>
                            <button
                                className="flex items-center justify-center gap-2 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#0dccf2]/30 rounded-xl transition-all text-slate-300 hover:text-white text-sm font-medium"
                                type="button"
                            >
                                GitHub
                            </button>
                        </div>

                        {/* Footer Link */}
                        <div className="mt-8 text-center border-t border-white/10 pt-6">
                            <p className="text-slate-400 text-sm">
                                Não tem uma conta?{' '}
                                <Link href="/register" className="text-[#0dccf2] hover:text-emerald-400 font-semibold transition-colors">
                                    Cadastre-se
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
