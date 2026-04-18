
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Wallet, ArrowLeft, CheckCircle } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot' | 'forgot_sent';

export const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
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

    /* ── Forgot password sent confirmation ── */
    if (view === 'forgot_sent') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center space-y-4">
                    <div className="flex justify-center">
                        <CheckCircle size={48} className="text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold">Revisa tu correo</h2>
                    <p className="text-muted-foreground text-sm">
                        Enviamos un enlace de recuperación a{' '}
                        <span className="font-semibold text-foreground">{email}</span>.
                        Puede tardar unos minutos.
                    </p>
                    <Button className="w-full" onClick={() => { setView('login'); setError(null); }}>
                        Volver al inicio de sesión
                    </Button>
                </Card>
            </div>
        );
    }

    /* ── Forgot password form ── */
    if (view === 'forgot') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 bg-card border-border">
                    <button
                        type="button"
                        onClick={() => { setView('login'); setError(null); }}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} /> Volver
                    </button>

                    <div className="flex flex-col items-center mb-8">
                        <div className="h-14 w-14 bg-primary/15 rounded-full flex items-center justify-center mb-4 text-primary">
                            <Wallet size={28} />
                        </div>
                        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
                        <p className="text-muted-foreground text-sm text-center mt-1">
                            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <Button className="w-full py-6 text-base" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    /* ── Login / Sign up form ── */
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 bg-card border-border">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Wallet size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Finance App</h1>
                    <p className="text-muted-foreground text-sm">Tu control financiero personal</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <Input
                            label="Nombre Completo"
                            placeholder="Juan Pérez"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    )}
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <div className="space-y-1">
                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        {!isSignUp && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setView('forgot'); setError(null); }}
                                    className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors pt-1"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <Button className="w-full py-6 text-lg" disabled={loading}>
                        {loading ? 'Procesando...' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => { setView(isSignUp ? 'login' : 'signup'); setError(null); }}
                        className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                        {isSignUp
                            ? '¿Ya tienes cuenta? Inicia sesión'
                            : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>
            </Card>
        </div>
    );
};
