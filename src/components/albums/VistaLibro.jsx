import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';

const Page = React.forwardRef(({ children, number, modoOscuro, design }, ref) => {
    const getPageStyle = () => {
        if (design === 'modern') return 'bg-white text-slate-800';
        if (design === 'minimal') return 'bg-gray-50 text-gray-800';
        if (design === 'vintage') return 'bg-[#f4e4bc] text-[#5c4033] font-serif';
        if (design === 'grid') return 'bg-slate-100 text-slate-800';
        if (design === 'elegant') return 'bg-slate-900 text-amber-100';
        return modoOscuro ? 'bg-slate-800 text-white' : 'bg-amber-50 text-slate-800';
    };

    const getBorderClass = () => {
        if (design === 'minimal') return 'border-0';
        if (design === 'vintage') return 'border-4 border-double border-[#8b5a2b]';
        if (design === 'elegant') return 'border-2 border-amber-500/30';
        if (design === 'grid') return 'border-2 border-dashed border-slate-300';
        return 'border-2 border-dashed border-gray-300';
    };

    return (
        <div className={`page ${getPageStyle()} h-full border-r border-gray-300 shadow-inner p-4 md:p-8`} ref={ref}>
            <div className={`h-full ${getBorderClass()} p-3 md:p-4 rounded-xl flex flex-col relative overflow-hidden`}>
                {design === 'vintage' && <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>}
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
    const [isSinglePage, setIsSinglePage] = useState(true); // Default single on mobile
    const [dimensions, setDimensions] = useState({ width: 350, height: 500 });
    const bookRef = useRef();
    const containerRef = useRef();

    // Calculate responsive dimensions
    useEffect(() => {
        const updateDimensions = () => {
            const isMobile = window.innerWidth < 768;
            const maxWidth = Math.min(window.innerWidth - 40, 500);
            const maxHeight = window.innerHeight - 200;

            // Maintain aspect ratio
            const aspectRatio = 0.7; // width/height
            let width = maxWidth;
            let height = width / aspectRatio;

            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }

            setDimensions({
                width: Math.floor(width),
                height: Math.floor(height)
            });

            // Force single page on mobile
            if (isMobile) {
                setIsSinglePage(true);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

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
            slate: 'bg-slate-900 border-slate-950',
            violet: 'bg-violet-900 border-violet-950',
            crimson: 'bg-red-900 border-red-950',
            teal: 'bg-teal-900 border-teal-950',
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
            slate: 'text-slate-200',
            violet: 'text-violet-200',
            crimson: 'text-red-200',
            teal: 'text-teal-200',
        };
        return colors[color] || colors.indigo;
    };

    const goToPrevPage = () => {
        if (bookRef.current) {
            bookRef.current.pageFlip().flipPrev();
        }
    };

    const goToNextPage = () => {
        if (bookRef.current) {
            bookRef.current.pageFlip().flipNext();
        }
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
    const isMobile = window.innerWidth < 768;

    return (
        <div className={`album-viewer min-h-screen flex flex-col items-center justify-center p-4 md:p-8 ${modoOscuro ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-4 z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--color-primary)] font-bold hover:text-[var(--color-primary-hover)] text-sm md:text-base"
                >
                    <ArrowLeft size={20} /> <span className="hidden sm:inline">Volver a Álbumes</span>
                </button>

                {!isMobile && (
                    <button
                        onClick={() => setIsSinglePage(!isSinglePage)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${modoOscuro ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50'} shadow-md`}
                    >
                        <BookOpen size={18} />
                        {isSinglePage ? 'Vista Doble' : 'Vista Simple'}
                    </button>
                )}
            </div>

            {/* Book Container */}
            <div ref={containerRef} className="relative flex items-center justify-center">
                {/* Navigation Arrows */}
                <button
                    onClick={goToPrevPage}
                    className={`absolute left-0 md:-left-16 z-20 p-2 rounded-full shadow-lg transition-all ${modoOscuro ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="shadow-2xl rounded-lg overflow-hidden">
                    <HTMLFlipBook
                        key={`${isSinglePage}-${dimensions.width}`}
                        width={dimensions.width}
                        height={dimensions.height}
                        showCover={true}
                        maxShadowOpacity={0.3}
                        mobileScrollSupport={true}
                        className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}
                        ref={bookRef}
                        usePortrait={isSinglePage}
                        startPage={0}
                        drawShadow={true}
                        flippingTime={600}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showPageCorners={true}
                        disableFlipByClick={false}
                    >
                        {/* Cover */}
                        <div className={`cover ${coverColorClass} text-white p-6 md:p-10 flex flex-col items-center justify-center text-center h-full border-r-4 relative overflow-hidden`}>
                            {album.design === 'elegant' && <div className="absolute inset-0 border-8 border-double border-amber-500/30 m-4 pointer-events-none"></div>}
                            {album.design === 'vintage' && <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>}

                            <BookOpen size={48} className="mb-4 text-white/80 relative z-10" />
                            <h1 className={`text-2xl md:text-3xl font-bold mb-3 relative z-10 ${album.design === 'modern' ? 'font-sans' : 'font-serif'}`}>{album.title}</h1>
                            <p className={`${coverTextColorClass} text-sm`}>{album.description}</p>
                            <div className={`mt-8 text-xs ${coverTextColorClass} uppercase tracking-widest`}>Colección Privada</div>
                        </div>

                        {/* Pages */}
                        {items.map((item, index) => (
                            <Page number={index + 1} key={item.id} modoOscuro={modoOscuro} design={album.design}>
                                <div className="flex flex-col h-full items-center relative z-10">
                                    <h3 className={`text-lg md:text-xl font-bold mb-3 text-center ${album.design === 'modern' ? 'font-sans' :
                                        album.design === 'vintage' ? 'font-serif tracking-widest text-[#3e2723]' :
                                            album.design === 'elegant' ? 'font-serif text-amber-200' : 'font-serif'
                                        }`}>{item.nombre}</h3>

                                    <div className={`relative mb-4 shadow-xl overflow-hidden ${album.design === 'vintage' ? 'border-4 border-[#8b5a2b] sepia-[.3]' :
                                        album.design === 'elegant' ? 'border-2 border-amber-500/50 shadow-amber-500/20' :
                                            album.design === 'grid' ? 'border-2 border-slate-200 rounded-xl' :
                                                'border-4 border-amber-500/20'
                                        } ${item.type === 'monedas'
                                            ? 'w-32 h-32 md:w-40 md:h-40 rounded-full'
                                            : 'w-48 h-24 md:w-56 md:h-28 rounded-lg'
                                        }`}>
                                        <img
                                            src={item.fotoFrontal || 'https://via.placeholder.com/150'}
                                            alt={item.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="space-y-2 text-xs md:text-sm w-full bg-black/5 p-3 rounded-lg">
                                        <div className="flex justify-between border-b border-gray-300 pb-1">
                                            <span className="font-semibold">País:</span>
                                            <span>{item.pais}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-300 pb-1">
                                            <span className="font-semibold">Año:</span>
                                            <span>{item.ano}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-300 pb-1">
                                            <span className="font-semibold">Valor:</span>
                                            <span className="text-emerald-600 font-bold">L. {item.valorComprado || '0.00'}</span>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-xs italic text-center text-gray-500 line-clamp-2">
                                        {item.descripcion || 'Sin descripción.'}
                                    </p>
                                </div>
                            </Page>
                        ))}

                        {/* Back Cover */}
                        <div className={`cover ${coverColorClass} text-white p-6 md:p-10 flex flex-col items-center justify-center h-full border-l-4`}>
                            <div className={coverTextColorClass + " text-sm"}>Fin del Álbum</div>
                            <BookOpen size={28} className="mt-4 text-white/50" />
                        </div>
                    </HTMLFlipBook>
                </div>

                <button
                    onClick={goToNextPage}
                    className={`absolute right-0 md:-right-16 z-20 p-2 rounded-full shadow-lg transition-all ${modoOscuro ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Hint for mobile */}
            <div className={`mt-4 text-xs ${modoOscuro ? 'text-gray-500' : 'text-gray-400'}`}>
                Desliza o usa las flechas para pasar página
            </div>
        </div>
    );
};

export default VistaLibro;

