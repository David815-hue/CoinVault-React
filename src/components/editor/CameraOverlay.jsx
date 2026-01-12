import React, { useState, useEffect, useRef } from 'react';
import { X, Check, RotateCcw, AlertCircle } from 'lucide-react';

const CameraOverlay = ({ esMoneda, onCapture, onCancel }) => {
    const [imagenCapturada, setImagenCapturada] = useState(null);
    const [cameraActiva, setCameraActiva] = useState(false);
    const [usandoCamaraFrontal, setUsandoCamaraFrontal] = useState(false);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [dimensiones, setDimensiones] = useState({ width: 0, height: 0 });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const actualizarDimensiones = () => {
            setDimensiones({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        actualizarDimensiones();
        window.addEventListener('resize', actualizarDimensiones);

        iniciarCamara();

        return () => {
            window.removeEventListener('resize', actualizarDimensiones);
            detenerCamara();
        };
    }, []);

    // Calcular dimensiones del overlay
    const calcularOverlay = () => {
        const { width, height } = dimensiones;
        if (width === 0 || height === 0) return { overlayWidth: 0, overlayHeight: 0, top: 0, left: 0, borderRadius: '0' };

        if (esMoneda) {
            // Moneda: círculo que ocupa 65% del lado menor
            const size = Math.min(width, height) * 0.65;
            return {
                overlayWidth: size,
                overlayHeight: size,
                top: (height - size) / 2,
                left: (width - size) / 2,
                borderRadius: '50%'
            };
        } else {
            // Billete: rectángulo horizontal con proporción 2.2:1
            const maxWidth = width * 0.9;
            const maxHeight = height * 0.4;
            const billeteRatio = 2.2;

            let overlayWidth = maxWidth;
            let overlayHeight = overlayWidth / billeteRatio;

            if (overlayHeight > maxHeight) {
                overlayHeight = maxHeight;
                overlayWidth = overlayHeight * billeteRatio;
            }

            return {
                overlayWidth,
                overlayHeight,
                top: (height - overlayHeight) / 2,
                left: (width - overlayWidth) / 2,
                borderRadius: '12px'
            };
        }
    };

    const overlay = calcularOverlay();

    const iniciarCamara = async () => {
        try {
            setCargando(true);
            setError(null);

            const constraints = {
                video: {
                    facingMode: usandoCamaraFrontal ? 'user' : 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraActiva(true);
            }
        } catch (err) {
            console.error('Error al iniciar cámara:', err);
            if (err.name === 'NotAllowedError') {
                setError('Permiso de cámara denegado. Por favor, permite el acceso a la cámara.');
            } else if (err.name === 'NotFoundError') {
                setError('No se encontró ninguna cámara en el dispositivo.');
            } else {
                setError('Error al acceder a la cámara. Intenta de nuevo.');
            }
        } finally {
            setCargando(false);
        }
    };

    const detenerCamara = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActiva(false);
    };

    const cambiarCamara = async () => {
        detenerCamara();
        setUsandoCamaraFrontal(!usandoCamaraFrontal);
        // useEffect se encargará de reiniciar con la nueva cámara
        setTimeout(() => iniciarCamara(), 100);
    };

    const capturarFoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Capturar el frame actual del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imagenBase64 = canvas.toDataURL('image/jpeg', 0.9);
        setImagenCapturada(imagenBase64);
        detenerCamara();
    };

    const cancelarCaptura = async () => {
        setImagenCapturada(null);
        await iniciarCamara();
    };

    const confirmarCaptura = () => {
        recortarImagen(imagenCapturada).then((imagenRecortada) => {
            onCapture(imagenRecortada);
        });
    };

    const recortarImagen = (imagenBase64) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const imgWidth = img.width;
                const imgHeight = img.height;

                // Calcular área de recorte basada en el overlay
                const scaleX = imgWidth / dimensiones.width;
                const scaleY = imgHeight / dimensiones.height;

                const cropX = overlay.left * scaleX;
                const cropY = overlay.top * scaleY;
                const cropWidth = overlay.overlayWidth * scaleX;
                const cropHeight = overlay.overlayHeight * scaleY;

                canvas.width = cropWidth;
                canvas.height = cropHeight;

                if (esMoneda) {
                    // Recorte circular
                    ctx.beginPath();
                    ctx.arc(cropWidth / 2, cropHeight / 2, Math.min(cropWidth, cropHeight) / 2, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                }

                ctx.drawImage(
                    img,
                    cropX, cropY, cropWidth, cropHeight,
                    0, 0, cropWidth, cropHeight
                );

                resolve(canvas.toDataURL('image/png', 0.9));
            };
            img.src = imagenBase64;
        });
    };

    const handleCancelar = () => {
        detenerCamara();
        onCancel();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black">
            {/* Video de la cámara */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: cameraActiva && !imagenCapturada ? 'block' : 'none' }}
            />

            {/* Canvas oculto para captura */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Estado de carga */}
            {cargando && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white text-lg">Iniciando cámara...</p>
                    </div>
                </div>
            )}

            {/* Estado de error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-30 p-6">
                    <div className="text-center max-w-sm">
                        <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
                        <p className="text-white text-lg mb-6">{error}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={iniciarCamara}
                                className="px-6 py-3 bg-white text-black rounded-full font-semibold"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={handleCancelar}
                                className="px-6 py-3 bg-white/20 text-white rounded-full font-semibold"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay con marco - SOLO cuando la cámara está activa */}
            {!imagenCapturada && cameraActiva && !error && (
                <>
                    {/* Máscara oscura con agujero */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Top */}
                        <div
                            className="absolute top-0 left-0 right-0 bg-black/60"
                            style={{ height: overlay.top }}
                        />
                        {/* Bottom */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-black/60"
                            style={{ height: dimensiones.height - overlay.top - overlay.overlayHeight }}
                        />
                        {/* Left */}
                        <div
                            className="absolute bg-black/60"
                            style={{
                                top: overlay.top,
                                left: 0,
                                width: overlay.left,
                                height: overlay.overlayHeight
                            }}
                        />
                        {/* Right */}
                        <div
                            className="absolute bg-black/60"
                            style={{
                                top: overlay.top,
                                right: 0,
                                width: overlay.left,
                                height: overlay.overlayHeight
                            }}
                        />
                    </div>

                    {/* Borde del marco */}
                    <div
                        className="absolute border-4 border-white z-20 pointer-events-none"
                        style={{
                            top: overlay.top,
                            left: overlay.left,
                            width: overlay.overlayWidth,
                            height: overlay.overlayHeight,
                            borderRadius: overlay.borderRadius,
                            boxShadow: '0 0 30px rgba(255,255,255,0.4)',
                        }}
                    />

                    {/* Texto guía */}
                    <div className="absolute top-4 left-0 right-0 text-center z-20 pt-8">
                        <p className="text-white text-lg font-semibold drop-shadow-lg px-4 py-2 bg-black/30 inline-block rounded-full">
                            {esMoneda ? '📀 Centra la moneda' : '💵 Centra el billete'}
                        </p>
                    </div>
                </>
            )}

            {/* Vista previa de imagen capturada */}
            {imagenCapturada && (
                <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
                    <div
                        className="relative overflow-hidden border-4 border-white"
                        style={{
                            width: overlay.overlayWidth,
                            height: overlay.overlayHeight,
                            borderRadius: overlay.borderRadius,
                        }}
                    >
                        <img
                            src={imagenCapturada}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                            style={{
                                borderRadius: esMoneda ? '50%' : '8px',
                            }}
                        />
                    </div>

                    <div className="absolute top-8 left-0 right-0 text-center">
                        <p className="text-white text-lg font-semibold drop-shadow-lg">
                            ¿Usar esta foto?
                        </p>
                    </div>
                </div>
            )}

            {/* Controles de cámara */}
            {!imagenCapturada && cameraActiva && !error && (
                <div className="absolute bottom-0 left-0 right-0 pb-10 px-6 z-30" style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}>
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        <button
                            onClick={handleCancelar}
                            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-2 border-white/30"
                        >
                            <X size={28} className="text-white" />
                        </button>

                        <button
                            onClick={capturarFoto}
                            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl"
                            style={{ border: '4px solid rgba(255,255,255,0.5)' }}
                        >
                            <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-200" />
                        </button>

                        <button
                            onClick={cambiarCamara}
                            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-2 border-white/30"
                        >
                            <RotateCcw size={24} className="text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Controles de confirmación */}
            {imagenCapturada && (
                <div className="absolute bottom-0 left-0 right-0 pb-10 px-6 z-30" style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}>
                    <div className="flex items-center justify-center gap-16">
                        <button
                            onClick={cancelarCaptura}
                            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                        >
                            <X size={32} className="text-white" />
                        </button>

                        <button
                            onClick={confirmarCaptura}
                            className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                        >
                            <Check size={32} className="text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraOverlay;
