import React, { useState } from 'react';
import { ArrowLeft, Coins, Banknote, Camera, Edit2, Image } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useTheme } from '../../hooks/useTheme';
import { useCollection } from '../../context/CollectionContext';
import { PAISES, materialesMoneda, estadosConservacion } from '../../utils/constants';
import ImageEditor from './ImageEditor';
import CameraOverlay from './CameraOverlay';
import CountrySelect from '../common/CountrySelect';
import { compressImage } from '../../utils/imageUtils';

const Formulario = ({ tipoFormulario, itemEditando, setVista, setItemEditando }) => {
    const { modoOscuro } = useTheme();
    const { agregarItem, actualizarItem } = useCollection();
    const esMoneda = tipoFormulario === 'monedas';

    const [formData, setFormData] = useState(itemEditando || {
        nombre: '',
        descripcion: '',
        denominacion: '',
        fotoFrontal: '',
        fotoTrasera: '',
        ano: '',
        pais: '',
        material: '',
        estado: '',
        valorComprado: '',
        valorVenta: ''
    });

    const [imagenEditando, setImagenEditando] = useState(null);
    const [tipoImagenEditando, setTipoImagenEditando] = useState(null);
    const [showCameraOverlay, setShowCameraOverlay] = useState(false);
    const [cameraCallback, setCameraCallback] = useState(null);

    // Función para abrir cámara con overlay personalizado
    const handleCameraCapture = (setCallback, esMonedaTipo) => {
        setCameraCallback(() => setCallback);
        setShowCameraOverlay(true);
    };

    // Callback cuando se captura imagen del overlay - pasa directo sin editor
    const handleCameraOverlayCapture = async (imagenBase64) => {
        try {
            const compressed = await compressImage(imagenBase64);
            // Pasar directamente al callback sin abrir el editor
            if (cameraCallback) {
                cameraCallback(compressed);
            }
        } catch (error) {
            console.error('Error al procesar imagen:', error);
        } finally {
            setShowCameraOverlay(false);
            setCameraCallback(null);
        }
    };

    // Cancelar overlay de cámara
    const handleCameraOverlayCancel = () => {
        setShowCameraOverlay(false);
        setCameraCallback(null);
    };

    // Nueva función para galería en móvil
    const handleGalleryPick = async (setCallback, esMoneda) => {
        try {
            const image = await CapCamera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos
            });

            if (image.dataUrl) {
                const compressed = await compressImage(image.dataUrl);
                setImagenEditando(compressed);
                setTipoImagenEditando({ callback: setCallback, esMoneda });
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
        }
    };

    const handleImageUpload = async (e, setCallback, esMoneda) => {
        // En web, usar file input tradicional
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // Increased limit to 5MB since we compress
                alert('La imagen es muy grande. Usa una menor a 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const compressed = await compressImage(reader.result);
                    setImagenEditando(compressed);
                    setTipoImagenEditando({ callback: setCallback, esMoneda });
                } catch (error) {
                    console.error('Error compressing image:', error);
                    // Fallback to original if compression fails
                    setImagenEditando(reader.result);
                    setTipoImagenEditando({ callback: setCallback, esMoneda });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReEditImage = (imageSrc, setCallback, esMoneda) => {
        setImagenEditando(imageSrc);
        setTipoImagenEditando({ callback: setCallback, esMoneda });
    };

    const handleSubmit = () => {
        if (!formData.nombre || !formData.ano || !formData.pais || !formData.estado) {
            alert('Por favor completa todos los campos requeridos (*)');
            return;
        }

        if (!esMoneda && !formData.denominacion) {
            alert('Por favor completa la denominación del billete');
            return;
        }

        if (esMoneda && !formData.material) {
            alert('Por favor selecciona el material de la moneda');
            return;
        }

        const nuevoItem = {
            ...formData,
            id: itemEditando?.id || Date.now().toString()
        };

        if (itemEditando) {
            actualizarItem(nuevoItem);
        } else {
            agregarItem(nuevoItem, esMoneda ? 'monedas' : 'billetes');
        }

        setVista(esMoneda ? 'monedas' : 'billetes');
        setItemEditando(null);
    };

    return (
        <div className={`min-h-screen ${modoOscuro ? 'bg-[var(--bg-primary-dark)]' : 'bg-[var(--bg-primary-light)]'} p-4 md:p-6 pb-40`}>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => {
                        setVista(esMoneda ? 'monedas' : 'billetes');
                        setItemEditando(null);
                    }}
                    className="flex items-center gap-2 text-[var(--color-primary)] mb-4 hover:text-[var(--color-primary-hover)] font-semibold"
                >
                    <ArrowLeft size={20} />
                    Volver
                </button>

                <div className={`${modoOscuro ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 md:p-8`}>
                    <h2 className={`text-2xl md:text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} mb-6 flex items-center gap-3`}>
                        {esMoneda ? <Coins className="text-amber-500" size={32} /> : <Banknote className="text-green-500" size={32} />}
                        {itemEditando ? 'Editar' : 'Agregar'} {esMoneda ? 'Moneda' : 'Billete'}
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Nombre *
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                    }`}
                                placeholder={esMoneda ? "Ej: Moneda de 1 Dólar Liberty" : "Ej: Billete de 100 Dólares"}
                            />
                        </div>

                        {!esMoneda && (
                            <div>
                                <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Denominación *
                                </label>
                                <input
                                    type="text"
                                    value={formData.denominacion}
                                    onChange={(e) => setFormData({ ...formData, denominacion: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: 100, 50, 20"
                                />
                            </div>
                        )}

                        <div>
                            <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Descripción
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                    }`}
                                rows="3"
                                placeholder="Detalles adicionales..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Foto Frontal
                                </label>
                                {!Capacitor.isNativePlatform() && (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, (img) => setFormData({ ...formData, fotoFrontal: img }), esMoneda)}
                                        className="hidden"
                                        id="fotoFrontal"
                                    />
                                )}
                                {!formData.fotoFrontal ? (
                                    Capacitor.isNativePlatform() ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleCameraCapture((img) => setFormData({ ...formData, fotoFrontal: img }), esMoneda)}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors ${modoOscuro
                                                    ? 'border-gray-600 hover:border-indigo-500 bg-gray-700'
                                                    : 'border-gray-300 hover:border-indigo-500'
                                                    }`}
                                            >
                                                <Camera size={20} className="text-gray-400" />
                                                <span className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Cámara</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleGalleryPick((img) => setFormData({ ...formData, fotoFrontal: img }), esMoneda)}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors ${modoOscuro
                                                    ? 'border-gray-600 hover:border-green-500 bg-gray-700'
                                                    : 'border-gray-300 hover:border-green-500'
                                                    }`}
                                            >
                                                <Image size={20} className="text-green-500" />
                                                <span className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Galería</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="fotoFrontal"
                                            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${modoOscuro
                                                ? 'border-gray-600 hover:border-indigo-500 bg-gray-700'
                                                : 'border-gray-300 hover:border-indigo-500'
                                                }`}
                                        >
                                            <Camera size={20} className="text-gray-400" />
                                            <span className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Subir foto</span>
                                        </label>
                                    )
                                ) : (
                                    <div className="relative group">
                                        <img src={formData.fotoFrontal} alt="Frontal" className="w-full h-48 object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                            <label htmlFor="fotoFrontal" className="p-2 bg-white rounded-full cursor-pointer hover:bg-gray-100">
                                                <Camera size={20} className="text-gray-800" />
                                            </label>
                                            <button
                                                onClick={() => handleReEditImage(formData.fotoFrontal, (img) => setFormData({ ...formData, fotoFrontal: img }), esMoneda)}
                                                className="p-2 bg-[var(--color-primary)] rounded-full cursor-pointer hover:bg-[var(--color-primary-hover)] text-white"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Foto Trasera
                                </label>
                                {!Capacitor.isNativePlatform() && (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, (img) => setFormData({ ...formData, fotoTrasera: img }), esMoneda)}
                                        className="hidden"
                                        id="fotoTrasera"
                                    />
                                )}
                                {!formData.fotoTrasera ? (
                                    Capacitor.isNativePlatform() ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleCameraCapture((img) => setFormData({ ...formData, fotoTrasera: img }), esMoneda)}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors ${modoOscuro
                                                    ? 'border-gray-600 hover:border-indigo-500 bg-gray-700'
                                                    : 'border-gray-300 hover:border-indigo-500'
                                                    }`}
                                            >
                                                <Camera size={20} className="text-gray-400" />
                                                <span className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Cámara</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleGalleryPick((img) => setFormData({ ...formData, fotoTrasera: img }), esMoneda)}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors ${modoOscuro
                                                    ? 'border-gray-600 hover:border-green-500 bg-gray-700'
                                                    : 'border-gray-300 hover:border-green-500'
                                                    }`}
                                            >
                                                <Image size={20} className="text-green-500" />
                                                <span className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Galería</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="fotoTrasera"
                                            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${modoOscuro
                                                ? 'border-gray-600 hover:border-indigo-500 bg-gray-700'
                                                : 'border-gray-300 hover:border-indigo-500'
                                                }`}
                                        >
                                            <Camera size={20} className="text-gray-400" />
                                            <span className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Subir foto</span>
                                        </label>
                                    )
                                ) : (
                                    <div className="relative group">
                                        <img src={formData.fotoTrasera} alt="Trasera" className="w-full h-48 object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                            <label htmlFor="fotoTrasera" className="p-2 bg-white rounded-full cursor-pointer hover:bg-gray-100">
                                                <Camera size={20} className="text-gray-800" />
                                            </label>
                                            <button
                                                onClick={() => handleReEditImage(formData.fotoTrasera, (img) => setFormData({ ...formData, fotoTrasera: img }), esMoneda)}
                                                className="p-2 bg-[var(--color-primary)] rounded-full cursor-pointer hover:bg-[var(--color-primary-hover)] text-white"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Año *
                                </label>
                                <input
                                    type="text"
                                    value={formData.ano}
                                    onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: 1995"
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    País *
                                </label>
                                <CountrySelect
                                    value={formData.pais}
                                    onChange={(pais) => setFormData({ ...formData, pais })}
                                    countries={PAISES}
                                />
                            </div>
                        </div>

                        {esMoneda && (
                            <div>
                                <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Material *
                                </label>
                                <select
                                    value={formData.material}
                                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Seleccionar material</option>
                                    {materialesMoneda.map(mat => (
                                        <option key={mat} value={mat}>{mat}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Estado de Conservación *
                            </label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Seleccionar estado</option>
                                {estadosConservacion.map(est => (
                                    <option key={est} value={est}>{est}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Valor Comprado
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.valorComprado}
                                    onChange={(e) => setFormData({ ...formData, valorComprado: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                        }`}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Valor Venta Sugerido
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.valorVenta}
                                    onChange={(e) => setFormData({ ...formData, valorVenta: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${modoOscuro ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                        }`}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSubmit}
                                className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
                            >
                                {itemEditando ? 'Guardar Cambios' : 'Agregar ' + (esMoneda ? 'Moneda' : 'Billete')}
                            </button>
                            <button
                                onClick={() => {
                                    setVista(esMoneda ? 'monedas' : 'billetes');
                                    setItemEditando(null);
                                }}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {imagenEditando && tipoImagenEditando && (
                <ImageEditor
                    imagen={imagenEditando}
                    esMoneda={tipoImagenEditando.esMoneda}
                    modoOscuro={modoOscuro}
                    onSave={(imagenEditada) => {
                        tipoImagenEditando.callback(imagenEditada);
                        setImagenEditando(null);
                        setTipoImagenEditando(null);
                    }}
                    onCancel={() => {
                        setImagenEditando(null);
                        setTipoImagenEditando(null);
                    }}
                />
            )}

            {/* Cámara con overlay personalizado */}
            {showCameraOverlay && (
                <CameraOverlay
                    esMoneda={esMoneda}
                    onCapture={handleCameraOverlayCapture}
                    onCancel={handleCameraOverlayCancel}
                />
            )}
        </div>
    );
};

export default Formulario;
