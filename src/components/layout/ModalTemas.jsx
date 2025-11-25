import React from 'react';
import { X, Check, Moon, Sun, Palette, Download, Upload } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';

const ModalTemas = ({ onClose }) => {
    const { modoOscuro, toggleModoOscuro, temaColor, cambiarTemaColor } = useTheme();
    const { exportarBackup, importarBackup } = useCollection();

    const handleExportar = async () => {
        const success = await exportarBackup();
        if (success) alert('Backup exportado correctamente');
    };

    const handleImportar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (window.confirm('¿Estás seguro de restaurar este backup? Se reemplazarán los datos actuales.')) {
            const result = await importarBackup(file);
            alert(result.message);
            if (result.success) onClose();
        }
        e.target.value = ''; // Reset input
    };

    const themes = [
        { id: 'indigo', name: 'Indigo', color: '#6366f1' },
        { id: 'emerald', name: 'Esmeralda', color: '#10b981' },
        { id: 'rose', name: 'Rosa', color: '#f43f5e' },
        { id: 'amber', name: 'Ámbar', color: '#f59e0b' },
        { id: 'cyan', name: 'Cian', color: '#06b6d4' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl transform transition-all scale-100 ${modoOscuro ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
                }`}>
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${modoOscuro ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl ${modoOscuro ? 'bg-slate-700' : 'bg-indigo-50'}`}>
                        <Palette className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <h2 className="text-2xl font-bold">Personalización</h2>
                </div>

                <div className="space-y-6">
                    {/* Mode Selection */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 opacity-70">Apariencia</h3>
                        <div className={`grid grid-cols-2 gap-3 p-1 rounded-xl ${modoOscuro ? 'bg-slate-900/50' : 'bg-slate-100'
                            }`}>
                            <button
                                onClick={() => modoOscuro && toggleModoOscuro()}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${!modoOscuro
                                    ? 'bg-white shadow-sm text-[var(--color-primary)]'
                                    : 'text-slate-500 hover:text-slate-400'
                                    }`}
                            >
                                <Sun size={18} />
                                <span className="font-medium">Claro</span>
                            </button>
                            <button
                                onClick={() => !modoOscuro && toggleModoOscuro()}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${modoOscuro
                                    ? 'bg-slate-700 shadow-sm text-[var(--color-primary)]'
                                    : 'text-slate-500 hover:text-slate-600'
                                    }`}
                            >
                                <Moon size={18} />
                                <span className="font-medium">Oscuro</span>
                            </button>
                        </div>
                    </div>

                    {/* Color Theme Selection */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 opacity-70">Color de Énfasis</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => cambiarTemaColor(theme.id)}
                                    className={`group relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${temaColor === theme.id
                                        ? modoOscuro ? 'bg-slate-700 ring-2 ring-offset-2 ring-offset-slate-800 ring-[var(--color-primary)]' : 'bg-slate-50 ring-2 ring-offset-2 ring-[var(--color-primary)]'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: theme.color }}
                                    >
                                        {temaColor === theme.id && (
                                            <Check size={14} className="text-white" strokeWidth={3} />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-medium opacity-70">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Backup & Restore */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 opacity-70">Copia de Seguridad</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleExportar}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${modoOscuro
                                    ? 'border-slate-700 hover:bg-slate-700 text-slate-300'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                            >
                                <Download size={18} />
                                <span className="text-sm font-medium">Exportar</span>
                            </button>
                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${modoOscuro
                                ? 'border-slate-700 hover:bg-slate-700 text-slate-300'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                <Upload size={18} />
                                <span className="text-sm font-medium">Importar</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleImportar}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => {
                            onClose();
                            window.location.reload();
                        }}
                        className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalTemas;
