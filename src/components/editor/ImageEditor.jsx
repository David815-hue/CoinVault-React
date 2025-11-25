import React, { useState, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Save, X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

const ImageEditor = ({ imagen, onSave, onCancel, esMoneda, modoOscuro }) => {
    const cropperRef = useRef(null);

    const getRoundedCanvas = (sourceCanvas) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;

        canvas.width = width;
        canvas.height = height;
        context.imageSmoothingEnabled = true;
        context.drawImage(sourceCanvas, 0, 0, width, height);
        context.globalCompositeOperation = 'destination-in';
        context.beginPath();
        context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
        context.fill();
        return canvas;
    };

    const onCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            // Obtener la imagen recortada como base64
            let croppedCanvas = cropper.getCroppedCanvas({
                width: esMoneda ? 500 : 800, // Tamaño máximo sugerido
                height: esMoneda ? 500 : undefined,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            if (croppedCanvas) {
                if (esMoneda) {
                    croppedCanvas = getRoundedCanvas(croppedCanvas);
                }
                onSave(croppedCanvas.toDataURL());
            }
        }
    };

    const rotate = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.rotate(90);
        }
    };

    const zoom = (ratio) => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.zoom(ratio);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex flex-col items-center justify-center p-4">
            <div className={`w-full max-w-4xl ${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden flex flex-col max-h-[90vh]`}>

                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className={`text-lg font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                        Editar {esMoneda ? 'Moneda' : 'Billete'}
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center p-4">
                    <Cropper
                        src={imagen}
                        style={{ height: '100%', maxHeight: '60vh', width: '100%' }}
                        initialAspectRatio={esMoneda ? 1 : NaN}
                        aspectRatio={esMoneda ? 1 : NaN}
                        guides={true}
                        viewMode={1}
                        dragMode="move"
                        responsive={true}
                        autoCropArea={0.8}
                        checkOrientation={false}
                        ref={cropperRef}
                        background={false}
                        className={esMoneda ? 'cropper-circle-mask' : ''}
                    />
                    {/* Máscara visual circular para monedas */}
                    {esMoneda && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-50">
                            {/* Esto es solo visual, cropperjs hace el recorte cuadrado por defecto, 
                   pero podemos simular la vista previa circular. 
                   El recorte real será cuadrado, pero CSS puede mostrarlo redondo en la UI final.
                   O podemos usar getCroppedCanvas con opciones para redondear si fuera necesario,
                   pero generalmente se guarda cuadrado y se muestra redondo con border-radius.
               */}
                        </div>
                    )}
                </div>

                <div className={`p-4 border-t ${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-wrap gap-4 justify-between items-center`}>
                    <div className="flex gap-2">
                        <button
                            onClick={() => zoom(0.1)}
                            className={`p-2 rounded-lg ${modoOscuro ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title="Zoom In"
                        >
                            <ZoomIn size={20} />
                        </button>
                        <button
                            onClick={() => zoom(-0.1)}
                            className={`p-2 rounded-lg ${modoOscuro ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title="Zoom Out"
                        >
                            <ZoomOut size={20} />
                        </button>
                        <button
                            onClick={rotate}
                            className={`p-2 rounded-lg ${modoOscuro ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title="Rotar"
                        >
                            <RotateCw size={20} />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 text-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onCrop}
                            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={20} />
                            Guardar Recorte
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
        .cropper-circle-mask .cropper-view-box,
        .cropper-circle-mask .cropper-face {
          border-radius: 50%;
        }
      `}</style>
        </div>
    );
};

export default ImageEditor;
