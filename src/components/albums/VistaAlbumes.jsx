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
                        {albums.map(album => (
                            <div
                                key={album.id}
                                className={`group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${modoOscuro ? 'bg-gray-800 shadow-lg shadow-black/20' : 'bg-white shadow-md'
                                    }`}
                            >
                                {/* Cover Effect */}
                                <div className="h-48 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 flex flex-col justify-end relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <Book size={48} className="text-white/20 absolute top-6 right-6" />

                                    <h3 className="text-2xl font-bold text-white mb-1 relative z-10">
                                        {album.title}
                                    </h3>
                                    <p className="text-indigo-100 text-sm relative z-10 line-clamp-2">
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
                        ))}
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
