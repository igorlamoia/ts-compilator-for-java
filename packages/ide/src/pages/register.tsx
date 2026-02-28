import { SpaceBackground } from "@/components/space-background";
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

            // Save basic auth details in local storage for manual auth prototype
            localStorage.setItem('lms_user_id', data.user.id);
            localStorage.setItem('lms_org_id', data.user.organizationId);

            router.push('/dashboard');
        } catch (err) {
            setError('Erro de conexão');
        }
    };

    return (
        <div className="relative min-h-screen bg-[#101f22] text-slate-100 font-sans flex flex-col overflow-hidden selection:bg-[#0dccf2]/30 selection:text-[#0dccf2]">
            <SpaceBackground />

            {/* Navigation */}
            <nav className="relative z-10 w-full border-b border-white/5 bg-[#101f22]/50 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0dccf2] to-[#10b981] flex items-center justify-center text-[#101f22]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Java<span className="text-[#0dccf2]">--</span></h1>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Recursos</Link>
                        <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Preços</Link>
                        <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sobre</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">Entrar</Link>
                        <Link href="#" className="flex items-center justify-center h-9 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/10">
                            Docs
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Glassmorphism Card */}
                    <div className="relative bg-[#182f34]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden group">

                        {/* Decorative top gradient line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#0dccf2] via-[#10b981] to-[#0dccf2] opacity-80"></div>

                        <div className="mb-8 text-center mt-2">
                            <h2 className="text-3xl font-bold mb-2">
                                <span className="bg-linear-to-r from-[#0dccf2] to-[#10b981] bg-clip-text text-transparent">Crie sua Conta</span>
                            </h2>
                            <p className="text-slate-400 text-sm">Entre para o futuro da educação em programação com Java--.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleRegister}>
                            {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                            {/* Role Selector */}
                            <div className="flex p-1 bg-black/20 rounded-lg border border-white/5">
                                <label className="flex-1 relative cursor-pointer group">
                                    <input
                                        className="peer sr-only"
                                        name="role"
                                        type="radio"
                                        value="teacher"
                                        checked={role === "teacher"}
                                        onChange={() => setRole("teacher")}
                                    />
                                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium text-slate-400 transition-all peer-checked:bg-white/10 peer-checked:text-white peer-checked:shadow-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
                                        <span>Professor</span>
                                    </div>
                                </label>
                                <label className="flex-1 relative cursor-pointer group">
                                    <input
                                        className="peer sr-only"
                                        name="role"
                                        type="radio"
                                        value="student"
                                        checked={role === "student"}
                                        onChange={() => setRole("student")}
                                    />
                                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium text-slate-400 transition-all peer-checked:bg-white/10 peer-checked:text-white peer-checked:shadow-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        <span>Aluno</span>
                                    </div>
                                </label>
                            </div>

                            {/* Input: Full Name */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider ml-1" htmlFor="name">Nome Completo</label>
                                <div className="relative group/input">
                                    <input
                                        className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all sm:text-sm"
                                        id="name"
                                        placeholder="Digite seu nome completo"
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Input: Email */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider ml-1" htmlFor="email">Endereço de E-mail</label>
                                <div className="relative group/input">
                                    <input
                                        className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all sm:text-sm"
                                        id="email"
                                        placeholder="voce@exemplo.com"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Input: Password */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider ml-1" htmlFor="password">Senha</label>
                                <div className="relative group/input">
                                    <input
                                        className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2]/50 transition-all sm:text-sm"
                                        id="password"
                                        placeholder="Crie uma senha forte"
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button className="group relative w-full flex justify-center mt-6 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-[#101f22] bg-linear-to-r from-[#0dccf2] to-[#10b981] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#0dccf2] transition-all shadow-[0_0_20px_rgba(13,204,242,0.3)] hover:shadow-[0_0_30px_rgba(13,204,242,0.5)]" type="submit">
                                Cadastrar
                            </button>
                        </form>

                        <div className="mt-6 flex flex-col items-center gap-4">
                            <div className="relative w-full flex items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OU CONTINUE COM</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>
                            <div className="flex gap-4 w-full justify-center">
                                <button className="flex-1 flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-sm text-slate-300 font-medium">GitHub</span>
                                </button>
                                <button className="flex-1 flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-sm text-slate-300 font-medium">Google</span>
                                </button>
                            </div>

                            <p className="mt-6 text-center text-sm text-slate-400">
                                Já tem uma conta?
                                <Link href="/login" className="font-semibold text-[#0dccf2] hover:text-[#10b981] transition-colors ml-1">Entrar</Link>
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
