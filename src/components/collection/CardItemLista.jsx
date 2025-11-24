import React from 'react';
import { Camera, Edit2, Heart, Trash2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';

const CardItemLista = ({ item, tipo, setVista, setItemEditando, setImagenZoom }) => {
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
                            <span className="text-sm font-semibold text-green-600">
                                Compra: ${parseFloat(item.valorComprado).toFixed(2)}
                            </span>
                        )}
                        {item.valorVenta && (
                            <span className="text-sm font-semibold text-blue-600">
                                Venta: ${parseFloat(item.valorVenta).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleEditar}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Editar"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={handleEliminar}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardItemLista;
