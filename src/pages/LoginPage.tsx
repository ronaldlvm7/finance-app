import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle, Wallet } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot' | 'forgot_sent';

const InputField = ({
    label, type = 'text', placeholder, value, onChange, required, rightSlot
}: {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    rightSlot?: React.ReactNode;
}) => (
    <div>
        <p className="text-[11px] font-700 text-muted-foreground mb-1.5 uppercase tracking-wider" style={{ fontWeight: 700 }}>{label}</p>
        <div className="flex items-center bg-card rounded-2xl border border-border px-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="flex-1 py-4 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-[15px]"
            />
            {rightSlot}
        </div>
    </div>
);

export const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (view === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { name } },
                });
                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu correo para confirmar (si está habilitado) o inicia sesión.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setView('forgot_sent');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isSignUp = view === 'signup';

    /* ── Forgot sent ── */
    if (view === 'forgot_sent') {
        return (
            <div className="min-h-dvh bg-background flex items-center justify-center p-6">
                <div className="w-full max-w-sm text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
                        <CheckCircle size={32} className="text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-1">Revisa tu correo</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Enviamos un enlace a <span className="font-semibold text-foreground">{email}</span>.
                            Puede tardar unos minutos.
                        </p>
                    </div>
                    <button
                        onClick={() => { setView('login'); setError(null); }}
                        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] transition-all active:scale-[0.98]"
                        style={{ boxShadow: '0 4px 20px rgba(245,156,42,0.4)' }}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        );
    }

    /* ── Forgot password ── */
    if (view === 'forgot') {
        return (
            <div className="min-h-dvh bg-background flex flex-col p-6">
                <button
                    type="button"
                    onClick={() => { setView('login'); setError(null); }}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors w-fit"
                >
                    <ArrowLeft size={16} /> Volver
                </button>

                <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
                    <div className="mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
                            <Wallet size={26} />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">Recuperar contraseña</h1>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Ingresa tu correo y te enviaremos un enlace para restablecerla.
                        </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <InputField
                            label="Correo"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] disabled:opacity-60 transition-all active:scale-[0.98]"
                            style={{ boxShadow: '0 4px 20px rgba(245,156,42,0.4)' }}
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    /* ── Login / Sign up ── */
    return (
        <div className="min-h-dvh bg-background flex flex-col px-6 py-8">
            {/* Hero */}
            <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
                <div className="mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6"
                        style={{ boxShadow: '0 8px 24px rgba(245,156,42,0.4)' }}
                    >
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <path d="M6 24V12l10-8 10 8v12H20v-7h-8v7H6z" fill="white"/>
                            <rect x="12" y="17" width="8" height="7" rx="1" fill="white" opacity="0.5"/>
                        </svg>
                    </div>
                    <h1 className="text-[26px] font-bold text-foreground mb-2">
                        {isSignUp ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
                    </h1>
                    <p className="text-muted-foreground text-[14px] leading-relaxed">
                        {isSignUp
                            ? 'Empieza a controlar tus finanzas personales'
                            : 'Gestiona tus finanzas con claridad y control'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-3">
                    {isSignUp && (
                        <InputField
                            label="Nombre completo"
                            placeholder="Juan Pérez"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    )}
                    <InputField
                        label="Correo"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <InputField
                        label="Contraseña"
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        rightSlot={
                            <button type="button" onClick={() => setShowPass(s => !s)} className="text-muted-foreground hover:text-foreground transition-colors ml-2 py-4">
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />

                    {!isSignUp && (
                        <div className="text-right pt-0.5">
                            <button
                                type="button"
                                onClick={() => { setView('forgot'); setError(null); }}
                                className="text-[13px] text-primary font-semibold"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] disabled:opacity-60 transition-all active:scale-[0.98]"
                            style={{ boxShadow: '0 4px 20px rgba(245,156,42,0.4)' }}
                        >
                            {loading ? 'Procesando...' : (isSignUp ? 'Crear cuenta' : 'Iniciar sesión')}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-[13px] text-muted-foreground">
                    {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                    <button
                        type="button"
                        onClick={() => { setView(isSignUp ? 'login' : 'signup'); setError(null); }}
                        className="text-primary font-bold"
                    >
                        {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                    </button>
                </div>
            </div>
        </div>
    );
};
