import React, { useState } from 'react';
import { X, RotateCw, Camera } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ModalComparador = ({ items, tipo, onClose }) => {
    const { modoOscuro } = useTheme();
    const [flippedCards, setFlippedCards] = useState({});
    const esMoneda = tipo === 'monedas';

    const toggleFlip = (itemId) => {
        setFlippedCards(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-auto rounded-3xl ${modoOscuro ? 'bg-slate-900' : 'bg-white'} shadow-2xl`}>
                {/* Header */}
                <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${modoOscuro ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                        Comparando {items.length} {esMoneda ? 'monedas' : 'billetes'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${modoOscuro ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Comparison Grid */}
                <div className={`grid gap-6 p-6 ${items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                    {items.map(item => (
                        <div
                            key={item.id}
                            className={`rounded-2xl overflow-hidden border ${modoOscuro ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                        >
                            {/* Image with Flip */}
                            <div className="relative h-56 cursor-pointer" onClick={() => toggleFlip(item.id)}>
                                <div className={`w-full h-full transition-transform duration-500 ${flippedCards[item.id] ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                                    {/* Front */}
                                    <div className="absolute inset-0 backface-hidden">
                                        {item.fotoFrontal ? (
                                            <img
                                                src={item.fotoFrontal}
                                                alt="Frontal"
                                                className={`w-full h-full ${esMoneda ? 'object-contain p-4' : 'object-cover'} ${modoOscuro ? 'bg-slate-900' : 'bg-slate-100'}`}
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${modoOscuro ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                                <Camera size={48} className="text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Back */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                                        {item.fotoTrasera ? (
                                            <img
                                                src={item.fotoTrasera}
                                                alt="Trasera"
                                                className={`w-full h-full ${esMoneda ? 'object-contain p-4' : 'object-cover'} ${modoOscuro ? 'bg-slate-900' : 'bg-slate-100'}`}
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${modoOscuro ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                                <span className="text-slate-400">Sin reverso</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Flip Indicator */}
                                <div className={`absolute bottom-2 right-2 p-2 rounded-full ${modoOscuro ? 'bg-black/50' : 'bg-white/80'} shadow`}>
                                    <RotateCw size={16} className={modoOscuro ? 'text-white' : 'text-gray-600'} />
                                </div>
                                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${modoOscuro ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-700'}`}>
                                    {flippedCards[item.id] ? 'Reverso' : 'Anverso'}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-3">
                                <h3 className={`text-lg font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                                    {item.nombre}
                                </h3>

                                <div className={`space-y-2 text-sm ${modoOscuro ? 'text-slate-300' : 'text-gray-600'}`}>
                                    <div className="flex justify-between">
                                        <span className="font-medium">País:</span>
                                        <span>{item.pais}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Año:</span>
                                        <span>{item.ano}</span>
                                    </div>
                                    {esMoneda && item.material && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Material:</span>
                                            <span>{item.material}</span>
                                        </div>
                                    )}
                                    {!esMoneda && item.denominacion && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Denominación:</span>
                                            <span>L. {item.denominacion}</span>
                                        </div>
                                    )}
                                    {item.estado && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Estado:</span>
                                            <span className={
                                                item.estado === 'Excelente' ? 'text-emerald-500 font-semibold' :
                                                    item.estado === 'Muy Bueno' ? 'text-blue-500 font-semibold' : ''
                                            }>{item.estado}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Values */}
                                {(item.valorComprado || item.valorVenta) && (
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        {item.valorComprado && (
                                            <div className={`p-2 rounded-lg text-center ${modoOscuro ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                                                <div className={`text-[10px] font-bold uppercase ${modoOscuro ? 'text-emerald-400' : 'text-emerald-600'}`}>Compra</div>
                                                <div className={`font-bold ${modoOscuro ? 'text-emerald-300' : 'text-emerald-700'}`}>L. {parseFloat(item.valorComprado).toFixed(2)}</div>
                                            </div>
                                        )}
                                        {item.valorVenta && (
                                            <div className={`p-2 rounded-lg text-center ${modoOscuro ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                                                <div className={`text-[10px] font-bold uppercase ${modoOscuro ? 'text-indigo-400' : 'text-indigo-600'}`}>Venta</div>
                                                <div className={`font-bold ${modoOscuro ? 'text-indigo-300' : 'text-indigo-700'}`}>L. {parseFloat(item.valorVenta).toFixed(2)}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModalComparador;
