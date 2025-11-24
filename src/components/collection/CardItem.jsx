import React from 'react';
import { Camera, Edit2, Heart, Trash2, ZoomIn } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';

const CardItem = ({ item, tipo, setVista, setItemEditando, setImagenZoom }) => {
    const { modoOscuro } = useTheme();
    const { toggleFavorito, eliminarItem } = useCollection();
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
        <div className={`relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
            <button
                onClick={() => toggleFavorito(item.id, tipo)}
                className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
                <Heart
                    size={20}
                    className={item.favorito ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
            </button>

            <div className={`grid grid-cols-2 gap-2 p-3 ${modoOscuro ? 'bg-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100'} relative`}>
                {item.fotoFrontal ? (
                    <div className="relative group/img">
                        <img
                            src={item.fotoFrontal}
                            alt="Frontal"
                            className="w-full h-36 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setImagenZoom(item.fotoFrontal)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                            <ZoomIn className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" size={24} />
                        </div>
                    </div>
                ) : (
                    <div className={`w-full h-36 ${modoOscuro ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                        <Camera size={32} className="text-gray-400" />
                    </div>
                )}
                {item.fotoTrasera ? (
                    <div className="relative group/img">
                        <img
                            src={item.fotoTrasera}
                            alt="Trasera"
                            className="w-full h-36 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setImagenZoom(item.fotoTrasera)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                            <ZoomIn className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" size={24} />
                        </div>
                    </div>
                ) : (
                    <div className={`w-full h-36 ${modoOscuro ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                        <Camera size={32} className="text-gray-400" />
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-bold text-lg ${modoOscuro ? 'text-white' : 'text-gray-800'} line-clamp-2 flex-1`}>
                        {item.nombre}
                    </h3>
                </div>

                {!esMoneda && item.denominacion && (
                    <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">
                        ${item.denominacion}
                    </div>
                )}

                {item.descripcion && (
                    <p className={`text-sm mb-3 line-clamp-2 ${modoOscuro ? 'text-gray-400' : 'text-gray-600'} italic`}>
                        {item.descripcion}
                    </p>
                )}

                <div className={`space-y-2 text-sm mb-4 ${modoOscuro ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3`}>
                    <div className="flex items-center justify-between">
                        <span className={`flex items-center gap-2 ${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                            📅 Año
                        </span>
                        <span className={`font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{item.ano}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className={`flex items-center gap-2 ${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                            🌍 País
                        </span>
                        <span className={`font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{item.pais}</span>
                    </div>
                    {esMoneda && item.material && (
                        <div className="flex items-center justify-between">
                            <span className={`flex items-center gap-2 ${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                                ⚙️ Material
                            </span>
                            <span className={`font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{item.material}</span>
                        </div>
                    )}
                    {item.estado && (
                        <div className="flex items-center justify-between">
                            <span className={`flex items-center gap-2 ${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                                ⭐ Estado
                            </span>
                            <span className={`font-bold ${item.estado === 'Excelente' ? 'text-green-600' : item.estado === 'Muy Bueno' ? 'text-blue-600' : 'text-gray-600'}`}>
                                {item.estado}
                            </span>
                        </div>
                    )}
                </div>

                {(item.valorComprado || item.valorVenta) && (
                    <div className={`grid ${item.valorComprado && item.valorVenta ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
                        {item.valorComprado && (
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg p-2 text-center">
                                <div className="text-xs opacity-90">Compra</div>
                                <div className="font-bold text-lg">${parseFloat(item.valorComprado).toFixed(2)}</div>
                            </div>
                        )}
                        {item.valorVenta && (
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg p-2 text-center">
                                <div className="text-xs opacity-90">Venta</div>
                                <div className="font-bold text-lg">${parseFloat(item.valorVenta).toFixed(2)}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleEditar}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
                    >
                        <Edit2 size={16} />
                        Editar
                    </button>
                    <button
                        onClick={handleEliminar}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-md hover:shadow-lg"
                    >
                        <Trash2 size={16} />
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardItem;
