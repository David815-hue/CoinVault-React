import React, { useState } from 'react';
import { Camera, Edit2, Heart, Trash2, ZoomIn, Sparkles, RotateCw, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import ModalAIInfo from './ModalAIInfo';

const CardItem = ({ item, tipo, setVista, setItemEditando, setImagenZoom, compareMode = false, isSelected = false, onToggleSelect }) => {
    const { modoOscuro } = useTheme();
    const { toggleFavorito, eliminarItem } = useCollection();
    const [showAI, setShowAI] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const esMoneda = tipo === 'monedas';

    const handleEditar = () => {
        setItemEditando(item);
        setVista('formulario');
    };

    const handleEliminar = () => {
        if (window.confirm(`¿Estás seguro de eliminar esta ${esMoneda ? 'moneda' : 'billete'}?`)) {
            eliminarItem(item.id, tipo);
        }
    };

    const toggleFlip = (e) => {
        e.stopPropagation();
        if (!compareMode) {
            setIsFlipped(!isFlipped);
        }
    };

    const handleCardClick = () => {
        if (compareMode && onToggleSelect) {
            onToggleSelect(item.id);
        }
    };

    return (
        <div
            className={`relative group rounded-2xl overflow-hidden transition-all duration-300 card-hover ${modoOscuro ? 'bg-slate-800 shadow-xl shadow-slate-900/50' : 'bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-200/50'} ${compareMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-indigo-500' : ''}`}
            onClick={handleCardClick}
        >
            {/* Selection Checkbox */}
            {compareMode && (
                <div className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 text-white' : modoOscuro ? 'bg-slate-700 border-2 border-slate-500' : 'bg-white border-2 border-gray-300'}`}>
                    {isSelected && <Check size={16} strokeWidth={3} />}
                </div>
            )}

            <button
                onClick={(e) => { e.stopPropagation(); toggleFavorito(item.id, tipo); }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full shadow-lg hover:scale-110 transition-transform glass"
            >
                <Heart
                    size={20}
                    className={item.favorito ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
                />
            </button>

            {/* 3D Flip Container */}
            <div className="h-48 w-full relative">
                <div
                    className="h-48 w-full cursor-pointer perspective-1000"
                    onClick={toggleFlip}
                >
                    <div className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front Face */}
                        <div className="absolute w-full h-full backface-hidden">
                            {item.fotoFrontal ? (
                                <div className={`relative w-full h-full ${modoOscuro ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                    <img
                                        src={item.fotoFrontal}
                                        alt="Frontal"
                                        className={`w-full h-full ${esMoneda ? 'object-contain p-3' : 'object-cover'}`}
                                    />
                                </div>
                            ) : (
                                <div className={`w-full h-full ${modoOscuro ? 'bg-slate-700' : 'bg-slate-200'} flex items-center justify-center`}>
                                    <Camera size={32} className="text-slate-400" />
                                </div>
                            )}
                        </div>

                        {/* Back Face */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180">
                            {item.fotoTrasera ? (
                                <div className={`relative w-full h-full ${modoOscuro ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                    <img
                                        src={item.fotoTrasera}
                                        alt="Trasera"
                                        className={`w-full h-full ${esMoneda ? 'object-contain p-3' : 'object-cover'}`}
                                    />
                                </div>
                            ) : (
                                <div className={`w-full h-full ${modoOscuro ? 'bg-slate-700' : 'bg-slate-200'} flex items-center justify-center`}>
                                    <span className="text-slate-400 text-sm">Sin reverso</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Zoom Button */}
                <button
                    className="absolute bottom-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        setImagenZoom({
                            frontal: item.fotoFrontal,
                            trasera: item.fotoTrasera
                        });
                    }}
                    title="Zoom"
                >
                    <ZoomIn size={20} />
                </button>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-bold text-lg ${modoOscuro ? 'text-slate-100' : 'text-slate-800'} line-clamp-2 flex-1 leading-tight`}>
                        {item.nombre}
                    </h3>
                </div>

                {!esMoneda && item.denominacion && (
                    <div className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3 py-1 rounded-full text-xs font-bold mb-4 border border-[var(--color-primary-light)]">
                        L. {item.denominacion}
                    </div>
                )}

                {item.descripcion && (
                    <p className={`text-sm mb-4 line-clamp-2 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.descripcion}
                    </p>
                )}

                <div className={`space-y-2.5 text-sm mb-5 ${modoOscuro ? 'bg-slate-700/30' : 'bg-slate-50'} rounded-xl p-3 border ${modoOscuro ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>AÑO</span>
                        <span className={`font-semibold ${modoOscuro ? 'text-slate-200' : 'text-slate-700'}`}>{item.ano}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>PAÍS</span>
                        <span className={`font-semibold ${modoOscuro ? 'text-slate-200' : 'text-slate-700'}`}>{item.pais}</span>
                    </div>
                    {esMoneda && item.material && (
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>MATERIAL</span>
                            <span className={`font-semibold ${modoOscuro ? 'text-slate-200' : 'text-slate-700'}`}>{item.material}</span>
                        </div>
                    )}
                    {item.estado && (
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>ESTADO</span>
                            <span className={`font-semibold ${item.estado === 'Excelente' ? 'text-emerald-500' :
                                item.estado === 'Muy Bueno' ? 'text-blue-500' :
                                    modoOscuro ? 'text-slate-300' : 'text-slate-600'
                                }`}>
                                {item.estado}
                            </span>
                        </div>
                    )}
                </div>

                {(item.valorComprado || item.valorVenta) && (
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        {item.valorComprado && (
                            <div className={`p-2 rounded-lg text-center border ${modoOscuro ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-emerald-50 border-emerald-100'}`}>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${modoOscuro ? 'text-emerald-400' : 'text-emerald-600'}`}>Compra</div>
                                <div className={`font-bold ${modoOscuro ? 'text-emerald-300' : 'text-emerald-700'}`}>L. {parseFloat(item.valorComprado).toFixed(2)}</div>
                            </div>
                        )}
                        {item.valorVenta && (
                            <div className={`p-2 rounded-lg text-center border ${modoOscuro ? 'bg-indigo-900/20 border-indigo-800/50' : 'bg-indigo-50 border-indigo-100'}`}>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${modoOscuro ? 'text-indigo-400' : 'text-indigo-600'}`}>Venta</div>
                                <div className={`font-bold ${modoOscuro ? 'text-indigo-300' : 'text-indigo-700'}`}>L. {parseFloat(item.valorVenta).toFixed(2)}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={() => setShowAI(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-colors ${modoOscuro
                            ? 'bg-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/80 text-[var(--color-primary-dark)]'
                            }`}
                        title="Ver Info IA"
                    >
                        <Sparkles size={14} />
                        IA
                    </button>
                    <button
                        onClick={handleEditar}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-colors ${modoOscuro
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                    >
                        <Edit2 size={14} />
                        Editar
                    </button>
                    <button
                        onClick={handleEliminar}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-colors ${modoOscuro
                            ? 'bg-rose-900/30 hover:bg-rose-900/50 text-rose-400'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                            }`}
                    >
                        <Trash2 size={14} />
                        Eliminar
                    </button>
                </div>
            </div>

            {showAI && (
                <ModalAIInfo
                    item={item}
                    tipo={tipo}
                    onClose={() => setShowAI(false)}
                />
            )}
        </div>
    );
};

export default CardItem;
