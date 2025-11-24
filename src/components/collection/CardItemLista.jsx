import React, { useState } from 'react';
import { Camera, Edit2, Heart, Trash2, Sparkles } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import ModalAIInfo from './ModalAIInfo';

const CardItemLista = ({ item, tipo, setVista, setItemEditando, setImagenZoom }) => {
    const { modoOscuro } = useTheme();
    const { toggleFavorito, eliminarItem } = useCollection();
    const [showAI, setShowAI] = useState(false);
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

    return (
        <div className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-all ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-4">
                {/* Imagen miniatura */}
                <div className="flex-shrink-0">
                    {item.fotoFrontal ? (
                        <img
                            src={item.fotoFrontal}
                            alt="Miniatura"
                            className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                            onClick={() => setImagenZoom(item.fotoFrontal)}
                        />
                    ) : (
                        <div className={`w-24 h-24 ${modoOscuro ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                            <Camera size={24} className="text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-bold text-lg ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                            {item.nombre}
                        </h3>
                        <button
                            onClick={() => toggleFavorito(item.id, tipo)}
                            className="flex-shrink-0 ml-2"
                        >
                            <Heart
                                size={20}
                                className={item.favorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                            />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`text-sm px-2 py-1 rounded ${modoOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            📅 {item.ano}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${modoOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            🌍 {item.pais}
                        </span>
                        {esMoneda && item.material && (
                            <span className={`text-sm px-2 py-1 rounded ${modoOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                ⚙️ {item.material}
                            </span>
                        )}
                        {item.estado && (
                            <span className={`text-sm px-2 py-1 rounded ${item.estado === 'Excelente' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                ⭐ {item.estado}
                            </span>
                        )}
                    </div>

                    {item.descripcion && (
                        <p className={`text-sm ${modoOscuro ? 'text-gray-400' : 'text-gray-600'} line-clamp-1 mb-2`}>
                            {item.descripcion}
                        </p>
                    )}

                    <div className="flex items-center gap-2">
                        {item.valorComprado && (
                            <span className="text-sm font-semibold text-emerald-600">
                                Compra: L. {parseFloat(item.valorComprado).toFixed(2)}
                            </span>
                        )}
                        {item.valorVenta && (
                            <span className="text-sm font-semibold text-indigo-600">
                                Venta: L. {parseFloat(item.valorVenta).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setShowAI(true)}
                        className={`p-2 rounded-lg transition-colors ${modoOscuro ? 'bg-[var(--color-primary-dark)] text-white hover:bg-[var(--color-primary)]' : 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] hover:bg-[var(--color-primary-light)]/80'}`}
                        title="Ver Info IA"
                    >
                        <Sparkles size={16} />
                    </button>
                    <button
                        onClick={handleEditar}
                        className={`p-2 rounded-lg transition-colors ${modoOscuro ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        title="Editar"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={handleEliminar}
                        className={`p-2 rounded-lg transition-colors ${modoOscuro ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
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

export default CardItemLista;
