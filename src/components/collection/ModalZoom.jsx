import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ModalZoom = ({ imagen, onClose }) => {
    const { modoOscuro } = useTheme();
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [mostrarTrasera, setMostrarTrasera] = useState(false);

    // Touch gesture states
    const [initialPinchDistance, setInitialPinchDistance] = useState(null);
    const [initialScale, setInitialScale] = useState(1);
    const [lastTap, setLastTap] = useState(0);

    const imageRef = useRef(null);
    const containerRef = useRef(null);

    if (!imagen) return null;

    // Support both old format (string) and new format (object with frontal/trasera)
    const imagenFrontal = typeof imagen === 'string' ? imagen : imagen.frontal;
    const imagenTrasera = typeof imagen === 'string' ? null : imagen.trasera;
    const imagenActual = (mostrarTrasera && imagenTrasera) ? imagenTrasera : imagenFrontal;

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

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate tilt based on mouse position relative to center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 180;
            const rotateX = -((y - centerY) / centerY) * 20;

            setTilt({ x: rotateX, y: rotateY });

            // Show back image when rotated past 90 degrees (if available)
            if (imagenTrasera) {
                setMostrarTrasera(Math.abs(rotateY) > 90);
            }
        }

        // Handle dragging for pan
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Helper function to calculate distance between two touch points
    const getTouchDistance = (touch1, touch2) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
        // Double tap to zoom
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTap < DOUBLE_TAP_DELAY && e.touches.length === 1) {
            e.preventDefault();
            if (scale > 1) {
                handleReset();
            } else {
                setScale(2);
            }
            setLastTap(0);
            return;
        }
        setLastTap(now);

        if (e.touches.length === 2) {
            // Pinch to zoom
            e.preventDefault();
            const distance = getTouchDistance(e.touches[0], e.touches[1]);
            setInitialPinchDistance(distance);
            setInitialScale(scale);
            setIsDragging(false);
        } else if (e.touches.length === 1) {
            // Single finger for 3D tilt OR drag when zoomed
            const touch = e.touches[0];
            setIsDragging(true);
            setDragStart({
                x: touch.clientX - position.x,
                y: touch.clientY - position.y
            });
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && initialPinchDistance) {
            // Pinch zoom
            e.preventDefault();
            const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
            const scaleChange = currentDistance / initialPinchDistance;
            const newScale = Math.max(0.5, Math.min(5, initialScale * scaleChange));
            setScale(newScale);
        } else if (e.touches.length === 1 && containerRef.current) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = containerRef.current.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            // Calculate 3D tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 180;
            const rotateX = -((y - centerY) / centerY) * 20;

            setTilt({ x: rotateX, y: rotateY });

            // Show back image when rotated past 90 degrees
            if (imagenTrasera) {
                setMostrarTrasera(Math.abs(rotateY) > 90);
            }

            // Also handle pan when zoomed
            if (scale > 1 && isDragging) {
                setPosition({
                    x: touch.clientX - dragStart.x,
                    y: touch.clientY - dragStart.y
                });
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (e.touches.length < 2) {
            setInitialPinchDistance(null);
        }
        if (e.touches.length === 0) {
            setIsDragging(false);
        }
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'r' || e.key === 'R') handleRotate();
            if (e.key === '0') handleReset();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                title="Cerrar (Esc)"
            >
                <X size={24} />
            </button>

            {/* Controls - Simplified */}
            <div className="absolute top-4 left-4 flex gap-3 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRotate();
                    }}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Rotar (R)"
                >
                    <RotateCw size={22} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                    }}
                    className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                    title="Reiniciar (0)"
                >
                    Reset
                </button>
            </div>

            {/* Zoom Level Indicator */}
            {scale !== 1 && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                    {Math.round(scale * 100)}%
                </div>
            )}

            {/* 3D Mode Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-indigo-600/80 text-white text-sm font-medium">
                <span className="hidden md:inline">Mueve el mouse para rotar en 3D • Rueda para zoom</span>
                <span className="md:hidden">Mueve el dedo para rotar • Pellizca para zoom</span>
            </div>

            {/* Image Container */}
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
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
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'move',
                    perspective: '1000px'
                }}
            >
                <img
                    ref={imageRef}
                    src={imagenActual}
                    alt={mostrarTrasera ? "Trasera" : "Frontal"}
                    className="max-w-[85vw] max-h-[85vh] object-contain select-none transition-transform duration-100 ease-out"
                    style={{
                        transform: `
                            perspective(1000px)
                            rotateX(${tilt.x}deg) 
                            rotateY(${tilt.y}deg) 
                            rotate(${rotation}deg) 
                            scale(${scale})
                            translate(${position.x / scale}px, ${position.y / scale}px)
                        `,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    draggable={false}
                />
            </div>
        </div>
    );
};

export default ModalZoom;
