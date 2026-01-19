import React, { useState, useEffect } from 'react';
import { Cloud, Upload, Download, LogOut, CheckCircle2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { initGoogleDrive, uploadBackupFile, findBackupFile, downloadBackupFile } from '../../services/driveService';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { useCollection } from '../../context/CollectionContext';

// Componente de login para Web (usa @react-oauth/google)
const WebGoogleLogin = ({ onSuccess, onError, modoOscuro }) => {
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            onSuccess(codeResponse.access_token);
        },
        onError: (error) => {
            console.log('Login Failed:', error);
            onError(error.message || 'Error desconocido');
        },
        scope: 'https://www.googleapis.com/auth/drive.file',
    });

    return (
        <button
            onClick={() => login()}
            className={`w-full group relative overflow-hidden flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${modoOscuro
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm hover:shadow'
                }`}
        >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Conectar con Google Drive</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
    );
};

const DriveSection = ({ onClose, modoOscuro, clientId, compact = false }) => {
    const { importarBackup, generateCompressedBackupData } = useCollection();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [driveStatus, setDriveStatus] = useState('');
    const [backupFound, setBackupFound] = useState(null);
    const isNative = Capacitor.isNativePlatform();

    // Inicializar el plugin de social login en Android
    useEffect(() => {
        const initSocialLogin = async () => {
            if (isNative && clientId) {
                try {
                    await SocialLogin.initialize({
                        google: {
                            webClientId: clientId,
                        }
                    });
                } catch (error) {
                    console.error('Error initializing SocialLogin:', error);
                }
            }
        };
        initSocialLogin();
    }, [isNative, clientId]);

    // Auto-login on mount if token exists
    useEffect(() => {
        const savedToken = localStorage.getItem('google_drive_token');
        if (savedToken) {
            try {
                const tokenData = JSON.parse(savedToken);
                setUser(tokenData);
                initializeDrive(tokenData.access_token);
            } catch (error) {
                console.error('Error loading saved token:', error);
                localStorage.removeItem('google_drive_token');
            }
        }
    }, []);

    // Login nativo para Android usando Capacitor plugin
    const handleNativeLogin = async () => {
        try {
            setLoading(true);
            const result = await SocialLogin.login({
                provider: 'google',
                options: {
                    scopes: ['email', 'profile', 'https://www.googleapis.com/auth/drive.file'],
                }
            });

            if (result?.result?.accessToken) {
                const tokenData = { access_token: result.result.accessToken.token };
                setUser(tokenData);
                localStorage.setItem('google_drive_token', JSON.stringify(tokenData));
                await initializeDrive(tokenData.access_token);
            } else {
                throw new Error('No se obtuvo token de acceso');
            }
        } catch (error) {
            console.error('Native login error:', error);
            alert('Error al conectar con Google: ' + (error.message || 'Desconocido'));
        } finally {
            setLoading(false);
        }
    };

    // Callback para login web exitoso
    const handleWebLoginSuccess = async (accessToken) => {
        const tokenData = { access_token: accessToken };
        setUser(tokenData);
        localStorage.setItem('google_drive_token', JSON.stringify(tokenData));
        await initializeDrive(accessToken);
    };

    const initializeDrive = async (accessToken) => {
        setLoading(true);
        setDriveStatus('checking');
        try {
            console.log("Inicializando Google Drive...");
            const initResult = await initGoogleDrive(accessToken);
            console.log("Drive inicializado:", initResult);
            await checkExistingBackup();
            setDriveStatus('ready');
        } catch (error) {
            console.error("Error en initializeDrive:", error);
            setDriveStatus('error');
            // No mostrar alert inmediato si es error silencioso, pero aquí parece relevante
            if (!error.message?.includes('Timeout')) {
                alert('Error al inicializar Google Drive: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const checkExistingBackup = async () => {
        try {
            const file = await findBackupFile();
            setBackupFound(file);
        } catch (error) {
            console.error("Error buscando backup", error);
        }
    };

    const handleUpload = async () => {
        setLoading(true);
        try {
            // Use compressed backup for Google Drive
            const backupData = await generateCompressedBackupData();

            if (backupData) {
                await uploadBackupFile(backupData);
                alert('✅ Backup subido correctamente a Google Drive');
                await checkExistingBackup();
                // Registrar que se hizo backup hoy
                localStorage.setItem('last_backup_reminder_shown', Date.now().toString());
            } else {
                alert('❌ Error obteniendo datos del backup local');
            }
        } catch (error) {
            console.error('Error subiendo backup:', error);
            alert('❌ Error al subir backup a Drive');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!backupFound) return;
        if (!window.confirm('¿Sobrescribir datos locales con el backup de Drive?')) return;

        setLoading(true);
        try {
            const data = await downloadBackupFile(backupFound.id);
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const file = new File([blob], "backup_drive.json", { type: "application/json" });
            const result = await importarBackup(file);
            alert(result.message);
            if (result.success && onClose) onClose();
        } catch (error) {
            console.error('Error restaurando backup:', error);
            alert('❌ Error al restaurar desde Drive');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setDriveStatus('');
        setBackupFound(null);
        localStorage.removeItem('google_drive_token');
    };

    return (
        <div className={`space-y-4 ${!compact && 'border-t pt-4 mt-4'} ${modoOscuro ? 'border-slate-700' : 'border-slate-200'}`}>
            {!compact && (
                <div className="flex items-center gap-2 mb-3">
                    <Cloud className="text-[var(--theme-accent)]" size={18} />
                    <h3 className={`text-sm font-semibold ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                        Google Drive Sync
                    </h3>
                </div>
            )}

            {!user ? (
                isNative ? (
                    <button
                        onClick={handleNativeLogin}
                        disabled={loading}
                        className={`w-full group relative overflow-hidden flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${modoOscuro
                            ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                            : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm hover:shadow'
                            } ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        <span>{loading ? 'Conectando...' : 'Conectar con Google Drive'}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                ) : (
                    <WebGoogleLogin
                        onSuccess={handleWebLoginSuccess}
                        onError={(msg) => alert('Error al conectar: ' + msg)}
                        modoOscuro={modoOscuro}
                    />
                )
            ) : (
                <div className="space-y-3">
                    <div
                        className="flex items-center justify-between p-3 rounded-lg transition-all"
                        style={{
                            background: modoOscuro ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
                            border: `1px solid ${modoOscuro ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <CheckCircle2 className="text-emerald-500" size={18} />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                            <span className={`text-sm font-medium ${modoOscuro ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                Conectado {user.email && `como ${user.email}`}
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className={`p-1.5 rounded-lg transition-colors ${modoOscuro ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-black/5 text-slate-500'}`}
                            title="Desconectar"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>

                    {driveStatus === 'checking' && (
                        <div className={`text-center text-xs ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Verificando backups...
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleUpload}
                            disabled={loading || driveStatus !== 'ready'}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${modoOscuro
                                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--theme-accent-light)' }}>
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--theme-accent)' }} />
                                ) : (
                                    <Upload size={16} style={{ color: 'var(--theme-accent)' }} />
                                )}
                            </div>
                            <span className={`text-xs font-medium ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                                {loading ? 'Subiendo...' : 'Subir'}
                            </span>
                        </button>

                        <button
                            onClick={handleRestore}
                            disabled={loading || driveStatus !== 'ready' || !backupFound}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${backupFound
                                ? modoOscuro
                                    ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                : 'opacity-50 cursor-not-allowed bg-slate-900/20 border border-slate-800'
                                }`}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: backupFound ? 'var(--theme-accent-light)' : 'transparent' }}>
                                <Download size={16} style={{ color: backupFound ? 'var(--theme-accent)' : '#64748b' }} />
                            </div>
                            <span className={`text-xs font-medium ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                                {backupFound ? 'Restaurar' : 'Sin backup'}
                            </span>
                            {backupFound && (
                                <span className="text-[10px] opacity-60">
                                    {new Date(backupFound.createdTime).toLocaleDateString()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriveSection;
