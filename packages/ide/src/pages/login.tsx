import { SpaceBackground } from "@/components/space-background";
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
        <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans flex flex-col overflow-hidden">
            <SpaceBackground />

            {/* Navbar overlay */}
            <header className="w-full border-b border-slate-800 bg-[#102023]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-[#0dccf2]">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Java<span className="text-[#0dccf2]">--</span></h1>
                    </div>
                    <nav className="hidden md:flex gap-6 items-center">
                        <Link href="/" className="text-sm font-medium text-slate-400 hover:text-[#0dccf2] transition-colors">Documentação</Link>
                        <div className="h-4 w-px bg-slate-700 mx-2"></div>
                        <button className="text-sm font-bold text-white hover:text-[#0dccf2] transition-colors">Cadastrar</button>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center relative z-10 p-6">

                {/* Abstract Background Effects */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#0dccf2]/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 mix-blend-screen"></div>
                </div>

                {/* Login Card */}
                <div className="relative z-10 w-full max-w-[480px]">
                    {/* Glassmorphism Container */}
                    <div className="bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 relative overflow-hidden group">

                        {/* Subtle top border highlight */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-[#0dccf2]/50 to-transparent opacity-50"></div>

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
                                    className="w-full bg-[#101f22]/80 border border-[#315f68]/50 rounded-xl h-12 pl-4 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#0dccf2] focus:ring-1 focus:ring-[#0dccf2] transition-all duration-300"
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
                                    <Link href="#" className="text-xs text-[#0dccf2] hover:text-cyan-300 transition-colors">Esqueceu a senha?</Link>
                                </div>
                                <input
                                    className="w-full bg-[#101f22]/80 border border-[#315f68]/50 rounded-xl h-12 pl-4 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#0dccf2] focus:ring-1 focus:ring-[#0dccf2] transition-all duration-300"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="relative w-full h-12 bg-linear-to-r from-[#0dccf2] to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-[#102023] font-bold rounded-xl shadow-[0_0_20px_rgba(13,204,242,0.3)] hover:shadow-[0_0_30px_rgba(13,204,242,0.5)] transition-all duration-300 transform active:scale-[0.98] overflow-hidden group/btn mt-2"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Entrar no Painel
                                    <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                            </button>

                        </form>

                        {/* Divider */}
                        <div className="relative flex py-4 items-center">
                            <div className="flex-grow border-t border-slate-700"></div>
                            <span className="flex-shrink-0 mx-4 text-xs text-slate-500 uppercase">Ou continue com</span>
                            <div className="flex-grow border-t border-slate-700"></div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 h-11 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-all hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium" type="button">
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-3 h-11 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-all hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium" type="button">
                                GitHub
                            </button>
                        </div>

                        {/* Footer Link */}
                        <div className="mt-8 text-center border-t border-white/10 pt-6">
                            <p className="text-slate-400 text-sm">
                                Não tem uma conta?
                                <Link href="/register" className="text-[#0dccf2] hover:text-emerald-400 font-semibold transition-colors ml-1">Cadastre-se grátis</Link>
                            </p>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
