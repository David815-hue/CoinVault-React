import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, BookOpen, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { obtenerInfoIA } from '../../services/groqService';

const ModalAIInfo = ({ item, tipo, onClose }) => {
    const { modoOscuro } = useTheme();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                setLoading(true);
                const data = await obtenerInfoIA(item, tipo);
                setInfo(data);
            } catch (err) {
                setError('No se pudo obtener la información de la IA. Intenta de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, [item, tipo]);

    // Prevent scrolling on body when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${modoOscuro ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
                }`}>
                {/* Header */}
                <div className={`p-6 flex items-center justify-between border-b ${modoOscuro ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]`}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Análisis IA</h3>
                            <p className={`text-xs ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Powered by Groq</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${modoOscuro ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                            <p className={`text-sm animate-pulse ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                                Consultando conocimientos numismáticos...
                            </p>
                        </div>
                    ) : error ? (
                        <div className={`flex flex-col items-center justify-center py-8 text-center ${modoOscuro ? 'text-rose-400' : 'text-rose-600'}`}>
                            <AlertCircle size={48} className="mb-4 opacity-50" />
                            <p>{error}</p>
                        </div>
                    ) : info ? (
                        <div className="space-y-6 animate-slideUp">
                            {/* Historia */}
                            <div className={`p-4 rounded-xl ${modoOscuro ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                <div className="flex items-center gap-2 mb-2 font-bold text-[var(--color-primary)]">
                                    <BookOpen size={18} />
                                    <h4>Historia</h4>
                                </div>
                                <p className={`text-sm leading-relaxed ${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {info.historia}
                                </p>
                            </div>

                            {/* Curiosidades */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 font-bold text-amber-500">
                                    <Lightbulb size={18} />
                                    <h4>Curiosidades</h4>
                                </div>
                                <ul className="space-y-2">
                                    {info.curiosidades.map((curiosidad, idx) => (
                                        <li key={idx} className={`flex gap-3 text-sm ${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <span className="text-amber-500 mt-1">•</span>
                                            {curiosidad}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Datos de Mercado */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border ${modoOscuro ? 'bg-slate-700/30 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                        <TrendingUp size={14} />
                                        Valor Estimado
                                    </div>
                                    <div className={`font-semibold ${modoOscuro ? 'text-slate-200' : 'text-slate-700'}`}>
                                        {info.valor_estimado}
                                    </div>
                                </div>
                                <div className={`p-4 rounded-xl border ${modoOscuro ? 'bg-slate-700/30 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-purple-500 uppercase tracking-wider">
                                        <Sparkles size={14} />
                                        Rareza
                                    </div>
                                    <div className={`font-semibold ${modoOscuro ? 'text-slate-200' : 'text-slate-700'}`}>
                                        {info.rareza}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalAIInfo;
