import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Box, FlipHorizontal } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ModalZoom = ({ imagen, onClose }) => {
    const { modoOscuro } = useTheme();
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [is3DMode, setIs3DMode] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [mostrarTrasera, setMostrarTrasera] = useState(false);

    const imageRef = useRef(null);
    const containerRef = useRef(null);

    if (!imagen) return null;

    // Support both old format (string) and new format (object with frontal/trasera)
    const imagenFrontal = typeof imagen === 'string' ? imagen : imagen.frontal;
    const imagenTrasera = typeof imagen === 'string' ? null : imagen.trasera;
    const imagenActual = (mostrarTrasera && imagenTrasera) ? imagenTrasera : imagenFrontal;

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.5, 5));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.5, 0.5));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
        setTilt({ x: 0, y: 0 });
        setMostrarTrasera(false);
    };

    const handleFlip = () => {
        if (imagenTrasera) {
            setMostrarTrasera(!mostrarTrasera);
        }
    };

    const handleMouseDown = (e) => {
        if (scale > 1 && !is3DMode) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (is3DMode && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate tilt based on mouse position relative to center
            // Range: -180deg to 180deg for full rotation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 180;
            const rotateX = -((y - centerY) / centerY) * 20;

            setTilt({ x: rotateX, y: rotateY });

            // Show back image when rotated past 90 degrees (if available)
            if (imagenTrasera) {
                setMostrarTrasera(Math.abs(rotateY) > 90);
            }
        } else if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1 && scale > 1 && !is3DMode) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        }
    };

    const handleTouchMove = (e) => {
        if (isDragging && e.touches.length === 1 && scale > 1 && !is3DMode) {
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        if (!is3DMode) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
        }
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-') handleZoomOut();
            if (e.key === 'r' || e.key === 'R') handleRotate();
            if (e.key === '0') handleReset();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 perspective-1000"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                title="Cerrar (Esc)"
            >
                <X size={24} />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleZoomIn();
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Acercar (+)"
                    disabled={is3DMode}
                >
                    <ZoomIn size={20} className={is3DMode ? 'opacity-50' : ''} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleZoomOut();
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Alejar (-)"
                    disabled={is3DMode}
                >
                    <ZoomOut size={20} className={is3DMode ? 'opacity-50' : ''} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRotate();
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Rotar (R)"
                >
                    <RotateCw size={20} />
                </button>
                {imagenTrasera && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFlip();
                        }}
                        className={`p-2 rounded-full transition-colors ${mostrarTrasera ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        title="Voltear (Ver otra cara)"
                    >
                        <FlipHorizontal size={20} />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIs3DMode(!is3DMode);
                        if (!is3DMode) {
                            setScale(1);
                            setPosition({ x: 0, y: 0 });
                        } else {
                            setTilt({ x: 0, y: 0 });
                        }
                    }}
                    className={`p-2 rounded-full transition-colors ${is3DMode ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    title="Efecto 3D"
                >
                    <Box size={20} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                    }}
                    className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                    title="Reiniciar (0)"
                >
                    Reset
                </button>
            </div>

            {/* Zoom Level Indicator */}
            {!is3DMode && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                    {Math.round(scale * 100)}%
                </div>
            )}

            {is3DMode && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-indigo-600/80 text-white text-sm font-medium animate-pulse">
                    Mueve el mouse para rotar en 3D
                </div>
            )}

            {/* Image Container */}
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center overflow-hidden perspective-1000"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                style={{
                    cursor: is3DMode ? 'move' : (scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'),
                    perspective: '1000px'
                }}
            >
                <img
                    ref={imageRef}
                    src={imagenActual}
                    alt={mostrarTrasera ? "Trasera" : "Frontal"}
                    className="max-w-[85vw] max-h-[85vh] object-contain select-none transition-transform duration-100 ease-out"
                    style={{
                        transform: is3DMode
                            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotate(${rotation}deg) scale(1.2)`
                            : `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
                        boxShadow: is3DMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none'
                    }}
                    draggable={false}
                />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 right-4 text-white/60 text-xs text-right">
                {is3DMode ? (
                    <div>Mueve el cursor para efecto 3D</div>
                ) : (
                    <>
                        <div>Rueda del mouse: Zoom</div>
                        <div>Arrastrar: Mover imagen</div>
                    </>
                )}
                <div>Doble clic: Reiniciar</div>
            </div>
        </div>
    );
};

export default ModalZoom;
