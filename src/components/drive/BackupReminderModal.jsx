import React, { useState } from 'react';
import { X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import DriveSection from './DriveSection';
import { useCollection } from '../../context/CollectionContext';

const BackupReminderModal = ({ onClose }) => {
    const [snoozing, setSnoozing] = useState(false);
    const { modoOscuro } = useCollection(); // Note: useTheme might be better if useCollection doesn't expose modoOscuro directly, checking common usage
    // Checking import usage in other files: ModalTemas uses useTheme. Let's stick to useTheme or pass it as prop if possible, but let's check App.jsx imports.
    // App.jsx -> useTheme is used.

    // I will use useTheme hook locally if available, or just receive props. 
    // Ideally I should import useTheme.
    return (
        <BackupReminderModalContent onClose={onClose} />
    );
}

// Breaking out to use hooks properly
import { useTheme } from '../../hooks/useTheme';

const BackupReminderModalContent = ({ onClose }) => {
    const { modoOscuro } = useTheme();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleSnooze = () => {
        // Recordar en 1 día
        // Frecuencia '1_week' son 7 días.
        // Si quiero que suene mañana, debo configurar 'last_backup_reminder_shown' tal que (ahora - last) > frecuencia sea falso hoy pero verdadero mañana ???
        // No, la logica en App será: if (now - last > freq) -> show.
        // Si quiero que suene mañana, seteo last = now - freq + 1_day.
        // Ejemplo freq=7 dias. last = tomorrow - 7 days = now - 6 days.
        // Entonces (now - last) = 6 days < 7 days (No suena hoy).
        // Mañana: (now+1 - last) = 7 days (Suena).

        const frequency = localStorage.getItem('backup_reminder_frequency') || '1_week';
        let freqMs = 7 * 24 * 60 * 60 * 1000;
        if (frequency === '2_weeks') freqMs = 14 * 24 * 60 * 60 * 1000;
        if (frequency === '1_month') freqMs = 30 * 24 * 60 * 60 * 1000;

        const oneDay = 24 * 60 * 60 * 1000;
        // set last shown so that it triggers again in one day
        const snoozedLastShown = Date.now() - freqMs + oneDay;

        localStorage.setItem('last_backup_reminder_shown', snoozedLastShown.toString());
        onClose();
    };

    const handleMarkAsDone = () => {
        // Marcar como hecho hoy
        localStorage.setItem('last_backup_reminder_shown', Date.now().toString());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
                className="relative w-full max-w-md p-6 rounded-2xl shadow-2xl transform transition-all"
                style={{
                    background: modoOscuro ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${modoOscuro ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
                }}
            >
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${modoOscuro ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                    <div
                        className="p-4 rounded-full mb-4 animate-bounce-slow"
                        style={{ background: 'rgba(245, 158, 11, 0.2)' }}
                    >
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                        Recordatorio de Seguridad
                    </h2>
                    <p className={`text-sm ${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>
                        Hace tiempo que no realizas una copia de seguridad en la nube. Te recomendamos hacerlo para proteger tu colección.
                    </p>
                </div>

                <div className="mb-6">
                    {clientId ? (
                        // Reutilizamos el nuevo componente DriveSection
                        <DriveSection
                            modoOscuro={modoOscuro}
                            clientId={clientId}
                            compact={true}
                            onClose={onClose} // Si restaura o sube con éxito, podría cerrar
                        />
                    ) : (
                        <div className="text-sm text-red-500 text-center">
                            Falta configurar Google Client ID
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleSnooze}
                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${modoOscuro
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                    >
                        <Clock size={16} />
                        Más tarde
                    </button>
                    <button
                        onClick={handleMarkAsDone}
                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${modoOscuro
                                ? 'bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/50'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                    >
                        <CheckCircle size={16} />
                        Ya la hice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupReminderModalContent;
