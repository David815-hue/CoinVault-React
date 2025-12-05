import React from 'react';
import { X, Moon, Sun, Palette, Download, Upload, Sparkles, Gem, Waves, Sunset, Leaf } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';

const ModalTemas = ({ onClose }) => {
    const { modoOscuro, toggleModoOscuro, tema, cambiarTema } = useTheme();
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
        e.target.value = '';
    };

    const themes = [
        {
            id: 'indigo',
            name: 'Clásico',
            icon: Palette,
            preview: {
                bg: 'linear-gradient(135deg, #f8fafc, #e0e7ff)',
                accent: '#6366f1',
                card: '#ffffff'
            },
            description: 'Limpio y profesional'
        },
        {
            id: 'aurora',
            name: 'Aurora',
            icon: Sparkles,
            preview: {
                bg: 'linear-gradient(135deg, #302b63, #24243e)',
                accent: '#a855f7',
                card: 'rgba(255,255,255,0.1)'
            },
            description: 'Futurista con gradientes'
        },
        {
            id: 'midnight',
            name: 'Midnight',
            icon: Gem,
            preview: {
                bg: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
                accent: '#d4af37',
                card: '#141414'
            },
            description: 'Oscuro y lujoso'
        },
        {
            id: 'ocean',
            name: 'Ocean',
            icon: Waves,
            preview: {
                bg: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)',
                accent: '#00838f',
                card: '#ffffff'
            },
            description: 'Fresco y relajante'
        },
        {
            id: 'sunset',
            name: 'Sunset',
            icon: Sunset,
            preview: {
                bg: 'linear-gradient(135deg, #fff5f5, #fce7f3)',
                accent: '#f97316',
                card: '#ffffff'
            },
            description: 'Cálido y acogedor'
        },
        {
            id: 'mint',
            name: 'Mint',
            icon: Leaf,
            preview: {
                bg: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                accent: '#10b981',
                card: '#ffffff'
            },
            description: 'Minimalista y fresco'
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div
                className="relative w-full max-w-lg p-6 rounded-2xl shadow-2xl transform transition-all"
                style={{
                    background: modoOscuro ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${modoOscuro ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
            >
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${modoOscuro ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="p-3 rounded-xl"
                        style={{ background: 'var(--theme-accent-light)' }}
                    >
                        <Palette className="w-6 h-6" style={{ color: 'var(--theme-accent)' }} />
                    </div>
                    <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                        Personalización
                    </h2>
                </div>

                <div className="space-y-6">
                    {/* Mode Selection */}
                    <div>
                        <h3 className={`text-sm font-medium mb-3 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                            Apariencia
                        </h3>
                        <div className={`grid grid-cols-2 gap-3 p-1.5 rounded-xl ${modoOscuro ? 'bg-slate-800/50' : 'bg-slate-100'
                            }`}>
                            <button
                                onClick={() => modoOscuro && toggleModoOscuro()}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${!modoOscuro
                                        ? 'bg-white shadow-md text-amber-500'
                                        : 'text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                <Sun size={18} />
                                <span className="font-medium">Claro</span>
                            </button>
                            <button
                                onClick={() => !modoOscuro && toggleModoOscuro()}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${modoOscuro
                                        ? 'bg-slate-700 shadow-md text-indigo-400'
                                        : 'text-slate-500 hover:text-slate-600'
                                    }`}
                            >
                                <Moon size={18} />
                                <span className="font-medium">Oscuro</span>
                            </button>
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div>
                        <h3 className={`text-sm font-medium mb-3 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                            Tema Visual
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {themes.map((themeItem) => {
                                const Icon = themeItem.icon;
                                const isSelected = tema === themeItem.id;

                                return (
                                    <button
                                        key={themeItem.id}
                                        onClick={() => cambiarTema(themeItem.id)}
                                        className={`relative overflow-hidden rounded-xl transition-all duration-300 ${isSelected
                                                ? 'ring-2 ring-offset-2 scale-[1.02]'
                                                : 'hover:scale-[1.01]'
                                            }`}
                                        style={{
                                            ringColor: themeItem.preview.accent,
                                            ringOffsetColor: modoOscuro ? '#1e293b' : '#ffffff'
                                        }}
                                    >
                                        {/* Preview Background */}
                                        <div
                                            className="h-20 relative"
                                            style={{ background: themeItem.preview.bg }}
                                        >
                                            {/* Mini Card Preview */}
                                            <div
                                                className="absolute bottom-2 left-2 right-2 h-8 rounded-lg shadow-sm flex items-center px-2 gap-2"
                                                style={{ background: themeItem.preview.card }}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ background: themeItem.preview.accent }}
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <div
                                                        className="h-1.5 rounded-full w-3/4"
                                                        style={{ background: themeItem.preview.accent, opacity: 0.3 }}
                                                    />
                                                    <div
                                                        className="h-1 rounded-full w-1/2"
                                                        style={{ background: themeItem.preview.accent, opacity: 0.2 }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Selection Check */}
                                            {isSelected && (
                                                <div
                                                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                                    style={{ background: themeItem.preview.accent }}
                                                >
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Theme Info */}
                                        <div className={`p-3 ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
                                            <div className="flex items-center gap-2">
                                                <Icon size={14} style={{ color: themeItem.preview.accent }} />
                                                <span className={`font-semibold text-sm ${modoOscuro ? 'text-white' : 'text-slate-800'}`}>
                                                    {themeItem.name}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-0.5 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {themeItem.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Backup & Restore */}
                    <div>
                        <h3 className={`text-sm font-medium mb-3 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                            Copia de Seguridad
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleExportar}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${modoOscuro
                                        ? 'border-slate-700 hover:bg-slate-700/50 text-slate-300'
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                <Download size={18} />
                                <span className="text-sm font-medium">Exportar</span>
                            </button>
                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${modoOscuro
                                    ? 'border-slate-700 hover:bg-slate-700/50 text-slate-300'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                }`}>
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

                <div className={`mt-6 pt-6 border-t ${modoOscuro ? 'border-slate-700' : 'border-slate-200'}`}>
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 text-white rounded-xl font-medium transition-all hover:opacity-90 shadow-lg"
                        style={{
                            background: 'var(--theme-gradient, linear-gradient(135deg, var(--theme-accent), var(--theme-accent-hover)))',
                        }}
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalTemas;
