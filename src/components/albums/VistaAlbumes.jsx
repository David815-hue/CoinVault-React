import React, { useState } from 'react';
import { Book, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import ModalCrearAlbum from './ModalCrearAlbum';
import VistaLibro from './VistaLibro';

const VistaAlbumes = () => {
    const { modoOscuro } = useTheme();
    const { albums, eliminarAlbumExistente } = useCollection();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [albumSeleccionado, setAlbumSeleccionado] = useState(null);

    if (albumSeleccionado) {
        return <VistaLibro album={albumSeleccionado} onBack={() => setAlbumSeleccionado(null)} />;
    }

    return (
        <div className={`min-h-screen p-6 pb-24 ${modoOscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className={`text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} flex items-center gap-3`}>
                            <Book className="text-indigo-500" size={32} />
                            Álbumes Virtuales
                        </h1>
                        <p className={`mt-2 ${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                            Organiza tu colección en álbumes temáticos
                        </p>
                    </div>
                    <button
                        onClick={() => setMostrarModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/30"
                    >
                        <Plus size={20} />
                        Crear Álbum
                    </button>
                </div>

                {albums.length === 0 ? (
                    <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${modoOscuro ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}>
                        <Book size={64} className={`mx-auto mb-4 ${modoOscuro ? 'text-gray-600' : 'text-gray-300'}`} />
                        <h3 className={`text-xl font-bold mb-2 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                            No tienes álbumes creados
                        </h3>
                        <p className={`mb-6 ${modoOscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                            Crea tu primer álbum para organizar tus monedas y billetes.
                        </p>
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="text-indigo-500 hover:text-indigo-400 font-semibold"
                        >
                            Crear mi primer álbum
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {albums.map(album => {
                            // Color mapping for cards
                            const getCardColor = (color) => {
                                const colors = {
                                    indigo: 'from-indigo-600 to-indigo-800',
                                    emerald: 'from-emerald-600 to-emerald-800',
                                    rose: 'from-rose-600 to-rose-800',
                                    amber: 'from-amber-600 to-amber-800',
                                    cyan: 'from-cyan-600 to-cyan-800',
                                    slate: 'from-slate-600 to-slate-800',
                                    violet: 'from-violet-600 to-violet-800',
                                    crimson: 'from-red-700 to-red-900',
                                    teal: 'from-teal-600 to-teal-800',
                                };
                                return colors[color] || colors.indigo;
                            };

                            const cardGradient = getCardColor(album.color);

                            return (
                                <div
                                    key={album.id}
                                    className={`group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${modoOscuro ? 'bg-gray-800 shadow-lg shadow-black/20' : 'bg-white shadow-md'
                                        }`}
                                >
                                    {/* Cover Effect with Page Preview */}
                                    <div className={`h-48 bg-gradient-to-br ${cardGradient} p-6 flex flex-col justify-end relative overflow-hidden`}>
                                        {/* Decorative Elements */}
                                        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                                        {/* Page Preview Effect - Refined */}
                                        <div className="absolute top-6 right-6 w-16 h-20 bg-white/90 rounded-sm shadow-lg transform rotate-6 translate-x-2 transition-transform group-hover:translate-x-3 group-hover:rotate-12 opacity-80">
                                            <div className="w-full h-full border-l-[3px] border-gray-300/50 p-1.5 flex flex-col gap-1.5">
                                                <div className="w-full h-1 bg-gray-300/50 rounded-full"></div>
                                                <div className="w-3/4 h-1 bg-gray-300/50 rounded-full"></div>
                                                <div className="w-full h-1 bg-gray-300/50 rounded-full"></div>
                                                <div className="w-1/2 h-1 bg-gray-300/50 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="absolute top-6 right-6 w-16 h-20 bg-white rounded-sm shadow-md transform rotate-3 transition-transform group-hover:translate-x-1 group-hover:rotate-6 opacity-60 -z-10"></div>

                                        <Book size={48} className="text-white/20 absolute top-6 left-6" />

                                        <h3 className="text-2xl font-bold text-white mb-1 relative z-10 drop-shadow-md">
                                            {album.title}
                                        </h3>
                                        <p className="text-white/80 text-sm relative z-10 line-clamp-2">
                                            {album.description}
                                        </p>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mt-4">
                                            <button
                                                onClick={() => setAlbumSeleccionado(album)}
                                                className="flex items-center gap-2 text-indigo-500 font-semibold group-hover:gap-3 transition-all"
                                            >
                                                Abrir Álbum <ArrowRight size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('¿Eliminar álbum?')) eliminarAlbumExistente(album.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {mostrarModal && (
                    <ModalCrearAlbum onClose={() => setMostrarModal(false)} />
                )}
            </div>
        </div>
    );
};

export default VistaAlbumes;
