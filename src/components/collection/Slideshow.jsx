import React, { useState, useEffect } from 'react';
import { X, Pause, Play, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useCollection } from '../../context/CollectionContext';

const Slideshow = ({ tipo, onClose }) => {
    const { monedas, billetes } = useCollection();
    const items = tipo === 'monedas' ? monedas : billetes;

    const [indiceSlideshow, setIndiceSlideshow] = useState(0);
    const [reproduciendo, setReproduciendo] = useState(true);

    const itemActual = items[indiceSlideshow];

    useEffect(() => {
        let intervalo;
        if (reproduciendo) {
            intervalo = setInterval(() => {
                setIndiceSlideshow((prev) => {
                    return prev + 1 >= items.length ? 0 : prev + 1;
                });
            }, 3000);
        }
        return () => clearInterval(intervalo);
    }, [reproduciendo, items.length]);

    if (!itemActual) return null;

    const siguiente = () => {
        setIndiceSlideshow((prev) => prev + 1 >= items.length ? 0 : prev + 1);
    };

    const anterior = () => {
        setIndiceSlideshow((prev) => prev - 1 < 0 ? items.length - 1 : prev - 1);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-300 flex items-center gap-2"
                    >
                        <X size={24} />
                        <span className="hidden md:inline">Cerrar</span>
                    </button>
                    <div className="text-white">
                        <span className="font-bold">{indiceSlideshow + 1}</span> / {items.length}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setReproduciendo(!reproduciendo)}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        {reproduciendo ? <Pause size={20} /> : <Play size={20} />}
                        <span className="hidden md:inline">{reproduciendo ? 'Pausar' : 'Reproducir'}</span>
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
                {/* Botón Anterior */}
                <button
                    onClick={anterior}
                    className="absolute left-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
                >
                    <ChevronLeft size={32} />
                </button>

                {/* Item Central */}
                <div className="max-w-5xl w-full bg-white/10 backdrop-blur-md rounded-2xl p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Imágenes */}
                        <div className="space-y-4">
                            {itemActual.fotoFrontal && (
                                <div>
                                    <p className="text-white/70 text-sm mb-2">Frontal</p>
                                    <img
                                        src={itemActual.fotoFrontal}
                                        alt="Frontal"
                                        className="w-full h-64 object-contain rounded-lg bg-white/5"
                                    />
                                </div>
                            )}
                            {itemActual.fotoTrasera && (
                                <div>
                                    <p className="text-white/70 text-sm mb-2">Trasera</p>
                                    <img
                                        src={itemActual.fotoTrasera}
                                        alt="Trasera"
                                        className="w-full h-64 object-contain rounded-lg bg-white/5"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Información */}
                        <div className="text-white space-y-4">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{itemActual.nombre}</h2>
                                {!tipo.includes('moneda') && itemActual.denominacion && (
                                    <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1 rounded-full text-sm font-bold mb-3">
                                        ${itemActual.denominacion}
                                    </div>
                                )}
                            </div>

                            {itemActual.descripcion && (
                                <p className="text-white/80 text-lg">{itemActual.descripcion}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <p className="text-white/60 text-sm">Año</p>
                                    <p className="text-xl font-bold">{itemActual.ano}</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <p className="text-white/60 text-sm">País</p>
                                    <p className="text-xl font-bold">{itemActual.pais}</p>
                                </div>
                                {tipo.includes('moneda') && itemActual.material && (
                                    <div className="bg-white/10 rounded-lg p-3">
                                        <p className="text-white/60 text-sm">Material</p>
                                        <p className="text-xl font-bold">{itemActual.material}</p>
                                    </div>
                                )}
                                {itemActual.estado && (
                                    <div className="bg-white/10 rounded-lg p-3">
                                        <p className="text-white/60 text-sm">Estado</p>
                                        <p className="text-xl font-bold">{itemActual.estado}</p>
                                    </div>
                                )}
                            </div>

                            {(itemActual.valorComprado || itemActual.valorVenta) && (
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    {itemActual.valorComprado && (
                                        <div className="bg-green-500/20 rounded-lg p-3">
                                            <p className="text-green-200 text-sm">Valor Compra</p>
                                            <p className="text-2xl font-bold">${parseFloat(itemActual.valorComprado).toFixed(2)}</p>
                                        </div>
                                    )}
                                    {itemActual.valorVenta && (
                                        <div className="bg-blue-500/20 rounded-lg p-3">
                                            <p className="text-blue-200 text-sm">Valor Venta</p>
                                            <p className="text-2xl font-bold">${parseFloat(itemActual.valorVenta).toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botón Siguiente */}
                <button
                    onClick={siguiente}
                    className="absolute right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Footer con miniaturas */}
            <div className="bg-black/50 backdrop-blur-sm p-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {items.map((item, idx) => (
                        <button
                            key={item.id}
                            onClick={() => setIndiceSlideshow(idx)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === indiceSlideshow ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                                }`}
                        >
                            {item.fotoFrontal ? (
                                <img src={item.fotoFrontal} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                    <Camera size={24} className="text-gray-500" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Slideshow;
