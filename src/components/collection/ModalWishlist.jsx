import React, { useState } from 'react';
import { X, Plus, Trash2, Download, List } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import CountrySelect from '../common/CountrySelect';
import { PAISES } from '../../utils/constants';

const ModalWishlist = ({ onClose }) => {
    const { modoOscuro } = useTheme();
    const { wishlist, addToWishlist, removeFromWishlist, downloadWishlist } = useCollection();

    const [newItem, setNewItem] = useState({
        nombre: '',
        pais: '',
        denominacion: ''
    });

    const handleAdd = () => {
        if (!newItem.nombre || !newItem.pais || !newItem.denominacion) {
            alert('Por favor completa todos los campos');
            return;
        }
        addToWishlist(newItem);
        setNewItem({ nombre: '', pais: '', denominacion: '' });
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                        <List className="text-indigo-500" size={32} />
                        Lista de Deseos
                    </h2>
                    <button
                        onClick={onClose}
                        className={`${modoOscuro ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Formulario de Agregar */}
                <div className={`p-4 rounded-xl mb-6 ${modoOscuro ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`font-semibold mb-3 ${modoOscuro ? 'text-gray-200' : 'text-gray-700'}`}>Agregar Nuevo Deseo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Nombre (ej: Moneda Romana)"
                            value={newItem.nombre}
                            onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                            className={`px-3 py-2 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                        <CountrySelect
                            value={newItem.pais}
                            onChange={(pais) => setNewItem({ ...newItem, pais })}
                            countries={PAISES}
                        />
                        <input
                            type="text"
                            placeholder="Denominación (ej: 1 Denario)"
                            value={newItem.denominacion}
                            onChange={(e) => setNewItem({ ...newItem, denominacion: e.target.value })}
                            className={`px-3 py-2 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Agregar a la Lista
                    </button>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto min-h-[200px]">
                    {wishlist.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No hay items en tu lista de deseos aún.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {wishlist.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100 shadow-sm'}`}
                                >
                                    <div>
                                        <h4 className={`font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{item.nombre}</h4>
                                        <p className={`text-sm ${modoOscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {item.pais} • {item.denominacion}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {wishlist.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={downloadWishlist}
                            className={`w-full py-3 rounded-lg border-2 font-semibold flex items-center justify-center gap-2 transition-colors ${modoOscuro
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Download size={20} />
                            Descargar Lista de Deseos
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalWishlist;
