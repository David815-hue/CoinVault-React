import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';

const Page = React.forwardRef(({ children, number, modoOscuro, design }, ref) => {
    const getPageStyle = () => {
        if (design === 'modern') return 'bg-white text-slate-800';
        if (design === 'minimal') return 'bg-gray-50 text-gray-800';
        return modoOscuro ? 'bg-slate-800 text-white' : 'bg-amber-50 text-slate-800'; // Classic default
    };

    return (
        <div className={`page ${getPageStyle()} h-full border-r border-gray-300 shadow-inner p-8`} ref={ref}>
            <div className={`h-full ${design === 'minimal' ? 'border-0' : 'border-2 border-dashed border-gray-300'} p-4 rounded-xl flex flex-col`}>
                {children}
                <div className="mt-auto text-center text-xs text-gray-400">
                    {number}
                </div>
            </div>
        </div>
    );
});

const VistaLibro = ({ album, onBack }) => {
    const { modoOscuro } = useTheme();
    const { obtenerItemsAlbum } = useCollection();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const bookRef = useRef();

    useEffect(() => {
        const loadItems = async () => {
            setLoading(true);
            try {
                const albumItems = await obtenerItemsAlbum(album.id);
                setItems(albumItems);
            } catch (error) {
                console.error("Error loading album items:", error);
            } finally {
                setLoading(false);
            }
        };
        loadItems();
    }, [album, obtenerItemsAlbum]);

    const getCoverColor = (color) => {
        const colors = {
            indigo: 'bg-indigo-900 border-indigo-950',
            emerald: 'bg-emerald-900 border-emerald-950',
            rose: 'bg-rose-900 border-rose-950',
            amber: 'bg-amber-900 border-amber-950',
            cyan: 'bg-cyan-900 border-cyan-950',
        };
        return colors[color] || colors.indigo;
    };

    const getCoverTextColor = (color) => {
        const colors = {
            indigo: 'text-indigo-200',
            emerald: 'text-emerald-200',
            rose: 'text-rose-200',
            amber: 'text-amber-200',
            cyan: 'text-cyan-200',
        };
        return colors[color] || colors.indigo;
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${modoOscuro ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="text-xl animate-pulse">Cargando álbum...</div>
            </div>
        );
    }

    const coverColorClass = getCoverColor(album.color);
    const coverTextColorClass = getCoverTextColor(album.color);

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${modoOscuro ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <button
                onClick={onBack}
                className="absolute top-8 left-8 flex items-center gap-2 text-[var(--color-primary)] font-bold hover:text-[var(--color-primary-hover)] z-10"
            >
                <ArrowLeft size={24} /> Volver a Álbumes
            </button>

            <div className="relative shadow-2xl rounded-r-xl">
                <HTMLFlipBook
                    width={400}
                    height={600}
                    showCover={true}
                    maxShadowOpacity={0.5}
                    className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}
                    ref={bookRef}
                >
                    {/* Cover */}
                    <div className={`cover ${coverColorClass} text-white p-10 flex flex-col items-center justify-center text-center h-full border-r-4`}>
                        <BookOpen size={64} className="mb-6 text-white/80" />
                        <h1 className={`text-4xl font-bold mb-4 ${album.design === 'modern' ? 'font-sans' : 'font-serif'}`}>{album.title}</h1>
                        <p className={coverTextColorClass}>{album.description}</p>
                        <div className={`mt-12 text-sm ${coverTextColorClass} uppercase tracking-widest`}>Colección Privada</div>
                    </div>

                    {/* Pages */}
                    {items.map((item, index) => (
                        <Page number={index + 1} key={item.id} modoOscuro={modoOscuro} design={album.design}>
                            <div className="flex flex-col h-full items-center">
                                <h3 className={`text-xl font-bold mb-4 text-center ${album.design === 'modern' ? 'font-sans' : 'font-serif'}`}>{item.nombre}</h3>

                                <div className={`relative mb-6 shadow-xl overflow-hidden border-4 border-amber-500/20 ${item.type === 'monedas'
                                    ? 'w-48 h-48 rounded-full'
                                    : 'w-64 h-32 rounded-lg'
                                    }`}>
                                    <img
                                        src={item.fotoFrontal || 'https://via.placeholder.com/150'}
                                        alt={item.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="space-y-3 text-sm w-full bg-black/5 p-4 rounded-lg">
                                    <div className="flex justify-between border-b border-gray-300 pb-2">
                                        <span className="font-semibold">País:</span>
                                        <span>{item.pais}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-300 pb-2">
                                        <span className="font-semibold">Año:</span>
                                        <span>{item.ano}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-300 pb-2">
                                        <span className="font-semibold">Valor:</span>
                                        <span className="text-emerald-600 font-bold">L. {item.valorComprado || '0.00'}</span>
                                    </div>
                                </div>

                                <p className="mt-6 text-sm italic text-center text-gray-500 line-clamp-4">
                                    {item.descripcion || 'Sin descripción disponible.'}
                                </p>
                            </div>
                        </Page>
                    ))}

                    {/* Back Cover */}
                    <div className={`cover ${coverColorClass} text-white p-10 flex flex-col items-center justify-center h-full border-l-4`}>
                        <div className={coverTextColorClass + " text-sm"}>Fin del Álbum</div>
                        <BookOpen size={32} className="mt-4 text-white/50" />
                    </div>
                </HTMLFlipBook>
            </div>
        </div>
    );
};

export default VistaLibro;
