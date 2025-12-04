import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resetPassword } from '../../services/firebase';

const LoginScreen = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password reset state
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error);
        }

        setLoading(false);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetLoading(true);

        const result = await resetPassword(resetEmail);

        if (result.success) {
            setResetSuccess(true);
        } else {
            setResetError(result.error);
        }

        setResetLoading(false);
    };

    const openResetModal = () => {
        setResetEmail(email); // Pre-fill with login email
        setResetError('');
        setResetSuccess(false);
        setShowResetModal(true);
    };

    const closeResetModal = () => {
        setShowResetModal(false);
        setResetEmail('');
        setResetError('');
        setResetSuccess(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Login Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">Iniciar Sesión</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Correo electrónico"
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Forgot password link */}
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={openResetModal}
                                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
                        {!resetSuccess ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <button
                                        onClick={closeResetModal}
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h3 className="text-lg font-semibold text-white">Recuperar Contraseña</h3>
                                </div>

                                <p className="text-slate-400 text-sm mb-4">
                                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                                </p>

                                <form onSubmit={handlePasswordReset} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="Correo electrónico"
                                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                            required
                                            disabled={resetLoading}
                                        />
                                    </div>

                                    {resetError && (
                                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm text-center">
                                            {resetError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={resetLoading}
                                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {resetLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            'Enviar enlace'
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">¡Correo enviado!</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                                </p>
                                <button
                                    onClick={closeResetModal}
                                    className="w-full bg-slate-700 text-white font-medium py-3 rounded-xl hover:bg-slate-600 transition-colors"
                                >
                                    Volver al login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginScreen;
