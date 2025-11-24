import React from 'react';
import { Star, Heart, X, Coins, Banknote } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import CardItem from './CardItem';

const ModalFavoritos = ({ onClose, setItemEditando, setTipoFormulario, setVista, setImagenZoom, handleDragStart, handleDragOver, handleDrop }) => {
    const { modoOscuro } = useTheme();
    const { monedas, billetes } = useCollection();

    const monedasFavoritas = monedas.filter(m => m.favorito);
    const billetesFavoritos = billetes.filter(b => b.favorito);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                        <Star className="text-yellow-500" size={32} />
                        Favoritos
                    </h2>
                    <button
                        onClick={onClose}
                        className={`${modoOscuro ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {monedasFavoritas.length === 0 && billetesFavoritos.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className={modoOscuro ? 'text-gray-400' : 'text-gray-600'}>
                            No tienes favoritos aún. Marca tus monedas y billetes favoritos.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {monedasFavoritas.length > 0 && (
                            <div>
                                <h3 className="font-bold text-lg text-amber-600 mb-3 flex items-center gap-2">
                                    <Coins size={20} />
                                    Monedas Favoritas ({monedasFavoritas.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {monedasFavoritas.map(m => (
                                        <CardItem
                                            key={m.id}
                                            item={m}
                                            tipo="monedas"
                                            setItemEditando={setItemEditando}
                                            setTipoFormulario={setTipoFormulario}
                                            setVista={setVista}
                                            setImagenZoom={setImagenZoom}
                                            handleDragStart={handleDragStart}
                                            handleDragOver={handleDragOver}
                                            handleDrop={handleDrop}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {billetesFavoritos.length > 0 && (
                            <div>
                                <h3 className="font-bold text-lg text-green-600 mb-3 flex items-center gap-2">
                                    <Banknote size={20} />
                                    Billetes Favoritos ({billetesFavoritos.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {billetesFavoritos.map(b => (
                                        <CardItem
                                            key={b.id}
                                            item={b}
                                            tipo="billetes"
                                            setItemEditando={setItemEditando}
                                            setTipoFormulario={setTipoFormulario}
                                            setVista={setVista}
                                            setImagenZoom={setImagenZoom}
                                            handleDragStart={handleDragStart}
                                            handleDragOver={handleDragOver}
                                            handleDrop={handleDrop}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalFavoritos;
